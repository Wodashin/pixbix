import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/utils/supabase/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Upload API - Starting...")

    let userId = null
    let userEmail = null

    // Autenticación
    const headerEmail = request.headers.get("x-user-email")
    console.log("📧 Header email:", headerEmail)

    if (headerEmail) {
      userEmail = headerEmail
      const supabase = createClient()
      const { data: user, error } = await supabase.from("users").select("id").eq("email", userEmail).single()

      if (user && !error) {
        userId = user.id
        console.log("✅ User found via header email:", userId)
      }
    }

    if (!userId) {
      const nextAuthSession = await getServerSession()
      if (nextAuthSession?.user?.email) {
        userEmail = nextAuthSession.user.email
        const supabase = createClient()
        const { data: user } = await supabase.from("users").select("id").eq("email", userEmail).single()
        if (user) {
          userId = user.id
          console.log("✅ User found via NextAuth server:", userId)
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file || !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Archivo inválido" }, { status: 400 })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `posts/${userId}/${timestamp}-${randomString}.${fileExtension}`

    try {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
      const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID
      const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY
      const bucketName = process.env.CLOUDFLARE_BUCKET_NAME

      console.log("🔧 Cloudflare config check:")
      console.log("  - Account ID:", accountId ? "✅ Set" : "❌ Missing")
      console.log("  - Access Key ID:", accessKeyId ? "✅ Set" : "❌ Missing")
      console.log("  - Secret Access Key:", secretAccessKey ? "✅ Set" : "❌ Missing")
      console.log("  - Bucket Name:", bucketName ? "✅ Set" : "❌ Missing")

      if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
        throw new Error("Missing Cloudflare R2 configuration")
      }

      // Configurar S3 Client
      const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
      })

      // Subir archivo
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })

      await s3Client.send(uploadCommand)

      // 🎯 USAR TU URL PÚBLICA REAL
      const publicDevUrl = `https://pub-e8d3b4b205fb43fb94d31b9b3a69f016.r2.dev/${fileName}`
      const customDomainUrl = `https://cdn.pixbae-gaming.com/${fileName}`

      // Usar Public Development URL como primera opción (más confiable)
      const publicUrl = publicDevUrl

      console.log("✅ Upload successful to R2:")
      console.log("  - Public Dev URL:", publicDevUrl)
      console.log("  - Custom Domain:", customDomainUrl)
      console.log("  - Using:", publicUrl)

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        message: "¡Imagen subida exitosamente a Cloudflare R2!",
        user: userEmail,
        urls: {
          publicDev: publicDevUrl,
          custom: customDomainUrl,
        },
      })
    } catch (r2Error) {
      console.error("❌ R2 upload error:", r2Error)

      // Fallback mejorado
      const timestamp = Date.now()
      const placeholderUrl = `https://via.placeholder.com/600x400/1e293b/ffffff?text=R2+Error+${timestamp}`

      console.log("🔄 Using placeholder fallback:", placeholderUrl)

      return NextResponse.json({
        success: true,
        url: placeholderUrl,
        fileName,
        message: "Error en R2, usando placeholder temporal",
        user: userEmail,
        fallback: true,
      })
    }
  } catch (error) {
    console.error("💥 Error uploading:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
