export async function classifyWaste(imageFile) {
  if (!imageFile) {
    throw new Error("No waste image provided.")
  }

  const formData = new FormData()
  formData.append("image", imageFile)

  const response = await fetch(
    "http://127.0.0.1:3001/api/classify-waste",
    {
      method: "POST",
      body: formData,
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.details || data.error || "Failed to classify waste."
    )
  }

  return data
}