// La URL base pública de tu bucket de R2 desde variable de entorno
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL

// Verificar que la variable de entorno está definida
if (!R2_PUBLIC_URL) {
  console.error("⚠️ NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL no está definida en las variables de entorno")
}

/**
 * Construye la URL completa para un archivo en R2.
 * @param fileName - El nombre del archivo (incluyendo la ruta, ej: 'posts/user123/image.jpg')
 * @returns La URL pública completa de la imagen.
 */
export function getImageUrl(fileName: string): string {
  if (!R2_PUBLIC_URL) {
    console.warn("⚠️ R2_PUBLIC_URL no está definida, usando URL de placeholder")
    return `https://via.placeholder.com/800x600?text=R2+URL+Missing`
  }
  return `${R2_PUBLIC_URL}/${fileName}`
}

/**
 * Extrae el nombre del archivo de una URL de R2.
 * @param url - La URL completa de la imagen
 * @returns El nombre del archivo o null si no es una URL válida
 */
export function getFileNameFromUrl(url: string): string | null {
  if (!R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) {
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
  if (!R2_PUBLIC_URL) return false
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
