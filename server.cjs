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

const MAX_UPLOAD_SIZE =
  10 * 1024 * 1024

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

/* --------------------------------------------------
   MULTER
-------------------------------------------------- */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_UPLOAD_SIZE,
  },

  fileFilter: (req, file, cb) => {
    if (
      !file.mimetype?.startsWith("image/")
    ) {
      cb(
        new Error(
          "Only image files are allowed.",
        ),
      )

      return
    }

    cb(null, true)
  },
})

/* --------------------------------------------------
   MIDDLEWARE
-------------------------------------------------- */

app.use(
  cors({
    origin: true,
  }),
)

app.use(express.json())

/* --------------------------------------------------
   HEALTH CHECK
-------------------------------------------------- */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      ok: true,
      provider: "Groq",
      model: MODEL,
    })
  },
)

/* --------------------------------------------------
   WASTE CATEGORY NORMALIZATION
-------------------------------------------------- */

function normalizeCategory(
  category,
) {
  if (
    typeof category !== "string"
  ) {
    return "Other"
  }

  const cleaned =
    category
      .trim()
      .toLowerCase()

  const match =
    ALLOWED_CATEGORIES.find(
      (item) =>
        item.toLowerCase() ===
        cleaned,
    )

  return match || "Other"
}

/* --------------------------------------------------
   WASTE RESULT NORMALIZATION
-------------------------------------------------- */

function normalizeResult(
  rawResult,
) {
  let parsed = rawResult

  if (
    typeof parsed === "string"
  ) {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      parsed = null
    }
  }

  if (
    !parsed ||
    typeof parsed !== "object"
  ) {
    throw new Error(
      "AI returned invalid JSON.",
    )
  }

  const category =
    normalizeCategory(
      parsed.category,
    )

  const type =
    typeof parsed.type ===
      "string" &&
    parsed.type.trim()
      ? parsed.type.trim()
      : "Unknown waste item"

  let confidence =
    Number(parsed.confidence)

  if (
    !Number.isFinite(
      confidence,
    )
  ) {
    confidence = 0
  }

  confidence = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        confidence,
      ),
    ),
  )

  const guidance =
    Array.isArray(
      parsed.guidance,
    )
      ? parsed.guidance
          .filter(
            (item) =>
              typeof item ===
                "string" &&
              item.trim(),
          )
          .map((item) =>
            item.trim(),
          )
          .slice(0, 5)
      : []

  return {
    category,

    type,

    confidence,

    guidance:
      guidance.length > 0
        ? guidance
        : FALLBACK_GUIDANCE[
            category
          ],
  }
}

/* --------------------------------------------------
   GROQ WASTE CLASSIFICATION
-------------------------------------------------- */

