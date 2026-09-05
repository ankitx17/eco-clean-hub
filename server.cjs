const express = require("express")
const cors = require("cors")
const multer = require("multer")
require("dotenv").config()

const app = express()

const PORT = 3001
const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions"

const MODEL = "qwen/qwen3.6-27b"

const AI_TIMEOUT = 60000
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024

const ALLOWED_CATEGORIES = [
  "Plastic",
  "Paper",
  "Glass",
  "Metal",
  "Organic",
  "E-Waste",
  "Textile",
  "Hazardous",
  "Other",
  "Non-Waste",
]

const FALLBACK_GUIDANCE = {
  Plastic: [
    "Clean the plastic item if possible.",
    "Separate recyclable plastic from other waste.",
    "Place it in the appropriate dry-waste or recycling stream.",
  ],

  Paper: [
    "Keep paper clean and dry.",
    "Separate paper from wet or contaminated waste.",
    "Place it in the dry-waste recycling stream.",
  ],

  Glass: [
    "Handle glass carefully to avoid injury.",
    "Separate glass from other waste.",
    "Place it in an appropriate glass recycling stream.",
  ],

  Metal: [
    "Separate metal from mixed waste.",
    "Keep recyclable metal clean when possible.",
    "Send it to a suitable recycling facility.",
  ],

  Organic: [
    "Keep organic waste separate from dry waste.",
    "Use composting or the appropriate wet-waste collection system.",
    "Avoid mixing plastic or other recyclable materials with it.",
  ],

  "E-Waste": [
    "Do not dispose of electronic waste with normal household waste.",
    "Keep batteries and electronic components separate.",
    "Send e-waste to an authorized e-waste recycler or collection centre.",
  ],

  Textile: [
    "Keep reusable clothes and textiles separate.",
    "Donate reusable items when possible.",
    "Send damaged textiles to an appropriate textile recovery or recycling facility.",
  ],

  Hazardous: [
    "Do not mix hazardous material with normal household waste.",
    "Avoid direct contact with the material.",
    "Use an authorized hazardous-waste collection or disposal facility.",
  ],

  Other: [
    "Keep the item separate until its material is identified.",
    "Check local waste-management instructions.",
    "Use an appropriate collection or recycling facility.",
  ],

  "Non-Waste": [
    "This image does not appear to contain a waste item.",
    "Try scanning a clear image of the waste item.",
  ],
}

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_UPLOAD_SIZE,
  },

  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new Error("Only image files are allowed."))
      return
    }

    cb(null, true)
  },
})

app.use(
  cors({
    origin: true,
  }),
)

app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    provider: "Groq",
    model: MODEL,
  })
})

function normalizeCategory(category) {
  if (typeof category !== "string") {
    return "Other"
  }

  const cleaned = category.trim().toLowerCase()

  const match = ALLOWED_CATEGORIES.find(
    (item) => item.toLowerCase() === cleaned,
  )

  return match || "Other"
}

function normalizeResult(rawResult) {
  let parsed = rawResult

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      parsed = null
    }
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI returned invalid JSON.")
  }

  const category = normalizeCategory(parsed.category)

  const type =
    typeof parsed.type === "string" &&
    parsed.type.trim()
      ? parsed.type.trim()
      : "Unknown waste item"

  let confidence = Number(parsed.confidence)

  if (!Number.isFinite(confidence)) {
    confidence = 0
  }

  confidence = Math.max(
    0,
    Math.min(100, Math.round(confidence)),
  )

  const guidance = Array.isArray(parsed.guidance)
    ? parsed.guidance
        .filter(
          (item) =>
            typeof item === "string" &&
            item.trim(),
        )
        .map((item) => item.trim())
        .slice(0, 5)
    : []

  return {
    category,
    type,
    confidence,
    guidance:
      guidance.length > 0
        ? guidance
        : FALLBACK_GUIDANCE[category],
  }
}

async function callGroq(imageBuffer, mimeType) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is missing from the server environment.",
    )
  }

  const base64Image =
    imageBuffer.toString("base64")

  const imageDataUrl =
    `data:${mimeType};base64,${base64Image}`

  const prompt = `
You are a waste-management classification assistant for Eco Clean Hub.

Analyze the provided image carefully.

Classify the main visible item into exactly one of these categories:

Plastic
Paper
Glass
Metal
Organic
E-Waste
Textile
Hazardous
Other
Non-Waste

Rules:

1. Return ONLY valid JSON.
2. Do not use markdown.
3. "category" must be exactly one of the allowed categories.
4. "type" should briefly identify the visible item.
5. "confidence" must be a number from 0 to 100.
6. "guidance" must contain 2 to 5 short practical disposal instructions.
7. If the image does not clearly contain waste, use "Non-Waste".
8. Do not invent details that cannot reasonably be seen.
9. If uncertain, choose "Other" rather than guessing a specific material.

Return exactly this structure:

{
  "category": "Plastic",
  "type": "Plastic bottle",
  "confidence": 94,
  "guidance": [
    "Empty and rinse the bottle if possible.",
    "Keep it separate from wet waste.",
    "Send it to a suitable recycling stream."
  ]
}
`

  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, AI_TIMEOUT)

  try {
    const response = await fetch(
      GROQ_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${process.env.GROQ_API_KEY}`,
        },

        body: JSON.stringify({
          model: MODEL,

          messages: [
            {
              role: "user",

              content: [
                {
                  type: "text",
                  text: prompt,
                },

                {
                  type: "image_url",

                  image_url: {
                    url: imageDataUrl,
                  },
                },
              ],
            },
          ],
          temperature: 0.2,
reasoning_effort: "none",
max_completion_tokens: 512,
response_format: {
  type: "json_object",
},
}),
        signal: controller.signal,
      },
    )

    const text = await response.text()

    let data = null

    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(
        "Groq returned an invalid server response.",
      )
    }

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.error ||
        `Groq API request failed with status ${response.status}.`

      const error = new Error(errorMessage)

      error.status = response.status

      throw error
    }

    const content =
      data?.choices?.[0]?.message?.content

    if (!content) {
      throw new Error(
        "Groq returned an empty AI response.",
      )
    }

    return normalizeResult(content)
  } finally {
    clearTimeout(timeoutId)
  }
}

app.post(
  "/api/classify-waste",
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "No waste image provided.",
      })
    }

    try {
      const result = await callGroq(
        req.file.buffer,
        req.file.mimetype,
      )

      return res.json(result)
    } catch (error) {
      console.error(
        "Waste classification error:",
        error,
      )

      if (error.name === "AbortError") {
        return res.status(504).json({
          error:
            "AI analysis timed out. Please try again.",
        })
      }

      if (error.status === 401) {
        return res.status(500).json({
          error:
            "Groq API authentication failed. Check GROQ_API_KEY.",
        })
      }

      if (error.status === 429) {
        return res.status(429).json({
          error:
            "Groq free-tier rate limit reached. Please try again later.",
        })
      }

      return res.status(500).json({
        error:
          error.message ||
          "Failed to classify waste.",
      })
    }
  },
)

app.use(
  (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error:
            "Image is too large. Maximum size is 10 MB.",
        })
      }

      return res.status(400).json({
        error: error.message,
      })
    }

    if (error) {
      return res.status(400).json({
        error:
          error.message ||
          "Invalid request.",
      })
    }

    next()
  },
)

app.listen(PORT, "127.0.0.1", () => {
  console.log(
    `Eco Clean Hub AI server running on http://127.0.0.1:${PORT}`,
  )

  console.log(`Provider: Groq`)
  console.log(`Model: ${MODEL}`)
  console.log(`Status: READY`)
})