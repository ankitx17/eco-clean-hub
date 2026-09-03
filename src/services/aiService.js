export async function classifyWaste(imageFile) {
  if (!imageFile) {
    throw new Error("No waste image provided.")
  }

  // Demo classifier for the Scanner UI.
  // This will be replaced with the real AI model/API integration.

  await new Promise((resolve) => setTimeout(resolve, 1800))

  return {
    category: "Plastic",
    type: "Recyclable",
    confidence: 96.4,
    guidance: [
      "Empty the container before disposal.",
      "Rinse it if possible.",
      "Place it with dry/recyclable waste.",
      "Avoid mixing it with wet waste.",
    ],
  }
}