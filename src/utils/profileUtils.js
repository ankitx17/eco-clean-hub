export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const maxSize = 512

        let width = image.width
        let height = image.height

        if (width > height) {
          if (width > maxSize) {
            height =
              (height * maxSize) / width

            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width =
              (width * maxSize) / height

            height = maxSize
          }
        }

        const canvas =
          document.createElement("canvas")

        canvas.width = width
        canvas.height = height

        const context =
          canvas.getContext("2d")

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        )

        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.78
          )
        )
      }

      image.onerror = reject
      image.src = reader.result
    }

    reader.onerror = reject

    reader.readAsDataURL(file)
  })
}