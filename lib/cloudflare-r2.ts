const R2_PUBLIC_URL = "https://pub-e8d3b4b205fb43f594d31b93a69f816.r2.dev"

export function getImageUrl(fileName: string): string {
  return `${R2_PUBLIC_URL}/${fileName}`
}

export async function uploadToR2(file: File, fileName: string) {
  // Implementación de subida usando la API de R2
  const formData = new FormData()
  formData.append("file", file)
  formData.append("fileName", fileName)

  const response = await fetch("/api/upload/r2", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Error uploading file")
  }

  const { url } = await response.json()
  return url
}
