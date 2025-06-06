// La URL base pública de tu bucket de R2.
const R2_PUBLIC_URL = "https://pub-e8d3b4b205fb43fb94d31b9b3a69f016.r2.dev"

/**
 * Construye la URL completa para un archivo en R2.
 * @param fileName - El nombre del archivo (incluyendo la ruta, ej: 'posts/user123/image.jpg')
 * @returns La URL pública completa de la imagen.
 */
export function getImageUrl(fileName: string): string {
  return `${R2_PUBLIC_URL}/${fileName}`
}

/**
 * Extrae el nombre del archivo de una URL de R2.
 * @param url - La URL completa de la imagen
 * @returns El nombre del archivo o null si no es una URL válida
 */
export function getFileNameFromUrl(url: string): string | null {
  if (!url.startsWith(R2_PUBLIC_URL)) {
    return null
  }
  return url.replace(`${R2_PUBLIC_URL}/`, "")
}

/**
 * Verifica si una URL es de nuestro bucket de R2.
 * @param url - La URL a verificar
 * @returns true si es una URL de nuestro R2
 */
export function isR2Url(url: string): boolean {
  return url.startsWith(R2_PUBLIC_URL)
}

/**
 * Genera un nombre de archivo único para subir a R2.
 * @param userId - ID del usuario
 * @param originalFileName - Nombre original del archivo
 * @returns Nombre de archivo único con ruta
 */
export function generateFileName(userId: string, originalFileName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(7)
  const fileExtension = originalFileName.split(".").pop() || "jpg"
  return `posts/${userId}/${timestamp}-${randomString}.${fileExtension}`
}
