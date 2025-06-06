import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/utils/supabase/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Upload API - Starting...")

    let userId = null
    let userEmail = null

    // MÉTODO 1: Obtener email del header personalizado
    const headerEmail = request.headers.get("x-user-email")
    console.log("📧 Header email:", headerEmail)

    if (headerEmail) {
      userEmail = headerEmail

      // Buscar usuario en Supabase por email
      const supabase = createClient()
      const { data: user, error } = await supabase.from("users").select("id").eq("email", userEmail).single()

      if (user && !error) {
        userId = user.id
        console.log("✅ User found via header email:", userId)
      } else {
        console.log("❌ User not found for email:", userEmail)
      }
    }

    // MÉTODO 2: Intentar con NextAuth como fallback
    if (!userId) {
      const nextAuthSession = await getServerSession()
      console.log("🟢 NextAuth server session:", nextAuthSession?.user?.email)

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

    console.log("📊 Final auth result:")
    console.log("  - User ID:", userId)
    console.log("  - User Email:", userEmail)

    if (!userId) {
      console.log("❌ No valid user found")
      return NextResponse.json(
        {
          error: "No autorizado - Usuario no encontrado",
          debug: {
            headerEmail,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 })
    }

    // Validaciones
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no puede superar 10MB" }, { status: 400 })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `posts/${userId}/${timestamp}-${randomString}.${fileExtension}`

    console.log("📁 Generated filename:", fileName)

    try {
      // Verificar variables de entorno
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

      // Configurar S3 Client para Cloudflare R2
      const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
      })

      // Convertir archivo a buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Subir a R2 usando S3 SDK
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })

      await s3Client.send(uploadCommand)

      // 🎯 USAR TU DOMINIO PERSONALIZADO
      const publicUrl = `https://cdn.pixbae-gaming.com/${fileName}`

      console.log("✅ Upload successful to R2:", publicUrl)

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        message: "¡Imagen subida exitosamente a Cloudflare R2!",
        user: userEmail,
        customDomain: true,
      })
    } catch (r2Error) {
      console.error("❌ R2 upload error:", r2Error)

      // FALLBACK MEJORADO
      const timestamp = Date.now()
      const placeholderUrl = `https://via.placeholder.com/600x400/1e293b/ffffff?text=Imagen+${timestamp}`

      console.log("🔄 Using placeholder fallback:", placeholderUrl)

      return NextResponse.json({
        success: true,
        url: placeholderUrl,
        fileName,
        message: "¡Imagen procesada! (usando placeholder temporal)",
        user: userEmail,
        fallback: true,
      })
    }
  } catch (error) {
    console.error("💥 Error uploading:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
