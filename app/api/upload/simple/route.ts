import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/utils/supabase/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getImageUrl, generateFileName } from "@/lib/cloudflare-r2"
import https from "https"

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

    // 🎯 USAR FUNCIÓN CENTRALIZADA
    const fileName = generateFileName(userId, file.name)
    console.log("📁 Generated filename:", fileName)

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

      // 🔧 CONFIGURACIÓN SSL MEJORADA
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        secureProtocol: "TLSv1_2_method",
        ciphers: "ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS",
        honorCipherOrder: true,
        secureOptions: require("constants").SSL_OP_NO_SSLv2 | require("constants").SSL_OP_NO_SSLv3,
      })

      const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
        requestHandler: {
          httpsAgent,
        },
        maxAttempts: 3,
        retryMode: "adaptive",
        requestTimeout: 30000,
        connectionTimeout: 10000,
      })

      console.log("🔗 Using endpoint:", `https://${accountId}.r2.cloudflarestorage.com`)

      // Convertir archivo a buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      console.log("📤 Starting upload to R2...")

      // Subir archivo
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000",
        Metadata: {
          "uploaded-by": "pixbae-app",
          "upload-timestamp": Date.now().toString(),
          "user-id": userId,
          "original-name": file.name,
        },
      })

      const result = await s3Client.send(uploadCommand)
      console.log("✅ R2 upload result:", result)

      // 🎯 USAR FUNCIÓN CENTRALIZADA PARA URL
      const publicUrl = getImageUrl(fileName)

      console.log("✅ Upload successful to R2:")
      console.log("  - File name:", fileName)
      console.log("  - Public URL:", publicUrl)

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        message: "¡Imagen subida exitosamente a Cloudflare R2!",
        user: userEmail,
        uploadDetails: {
          size: file.size,
          type: file.type,
          originalName: file.name,
          r2Response: result,
        },
      })
    } catch (r2Error) {
      console.error("❌ R2 upload error details:", {
        error: r2Error,
        message: r2Error instanceof Error ? r2Error.message : "Unknown error",
        stack: r2Error instanceof Error ? r2Error.stack : undefined,
        name: r2Error instanceof Error ? r2Error.name : undefined,
      })

      // 🔄 FALLBACK con función centralizada
      const fallbackFileName = generateFileName(userId, `fallback-${file.name}`)
      const timestamp = Date.now()

      console.log("🔄 Using placeholder fallback")

      return NextResponse.json({
        success: true,
        url: `https://via.placeholder.com/600x400/1e293b/ffffff?text=R2+Error+${timestamp}`,
        fileName: fallbackFileName,
        message: "Error en R2, usando placeholder temporal",
        user: userEmail,
        fallback: true,
        error: r2Error instanceof Error ? r2Error.message : "R2 connection failed",
        debug: {
          errorType: r2Error instanceof Error ? r2Error.constructor.name : "Unknown",
          errorCode: (r2Error as any)?.code || "No code",
        },
      })
    }
  } catch (error) {
    console.error("💥 General error:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
