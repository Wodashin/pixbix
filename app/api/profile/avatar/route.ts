import { type NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    // Acepta JSON con avatar_url ya subida (flujo desde ProfileImageUpload)
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const { avatar_url } = await request.json()
      if (!avatar_url) return NextResponse.json({ error: "URL de avatar requerida" }, { status: 400 })

      // CORREGIDO: usar "avatar_url" no "image"
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      if (updateError) return NextResponse.json({ error: "Error al actualizar avatar" }, { status: 500 })
      return NextResponse.json({ success: true, avatarUrl: avatar_url })
    }

    // Flujo alternativo: recibe el archivo directamente y lo sube a R2
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 })

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es demasiado grande (máximo 5MB)" }, { status: 400 })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID
    const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY
    const bucketName = process.env.CLOUDFLARE_BUCKET_NAME
    const publicUrlBase = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrlBase) {
      return NextResponse.json({ error: "Configuración de almacenamiento incompleta" }, { status: 500 })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `avatars/${user.id}/${Date.now()}.${ext}`

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    }))

    const avatarUrl = `${publicUrlBase}/${fileName}`

    // CORREGIDO: usar "avatar_url" no "image"
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (updateError) return NextResponse.json({ error: "Error al guardar avatar en perfil" }, { status: 500 })

    return NextResponse.json({ success: true, avatarUrl })
  } catch (error) {
    console.error("Error al subir avatar:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
