const API_URL =
  import.meta.env.VITE_AI_API_URL ||
  "http://127.0.0.1:3001"

const REQUEST_TIMEOUT = 90000

const MAX_IMAGE_DIMENSION = 1280

const MAX_IMAGE_SIZE = 900 * 1024

const JPEG_QUALITY = 0.78

const optimizeImageForVerification = (
  file,
) => {
  return new Promise(
    (resolve, reject) => {
      if (
        !file ||
        !file.type?.startsWith("image/")
      ) {
        reject(
          new Error(
            "Invalid image file.",
          ),
        )

        return
      }

      const image =
        new Image()

      const objectUrl =
        URL.createObjectURL(
          file,
        )

      image.onload = () => {
        URL.revokeObjectURL(
          objectUrl,
        )

        const originalWidth =
          image.naturalWidth

        const originalHeight =
          image.naturalHeight

        if (
          !originalWidth ||
          !originalHeight
        ) {
          reject(
            new Error(
              "Unable to read image dimensions.",
            ),
          )

          return
        }

        const largestSide =
          Math.max(
            originalWidth,
            originalHeight,
          )

        const scale =
          largestSide >
          MAX_IMAGE_DIMENSION
            ? MAX_IMAGE_DIMENSION /
              largestSide
            : 1

        const width =
          Math.max(
            1,
            Math.round(
              originalWidth *
                scale,
            ),
          )

        const height =
          Math.max(
            1,
            Math.round(
              originalHeight *
                scale,
            ),
          )

        const canvas =
          document.createElement(
            "canvas",
          )

        canvas.width =
          width

        canvas.height =
          height

        const context =
          canvas.getContext(
            "2d",
          )

        if (!context) {
          reject(
            new Error(
              "Unable to process image.",
            ),
          )

          return
        }

        context.imageSmoothingEnabled =
          true

        context.imageSmoothingQuality =
          "high"

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

            const optimizedFile =
              new File(
                [blob],
                `cleanup-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 7)}.jpg`,
                {
                  type: "image/jpeg",
                  lastModified:
                    Date.now(),
                },
              )

            resolve(
              optimizedFile,
            )
          },
          "image/jpeg",
          JPEG_QUALITY,
        )
      }

      image.onerror = () => {
        URL.revokeObjectURL(
          objectUrl,
        )

        reject(
          new Error(
            "Unable to load image for processing.",
          ),
        )
      }

      image.src =
        objectUrl
    },
  )
}

const optimizeAllPhotos =
  async ({
    beforePhoto,
    afterPhoto,
    actionPhoto,
  }) => {
    const [
      optimizedBefore,
      optimizedAfter,
      optimizedAction,
    ] = await Promise.all([
      optimizeImageForVerification(
        beforePhoto,
      ),

      optimizeImageForVerification(
        afterPhoto,
      ),

      optimizeImageForVerification(
        actionPhoto,
      ),
    ])

    return {
      beforePhoto:
        optimizedBefore,

      afterPhoto:
        optimizedAfter,

      actionPhoto:
        optimizedAction,
    }
  }

export async function verifyCleanupPhotos({
  beforePhoto,
  afterPhoto,
  actionPhoto,
}) {
  if (!beforePhoto) {
    throw new Error(
      "Before photo is required.",
    )
  }

  if (!afterPhoto) {
    throw new Error(
      "After photo is required.",
    )
  }

  if (!actionPhoto) {
    throw new Error(
      "Action photo is required.",
    )
  }

  /*
   * Compress all three photos before
   * sending them to the AI server.
   */
  const optimizedPhotos =
    await optimizeAllPhotos({
      beforePhoto,
      afterPhoto,
      actionPhoto,
    })

  const formData =
    new FormData()

  formData.append(
    "beforePhoto",
    optimizedPhotos.beforePhoto,
  )

  formData.append(
    "afterPhoto",
    optimizedPhotos.afterPhoto,
  )

  formData.append(
    "actionPhoto",
    optimizedPhotos.actionPhoto,
  )

  const controller =
    new AbortController()

  const timeoutId =
    setTimeout(() => {
      controller.abort()
    }, REQUEST_TIMEOUT)

  try {
    const response =
      await fetch(
        `${API_URL}/api/verify-cleanup`,
        {
          method: "POST",
          body: formData,
          signal:
            controller.signal,
        },
      )

    let data

    try {
      data =
        await response.json()
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
      typeof data.verified !==
        "boolean" ||
      typeof data.score !==
        "number"
    ) {
      throw new Error(
        "AI returned an incomplete verification result.",
      )
    }

    return {
      verified:
        data.verified,

      score: Math.max(
        0,
        Math.min(
          100,
          Math.round(
            data.score,
          ),
        ),
      ),

      beforeValid:
        Boolean(
          data.beforeValid,
        ),

      afterValid:
        Boolean(
          data.afterValid,
        ),

      actionValid:
        Boolean(
          data.actionValid,
        ),

      sameAreaLikely:
        Boolean(
          data.sameAreaLikely,
        ),

      cleanupDetected:
        Boolean(
          data.cleanupDetected,
        ),

      reason:
        typeof data.reason ===
        "string"
          ? data.reason.trim()
          : "",

      checks:
        Array.isArray(
          data.checks,
        )
          ? data.checks
              .filter(
                (item) =>
                  typeof item ===
                    "string" &&
                  item.trim(),
              )
              .map(
                (item) =>
                  item.trim(),
              )
          : [],
    }
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      throw new Error(
        "AI verification timed out. Please try again.",
      )
    }

    throw error
  } finally {
    clearTimeout(
      timeoutId,
    )
  }
}