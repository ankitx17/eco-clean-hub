const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error("Image file is required.")
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary configuration is missing. Check your .env file."
    )
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(
      "Only image files can be uploaded."
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      "Image size should be less than 5MB."
    )
  }

  const formData = new FormData()

  formData.append("file", file)
  formData.append(
    "upload_preset",
    UPLOAD_PRESET
  )

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  )

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok || !data?.secure_url) {
    throw new Error(
      data?.error?.message ||
        "Cloudinary image upload failed. Please try again."
    )
  }

  return {
    url: data.secure_url,
    publicId: data.public_id || "",
    originalFilename: file.name,
  }
}