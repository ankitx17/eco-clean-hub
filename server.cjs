const express = require("express")
const cors = require("cors")
const multer = require("multer")
require("dotenv").config()

const { GoogleGenAI } = require("@google/genai")

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

const CATEGORIES = [
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

const FALLBACK = {
  Plastic: [
    "Keep it clean and dry.",
    "Separate it from wet waste.",
    "Use the appropriate plastic recycling stream.",
  ],

  Paper: [
    "Keep it clean and dry.",
    "Keep food-soiled paper separate.",
    "Use the paper recycling stream.",
  ],

  Glass: [
    "Handle it carefully.",
    "Keep glass separate from wet waste.",
    "Use the appropriate glass recycling stream.",
  ],

  Metal: [
    "Keep it reasonably clean.",
    "Separate it from wet waste.",
    "Use the appropriate metal recycling stream.",
  ],

  Organic: [
    "Keep it separate from dry recyclables.",
    "Put it in the wet-waste stream.",
    "Compost it where appropriate.",
  ],

  "E-Waste": [
    "Do not put it in regular waste.",
    "Keep batteries and electronics separate.",
    "Use an authorized e-waste collection point.",
  ],

  Textile: [
    "Keep textiles clean and dry.",
    "Reuse or donate them when possible.",
    "Use a suitable textile collection point.",
  ],

  Hazardous: [
    "Keep it separate from normal waste.",
    "Do not mix it with recyclables.",
    "Use an authorized hazardous-waste facility.",
  ],

  Other: [
    "Keep the item separate.",
    "Do not mix unknown waste with recyclables.",
    "Check local disposal rules.",
  ],

  "Non-Waste": [
    "Capture an actual waste item.",
    "Keep the complete item visible.",
    "Avoid screenshots and empty scenes.",
  ],
}

const PROMPT = [
  "Classify the main visible object in this image for a waste-sorting app.",
  "Allowed categories: Plastic, Paper, Glass, Metal, Organic, E-Waste, Textile, Hazardous, Other, Non-Waste.",
  "Plastic means bottles, wrappers, bags, containers and plastic objects.",
  "Paper means paper, newspapers, cardboard, cartons and paper packaging.",
  "Glass means glass bottles, jars and glass objects.",
  "Metal means aluminium cans, steel tins and metal objects.",
  "Organic means food scraps, fruit waste, vegetable waste, leaves and biodegradable waste.",
  "E-Waste means phones, computers, chargers, cables, batteries and electronic devices.",
  "Textile means clothes, fabric and textile waste.",
  "Hazardous means clearly identifiable chemical, medical, sharp or dangerous waste.",
  "Other means visible physical waste that fits none of the categories above.",
  "Non-Waste means people, animals, scenery, buildings, screenshots, documents, screens, empty scenes, or objects that are not clearly waste.",
  "Use the primary material of the visible discarded object.",
  "Do not infer hidden material.",
  "Do not classify from text alone.",
  "Do not invent an object.",
  "A plastic bottle with a paper label is Plastic.",
  "A metal can with a plastic label is Metal.",
  "An electronic device is E-Waste even if its outer body is plastic.",
  "Return a short specific type.",
  "Return confidence from 0 to 100.",
  "Return exactly 3 short disposal instructions.",
  "If visual evidence is unclear, use Non-Waste and low confidence.",
  "Return only JSON.",
].join(" ")

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error("ERROR: GEMINI_API_KEY is missing from .env")
  process.exit(1)
}

const ai = new GoogleGenAI({
  apiKey,
})

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
  })
})

app.post(
  "/api/classify-waste",
  upload.single("image"),
  async (req, res) => {
    const controller = new AbortController()

    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 20000)

    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No waste image provided.",
        })
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Please upload a valid image.",
        })
      }

      if (!req.file.buffer || req.file.buffer.length === 0) {
        return res.status(400).json({
          error: "Uploaded image is empty.",
        })
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: [
          {
            inlineData: {
              mimeType: req.file.mimetype,
              data: req.file.buffer.toString("base64"),
            },
          },
          {
            text: PROMPT,
          },
        ],

        config: {
          abortSignal: controller.signal,

          thinkingConfig: {
            thinkingLevel: "minimal",
          },

          responseMimeType: "application/json",

          responseSchema: {
            type: "object",

            properties: {
              category: {
                type: "string",
                enum: CATEGORIES,
              },

              type: {
                type: "string",
              },

              confidence: {
                type: "integer",
                minimum: 0,
                maximum: 100,
              },

              guidance: {
                type: "array",
                items: {
                  type: "string",
                },
                minItems: 3,
                maxItems: 3,
              },
            },

            required: [
              "category",
              "type",
              "confidence",
              "guidance",
            ],
          },

          maxOutputTokens: 180,
        },
      })

      const text = response.text

      if (!text || !text.trim()) {
        throw new Error("AI returned an empty response.")
      }

      const result = JSON.parse(text.trim())

      const category = CATEGORIES.includes(result.category)
        ? result.category
        : "Other"

      const type =
        typeof result.type === "string" &&
        result.type.trim()
          ? result.type.trim()
          : category === "Non-Waste"
            ? "Not a waste item"
            : "Waste item"

      const rawConfidence = Number(result.confidence)

      const confidence = Number.isFinite(rawConfidence)
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(rawConfidence)
            )
          )
        : 0

      let guidance = FALLBACK[category]

      if (
        Array.isArray(result.guidance) &&
        result.guidance.length >= 3
      ) {
        const validGuidance = result.guidance
          .filter(
            (item) =>
              typeof item === "string" &&
              item.trim()
          )
          .slice(0, 3)

        if (validGuidance.length === 3) {
          guidance = validGuidance.map((item) =>
            item.trim()
          )
        }
      }

      console.log(
        `[AI] ${category} | ${confidence}% | ${type}`
      )

      return res.json({
        category,
        type,
        confidence,
        guidance,
      })
    } catch (error) {
      console.error(
        "Waste classification error:",
        error
      )

      if (
        error &&
        error.name === "AbortError"
      ) {
        return res.status(504).json({
          error:
            "AI analysis timed out. Please try again.",
        })
      }

      return res.status(500).json({
        error:
          "Failed to classify the waste image.",
        details:
          error && error.message
            ? error.message
            : "Unknown error.",
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }
)

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error("Server error:", error)

    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(413).json({
        error:
          "Image is too large. Maximum size is 10 MB.",
      })
    }

    return res.status(500).json({
      error: "Internal server error.",
    })
  }
)

app.listen(
  PORT,
  "127.0.0.1",
  () => {
    console.log(
      `Eco Clean Hub AI server running on http://127.0.0.1:${PORT}`
    )
    console.log(
      "Model: gemini-3.6-flash"
    )
    console.log(
      "Status: READY"
    )
  }
)