async function callGroq(
  imageBuffer,
  mimeType,
) {
  if (
    !process.env.GROQ_API_KEY
  ) {
    throw new Error(
      "GROQ_API_KEY is missing from the server environment.",
    )
  }

  const base64Image =
    imageBuffer.toString(
      "base64",
    )

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

  const controller =
    new AbortController()

  const timeoutId =
    setTimeout(() => {
      controller.abort()
    }, AI_TIMEOUT)

  try {
    const response =
      await fetch(
        GROQ_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

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

            reasoning_effort:
              "none",

            max_completion_tokens:
              512,

            response_format: {
              type: "json_object",
            },
          }),

          signal:
            controller.signal,
        },
      )

    const text =
      await response.text()

    let data = null

    try {
      data =
        JSON.parse(text)
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

      const error =
        new Error(errorMessage)

      error.status =
        response.status

      throw error
    }

    const content =
      data?.choices?.[0]
        ?.message?.content

    if (!content) {
      throw new Error(
        "Groq returned an empty AI response.",
      )
    }

    return normalizeResult(
      content,
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

/* --------------------------------------------------
   CLASSIFY WASTE
-------------------------------------------------- */

app.post(
  "/api/classify-waste",
  upload.single("image"),

  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error:
          "No waste image provided.",
      })
    }

    try {
      const result =
        await callGroq(
          req.file.buffer,
          req.file.mimetype,
        )

      return res.json(
        result,
      )
    } catch (error) {
      console.error(
        "Waste classification error:",
        error,
      )

      if (
        error.name ===
        "AbortError"
      ) {
        return res.status(504).json({
          error:
            "AI analysis timed out. Please try again.",
        })
      }

      if (
        error.status === 401
      ) {
        return res.status(500).json({
          error:
            "Groq API authentication failed. Check GROQ_API_KEY.",
        })
      }

      if (
        error.status === 429
      ) {
        return res.status(429).json({
          error:
            "Groq rate limit reached. Please try again later.",
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

/* ==================================================
   CLEANUP VERIFICATION
   ================================================== */

/* --------------------------------------------------
   CLEANUP VERIFICATION PROMPT
-------------------------------------------------- */

const CLEANUP_VERIFICATION_PROMPT = `
You are the cleanup verification AI for Eco Clean Hub.

You will receive exactly three images:

1. BEFORE PHOTO
2. AFTER PHOTO
3. ACTION PHOTO

Your job is to evaluate whether these photos provide credible visual evidence of a real cleanup activity.

IMPORTANT:

- Examine all three images together.
- Focus only on visible cleanup evidence.
- Do not judge people based on identity, appearance, gender, age, race, or other personal characteristics.
- Do not identify people.
- Do not claim GPS location is verified from the images.
- Do not claim timestamps are verified from the images.
- Do not invent information.
- If evidence is unclear, lower the score.
- Do not automatically verify a submission just because three photos were uploaded.

BEFORE PHOTO:

Check whether:
- It shows a real physical area.
- Visible waste, litter, dirt, or a cleanup need is present.
- The image is relevant to a cleanup activity.
- It is not simply an unrelated image, screenshot, document, or selfie.

AFTER PHOTO:

Check whether:
- It appears to show the same or substantially similar area as the BEFORE photo.
- The visible amount of waste appears reduced.
- The area appears cleaner.
- The image is relevant to the cleanup.

ACTION PHOTO:

Check whether:
- A cleanup activity is visibly taking place.
- A person or team is visibly collecting, handling, sorting, or cleaning waste.
- Cleanup-related objects such as trash bags, gloves, collection tools, or collected waste are visible when applicable.
- The image is relevant to the cleanup activity.

SAME AREA:

Compare BEFORE and AFTER using visible surroundings such as:
- buildings
- roads
- walls
- trees
- paths
- ground patterns
- fixed objects
- other environmental features

Do not require an exact pixel match.

CLEANUP DETECTED:

Consider cleanup evidence credible when:
- the BEFORE image shows a cleanup need,
- the AFTER image shows visible improvement,
- and the ACTION image provides supporting evidence of cleanup activity.

VERIFICATION:

A submission should be verified only when:
- BEFORE is valid,
- AFTER is valid,
- ACTION is valid,
- BEFORE and AFTER likely show the same area,
- and visible evidence supports that cleanup occurred.

SCORING:

90-100:
Strong visual evidence.

75-89:
Good evidence with some uncertainty.

60-74:
Mixed or incomplete evidence.

Below 60:
Weak or unreliable evidence.

If important visual evidence is missing, "verified" should normally be false.

Return ONLY valid JSON.

Return exactly this structure:

{
  "verified": true,
  "score": 92,
  "beforeValid": true,
  "afterValid": true,
  "actionValid": true,
  "sameAreaLikely": true,
  "cleanupDetected": true,
  "reason": "The before and after photos appear to show the same area with visibly less waste, while the action photo shows cleanup activity.",
  "checks": [
    "Before photo shows a cleanup area with visible waste.",
    "After photo shows the same area with visibly reduced waste.",
    "Action photo shows active cleanup activity.",
    "The three photos provide consistent visual evidence of cleanup."
  ]
}

Do not add markdown.
Do not add explanations outside JSON.
`

/* --------------------------------------------------
   GROQ CLEANUP VERIFICATION
-------------------------------------------------- */

async function callGroqCleanupVerification(
  beforeFile,
  afterFile,
  actionFile,
) {
  if (
    !process.env.GROQ_API_KEY
  ) {
    throw new Error(
      "GROQ_API_KEY is missing from the server environment.",
    )
  }

  const beforeBase64 =
    beforeFile.buffer.toString(
      "base64",
    )

  const afterBase64 =
    afterFile.buffer.toString(
      "base64",
    )

  const actionBase64 =
    actionFile.buffer.toString(
      "base64",
    )

  const beforeImage =
    `data:${beforeFile.mimetype};base64,${beforeBase64}`

  const afterImage =
    `data:${afterFile.mimetype};base64,${afterBase64}`

  const actionImage =
    `data:${actionFile.mimetype};base64,${actionBase64}`

  const controller =
    new AbortController()

  const timeoutId =
    setTimeout(() => {
      controller.abort()
    }, AI_TIMEOUT)

  try {
    const response =
      await fetch(
        GROQ_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

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

                    text:
                      CLEANUP_VERIFICATION_PROMPT,
                  },

                  {
                    type: "text",

                    text:
                      "IMAGE 1 — BEFORE PHOTO",
                  },

                  {
                    type: "image_url",

                    image_url: {
                      url: beforeImage,
                    },
                  },

                  {
                    type: "text",

                    text:
                      "IMAGE 2 — AFTER PHOTO",
                  },

                  {
                    type: "image_url",

                    image_url: {
                      url: afterImage,
                    },
                  },

                  {
                    type: "text",

                    text:
                      "IMAGE 3 — ACTION PHOTO",
                  },

                  {
                    type: "image_url",

                    image_url: {
                      url: actionImage,
                    },
                  },
                ],
              },
            ],

            temperature: 0.2,

            reasoning_effort:
              "none",

            max_completion_tokens:
              512,

            response_format: {
              type: "json_object",
            },
          }),

          signal:
            controller.signal,
        },
      )

    const text =
      await response.text()

    let data = null

    try {
      data =
        JSON.parse(text)
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

      const error =
        new Error(errorMessage)

      error.status =
        response.status

      throw error
    }

    const content =
      data?.choices?.[0]
        ?.message?.content

    if (!content) {
      throw new Error(
        "Groq returned an empty verification response.",
      )
    }

    let result = content

    if (
      typeof result ===
      "string"
    ) {
      try {
        result =
          JSON.parse(result)
      } catch {
        throw new Error(
          "AI verification returned invalid JSON.",
        )
      }
    }

    const beforeValid =
      Boolean(
        result.beforeValid,
      )

    const afterValid =
      Boolean(
        result.afterValid,
      )

    const actionValid =
      Boolean(
        result.actionValid,
      )

    const sameAreaLikely =
      Boolean(
        result.sameAreaLikely,
      )

    const cleanupDetected =
      Boolean(
        result.cleanupDetected,
      )

    let score =
      Number(result.score)

    if (
      !Number.isFinite(score)
    ) {
      score = 0
    }

    score = Math.max(
      0,
      Math.min(
        100,
        Math.round(score),
      ),
    )

    const reason =
      typeof result.reason ===
        "string" &&
      result.reason.trim()
        ? result.reason.trim()
        : "The AI could not provide a verification explanation."

    const checks =
      Array.isArray(
        result.checks,
      )
        ? result.checks
            .filter(
              (item) =>
                typeof item ===
                  "string" &&
                item.trim(),
            )
            .map((item) =>
              item.trim(),
            )
            .slice(0, 5)
        : []

    /*
      Final verification is determined
      by all required visual checks.
    */

    const verified =
      Boolean(
        result.verified,
      ) &&
      beforeValid &&
      afterValid &&
      actionValid &&
      sameAreaLikely &&
      cleanupDetected

    return {
      verified,

      score,

      beforeValid,

      afterValid,

      actionValid,

      sameAreaLikely,

      cleanupDetected,

      reason,

      checks,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

/* --------------------------------------------------
   VERIFY CLEANUP
-------------------------------------------------- */

app.post(
  "/api/verify-cleanup",

  upload.fields([
    {
      name: "beforePhoto",
      maxCount: 1,
    },

    {
      name: "afterPhoto",
      maxCount: 1,
    },

    {
      name: "actionPhoto",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    const beforeFile =
      req.files?.beforePhoto?.[0]

    const afterFile =
      req.files?.afterPhoto?.[0]

    const actionFile =
      req.files?.actionPhoto?.[0]

    if (
      !beforeFile ||
      !afterFile ||
      !actionFile
    ) {
      return res.status(400).json({
        error:
          "Before, After and Action photos are required.",
      })
    }

    try {
      const result =
        await callGroqCleanupVerification(
          beforeFile,
          afterFile,
          actionFile,
        )

      return res.json(
        result,
      )
    } catch (error) {
      console.error(
        "Cleanup verification error:",
        error,
      )

      if (
        error.name ===
        "AbortError"
      ) {
        return res.status(504).json({
          error:
            "AI verification timed out. Please try again.",
        })
      }

      if (
        error.status === 401
      ) {
        return res.status(500).json({
          error:
            "Groq API authentication failed. Check GROQ_API_KEY.",
        })
      }

      if (
        error.status === 429
      ) {
        return res.status(429).json({
          error:
            "Groq rate limit reached. Please try again later.",
        })
      }

      return res.status(500).json({
        error:
          "Failed to verify cleanup photos.",

        details:
          error.message,
      })
    }
  },
)

/* --------------------------------------------------
   MULTER / GENERAL ERROR HANDLER
-------------------------------------------------- */

app.use(
  (
    error,
    req,
    res,
    next,
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          error:
            "Image is too large. Maximum size is 10 MB.",
        })
      }

      return res.status(400).json({
        error:
          error.message,
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

/* --------------------------------------------------
   START SERVER
-------------------------------------------------- */

app.listen(
  PORT,
  "127.0.0.1",
  () => {
    console.log(
      `Eco Clean Hub AI server running on http://127.0.0.1:${PORT}`,
    )

    console.log(
      `Provider: Groq`,
    )

    console.log(
      `Model: ${MODEL}`,
    )

    console.log(
      `Status: READY`,
    )

    console.log(
      `Cleanup verification: ENABLED`,
    )
  },
)