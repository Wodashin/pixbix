// Esta versión no usa @aws-sdk/client-s3
export async function uploadImageToR2(file: File, fileName: string): Promise<string> {
  try {
    // Crear FormData para la petición
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileName", fileName)

    // Enviar a nuestro propio endpoint
    const response = await fetch("/api/upload/simple", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Error uploading image")
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error uploading to R2:", error)
    throw new Error("Error al subir imagen")
  }
}
