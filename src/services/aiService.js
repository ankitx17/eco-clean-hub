const API_URL =
  import.meta.env.VITE_AI_API_URL ||
  "http://127.0.0.1:3001/api/classify-waste"

const MAX_IMAGE_DIMENSION = 1280
const JPEG_QUALITY = 0.82
const MAX_AI_IMAGE_SIZE = 1.5 * 1024 * 1024
const REQUEST_TIMEOUT = 90000

const optimizeImageForAI = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("Invalid image file."))
      return
    }

    if (
      file.size <= MAX_AI_IMAGE_SIZE &&
      file.type === "image/jpeg"
    ) {
      resolve(file)
      return
    }

    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const originalWidth = image.naturalWidth
      const originalHeight = image.naturalHeight

      if (!originalWidth || !originalHeight) {
        reject(
          new Error(
            "Unable to read image dimensions.",
          ),
        )
        return
      }

      const largestSide = Math.max(
        originalWidth,
        originalHeight,
      )

      const scale =
        largestSide > MAX_IMAGE_DIMENSION
          ? MAX_IMAGE_DIMENSION / largestSide
          : 1

      const width = Math.max(
        1,
        Math.round(originalWidth * scale),
      )

      const height = Math.max(
        1,
        Math.round(originalHeight * scale),
      )

      const canvas =
        document.createElement("canvas")

      canvas.width = width
      canvas.height = height

      const context =
        canvas.getContext("2d")

      if (!context) {
        reject(
          new Error(
            "Unable to process image.",
          ),
        )
        return
      }

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = "high"

      context.drawImage(
        image,
        0,
        0,
        width,
        height,
      )

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Unable to optimize image.",
              ),
            )
            return
          }

          if (
            blob.size >= file.size &&
            file.size <= MAX_AI_IMAGE_SIZE
          ) {
            resolve(file)
            return
          }

          const optimizedFile =
            new File(
              [blob],
              `eco-scan-${Date.now()}.jpg`,
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              },
            )

          resolve(optimizedFile)
        },
        "image/jpeg",
        JPEG_QUALITY,
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)

      reject(
        new Error(
          "Unable to load image for processing.",
        ),
      )
    }

    image.src = objectUrl
  })
}

export async function classifyWaste(
  imageFile,
) {
  if (!imageFile) {
    throw new Error(
      "No waste image provided.",
    )
  }

  const optimizedImage =
    await optimizeImageForAI(imageFile)

  const formData = new FormData()

  formData.append(
    "image",
    optimizedImage,
  )

  const controller =
    new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT)

  try {
    const response = await fetch(
      API_URL,
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      },
    )

    let data

    try {
      data = await response.json()
    } catch {
      throw new Error(
        "AI server returned an invalid response.",
      )
    }

    if (!response.ok) {
      throw new Error(
        data?.details ||
          data?.error ||
          "Failed to classify waste.",
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
        "AI returned an incomplete classification result.",
      )
    }

    return {
      category:
        data.category.trim(),

      type:
        data.type.trim(),

      confidence: Math.max(
        0,
        Math.min(
          100,
          Math.round(
            data.confidence,
          ),
        ),
      ),

      guidance:
        data.guidance
          .filter(
            (item) =>
              typeof item ===
              "string",
          )
          .map((item) =>
            item.trim(),
          )
          .filter(Boolean),
    }
  } catch (error) {
    if (
      error.name ===
      "AbortError"
    ) {
      throw new Error(
        "AI analysis timed out. Please try again.",
      )
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}