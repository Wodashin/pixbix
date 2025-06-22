import { type NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export async function POST(request: NextRequest) {
  try {
    const headerEmail = request.headers.get("x-user-email")

    // Es una buena práctica verificar si el email viene en el header
    if (!headerEmail) {
      return NextResponse.json({ error: "No autorizado, falta email de usuario" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 })
    }

    // --- Lectura de Variables de Entorno ---
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID
    const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY
    const bucketName = process.env.CLOUDFLARE_BUCKET_NAME

    // Verificación de que todas las variables necesarias existen
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      console.error("Error: Faltan una o más variables de entorno de Cloudflare R2.")
      throw new Error("Configuración del servidor incompleta para la subida de archivos.")
    }

    // --- Lógica para Generar Nombre de Archivo Único ---
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExtension = file.name.split(".").pop() || "jpg"
    // Usamos una ruta simple para el ejemplo, puedes ajustarla si es necesario
    const fileName = `posts/uploads/${timestamp}-${randomString}.${fileExtension}`

    // --- Configuración del Cliente S3 ---
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    })

    const buffer = Buffer.from(await file.arrayBuffer())

    // --- Envío del Comando de Subida ---
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }),
    )

    // --- Construcción de la URL Pública ---
    // Asegúrate de que esta variable de entorno esté configurada en Vercel
    const publicUrlBase = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL
if (!publicUrlBase) {
  throw new Error("La URL pública de R2 no está configurada en las variables de entorno.")
}
    const publicUrl = `${publicUrlBase}/${fileName}`

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Error en la subida de imagen:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
