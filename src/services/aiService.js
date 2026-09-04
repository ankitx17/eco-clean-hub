const API_URL = "http://127.0.0.1:3001/api/classify-waste"

export async function classifyWaste(imageFile) {
  if (!imageFile) {
    throw new Error("No waste image provided.")
  }

  const formData = new FormData()
  formData.append("image", imageFile)

  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 30000)

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    let data

    try {
      data = await response.json()
    } catch {
      throw new Error("AI server returned an invalid response.")
    }

    if (!response.ok) {
      throw new Error(
        data?.details ||
          data?.error ||
          "Failed to classify waste."
      )
    }

    if (
      !data ||
      typeof data.category !== "string" ||
      typeof data.type !== "string" ||
      typeof data.confidence !== "number" ||
      !Array.isArray(data.guidance)
    ) {
      throw new Error(
        "AI returned an incomplete classification result."
      )
    }

    return {
      category: data.category,
      type: data.type,
      confidence: Math.max(
        0,
        Math.min(100, Math.round(data.confidence))
      ),
      guidance: data.guidance.filter(
        (item) => typeof item === "string"
      ),
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "AI analysis timed out. Please try a clearer image."
      )
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}