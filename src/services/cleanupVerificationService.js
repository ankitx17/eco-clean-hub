const API_URL =
  import.meta.env.VITE_AI_API_URL ||
  "http://127.0.0.1:3001"

const REQUEST_TIMEOUT = 90000

export async function verifyCleanupPhotos({
  beforePhoto,
  afterPhoto,
  actionPhoto,
}) {
  if (!beforePhoto) {
    throw new Error("Before photo is required.")
  }

  if (!afterPhoto) {
    throw new Error("After photo is required.")
  }

  if (!actionPhoto) {
    throw new Error("Action photo is required.")
  }

  const formData = new FormData()

  formData.append(
    "beforePhoto",
    beforePhoto,
  )

  formData.append(
    "afterPhoto",
    afterPhoto,
  )

  formData.append(
    "actionPhoto",
    actionPhoto,
  )

  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT)

  try {
    const response = await fetch(
      `${API_URL}/api/verify-cleanup`,
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
          "Failed to verify cleanup photos.",
      )
    }

    if (
      !data ||
      typeof data.verified !== "boolean" ||
      typeof data.score !== "number"
    ) {
      throw new Error(
        "AI returned an incomplete verification result.",
      )
    }

    return {
      verified: data.verified,

      score: Math.max(
        0,
        Math.min(
          100,
          Math.round(data.score),
        ),
      ),

      beforeValid: Boolean(
        data.beforeValid,
      ),

      afterValid: Boolean(
        data.afterValid,
      ),

      actionValid: Boolean(
        data.actionValid,
      ),

      sameAreaLikely: Boolean(
        data.sameAreaLikely,
      ),

      cleanupDetected: Boolean(
        data.cleanupDetected,
      ),

      reason:
        typeof data.reason === "string"
          ? data.reason.trim()
          : "",

      checks:
        Array.isArray(data.checks)
          ? data.checks
              .filter(
                (item) =>
                  typeof item === "string" &&
                  item.trim(),
              )
              .map((item) =>
                item.trim(),
              )
          : [],
    }
  } catch (error) {
    if (
      error.name === "AbortError"
    ) {
      throw new Error(
        "AI verification timed out. Please try again.",
      )
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}