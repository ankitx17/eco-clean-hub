console.log("SERVER FILE STARTED")
console.log("GEMINI KEY PRESENT:", !!process.env.GEMINI_API_KEY)

import express from "express"
import cors from "cors"
import multer from "multer"
import { GoogleGenAI } from "@google/genai"
import "dotenv/config"

const app = express()
const PORT = 3001

app.use(cors())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

app.get("/api/health", (req, res) => {
  res.json({ ok: true })
})

app.post("/api/classify-waste", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No waste image provided.",
      })
    }

    const base64Image = req.file.buffer.toString("base64")

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: base64Image,
          },
        },
        {
          text: `
You are a waste classification assistant for Eco Clean Hub.

Analyze the uploaded waste image.

Choose the most appropriate category from:
Plastic, Paper, Glass, Metal, Organic, E-Waste, Textile, Other.

Return ONLY valid JSON in this exact format:

{
  "category": "Plastic",
  "type": "Recyclable",
  "confidence": 95,
  "guidance": [
    "Guidance point 1",
    "Guidance point 2",
    "Guidance point 3"
  ]
}

Rules:
- category must be one of the categories listed above.
- confidence must be a number from 0 to 100.
- type should briefly describe the disposal/recycling type.
- guidance must contain 3 or 4 practical disposal instructions.
- Do not use markdown.
- Do not add explanations outside the JSON.
          `,
        },
      ],
    })

    const text = response.text?.trim()

    if (!text) {
      throw new Error("AI returned an empty response.")
    }

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    const result = JSON.parse(cleanedText)

    res.json({
      category: result.category || "Other",
      type: result.type || "Please check local disposal guidance.",
      confidence: Number(result.confidence) || 0,
      guidance: Array.isArray(result.guidance)
        ? result.guidance
        : ["Please check local waste disposal guidelines."],
    })
  } catch (error) {
    console.error("Waste classification error:", error)

    res.status(500).json({
      error: "Failed to classify the waste image.",
    })
  }
})

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(
    `Eco Clean Hub AI server running on http://127.0.0.1:${PORT}`
  )
})

server.on("error", (error) => {
  console.error("Server error:", error)
})