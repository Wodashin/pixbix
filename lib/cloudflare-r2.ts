// 🔒 USA VARIABLE DE ENTORNO CON FALLBACK QUE FUNCIONABA
const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;
/**
 * Construye la URL completa para un archivo en R2.
 * @param fileName - El nombre del archivo generado por el backend.
 * @returns La URL pública completa de la imagen.
 */
export function getImageUrl(fileName: string): string {
  // Se asegura de no añadir una doble barra si la URL base ya tiene una al final.
  return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;
}

/**
 * Extrae el nombre del archivo de una URL de R2.
 * @param url - La URL completa de la imagen.
 * @returns El nombre del archivo o null si no es una URL válida.
 */
export function getFileNameFromUrl(url: string): string | null {
  if (!R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) {
    return null;
  }
  return url.replace(`${R2_PUBLIC_URL.replace(/\/$/, '')}/`, "");
}

/**
 * Verifica si una URL pertenece a nuestro bucket de R2.
 * @param url - La URL a verificar.
 * @returns true si es una URL de nuestro R2.
 */
export function isR2Url(url: string): boolean {
  return !!R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL);
}

// La función generateFileName() ha sido eliminada para evitar duplicar la lógica del backend.
// El backend (route.ts) es el único responsable de generar el nombre del archivo.
