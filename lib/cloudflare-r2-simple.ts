import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Configuración del cliente S3 para R2
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://725ac9ee1abc5db9eb167d6ac620818.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  },
})

export async function uploadImageToR2(file: File, fileName: string): Promise<string> {
  try {
    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir a R2
    const command = new PutObjectCommand({
      Bucket: "pixbae-storage",
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    })

    await S3.send(command)

    // Generar URL pública
    const publicUrl = `https://pub-e8d3b4b205fb43f594d31b93a69f816.r2.dev/${fileName}`

    return publicUrl
  } catch (error) {
    console.error("Error uploading to R2:", error)
    throw new Error("Error al subir imagen")
  }
}
