import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 })
}
// Configuración del cliente S3 para R2
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  },
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const customFileName = formData.get("fileName") as string

    if (!file) {
      return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 })
    }

    // Generar nombre único si no se proporciona
    const fileName = customFileName || `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`

    // Convertir File a Buffer para S3
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir a R2
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME || "pixbae-storage",
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    })

    await S3.send(command)

    // Generar URL pública
    const publicUrl = `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    })
  } catch (error) {
    console.error("Error uploading to R2:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
