const express = require("express")
const cors = require("cors")
const multer = require("multer")
require("dotenv").config()

const app = express()
const PORT = 3001

app.use(cors())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

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

let ai

async function startServer() {
  const { GoogleGenAI } = await import("@google/genai")

  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  })

  app.get("/api/health", (req, res) => {
    res.json({ ok: true })
  })

  app.post(
    "/api/classify-waste",
    upload.single("image"),
    async (req, res) => {
      const controller = new AbortController()

      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 25000)

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

        const base64Image =
          req.file.buffer.toString("base64")

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",

          contents: [
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Image,
              },
            },
            {
              text: `
You are Eco Clean Hub's waste classification AI.

Your ONLY job is to identify whether the image contains a real physical waste item and classify that item.

IMPORTANT:
- Look at the actual image carefully.
- Identify the primary physical object.
- Do NOT classify people, faces, body parts, animals, scenery, buildings, screenshots, documents, computer screens, app interfaces, text-only images, or empty scenes as waste.
- If the image does not clearly show a physical waste item, return category "Non-Waste".
- Never invent a waste item.
- If the object is unclear or there is not enough visual evidence, return "Non-Waste".
- Classify according to the material of the physical waste item.

Allowed categories:
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

Examples:
- Plastic bottle → Plastic
- Plastic wrapper → Plastic
- Newspaper → Paper
- Cardboard box → Paper
- Glass bottle → Glass
- Metal can → Metal
- Food scraps → Organic
- Vegetable waste → Organic
- Mobile phone → E-Waste
- Battery → E-Waste
- Clothes → Textile
- Chemical container / dangerous chemical waste → Hazardous
- Physical waste that does not fit another category → Other
- Person / face / animal / document / screenshot / scenery / empty image → Non-Waste

For "type":
- Give a short, useful description such as "Plastic bottle", "Paper packaging", "Glass bottle", "Food waste", "Electronic device", or "Not a waste item".
- For Non-Waste, type must clearly explain why it is not waste.

For "guidance":
- Give 3 short practical disposal instructions.
- For Non-Waste, give 3 short instructions telling the user to capture a clear image of an actual waste item.

Confidence:
- Return an integer from 0 to 100.
- High confidence only when the physical object and material are visually clear.
- Use lower confidence when visibility is poor or classification is uncertain.

Return ONLY JSON.
Do not use markdown.
Do not add any text outside JSON.
              `,
            },
          ],

          config: {
            thinkingConfig: {
              thinkingLevel: "minimal",
            },

            responseFormat: {
              text: {
                mimeType: "application/json",

                schema: {
                  type: "object",

                  properties: {
                    category: {
                      type: "string",
                      enum: ALLOWED_CATEGORIES,
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
              },
            },

            maxOutputTokens: 220,
          },
        })

        const text = response.text?.trim()

        if (!text) {
          throw new Error(
            "AI returned an empty response."
          )
        }

        const result = JSON.parse(text)

        const category = ALLOWED_CATEGORIES.includes(
          result.category
        )
          ? result.category
          : "Non-Waste"

        const type =
          typeof result.type === "string" &&
          result.type.trim()
            ? result.type.trim()
            : category === "Non-Waste"
              ? "Not a waste item"
              : "Waste item"

        const confidence = Math.max(
          0,
          Math.min(
            100,
            Math.round(
              Number(result.confidence) || 0
            )
          )
        )

        const guidance = Array.isArray(
          result.guidance
        )
          ? result.guidance
              .filter(
                (item) =>
                  typeof item === "string" &&
                  item.trim()
              )
              .slice(0, 3)
          : []

        while (guidance.length < 3) {
          guidance.push(
            category === "Non-Waste"
              ? "Capture a clear image of an actual waste item."
              : "Follow your local waste disposal guidelines."
          )
        }

        res.json({
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

        if (error.name === "AbortError") {
          return res.status(504).json({
            error:
              "AI analysis timed out. Please try a clearer image.",
          })
        }

        res.status(500).json({
          error:
            "Failed to classify the waste image.",
          details: error.message,
        })
      } finally {
        clearTimeout(timeoutId)
      }
    }
  )

  app.listen(
    PORT,
    "127.0.0.1",
    () => {
      console.log(
        `Eco Clean Hub AI server running on http://127.0.0.1:${PORT}`
      )
    }
  )
}

startServer().catch((error) => {
  console.error(
    "Failed to start AI server:",
    error
  )

  process.exit(1)
})