import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Iniciando subida de imagen...")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("❌ No se encontró archivo")
      return NextResponse.json({ message: "No se encontró archivo" }, { status: 400 })
    }

    console.log("📁 Archivo recibido:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      console.log("❌ Tipo de archivo inválido:", file.type)
      return NextResponse.json({ message: "Tipo de archivo no válido" }, { status: 400 })
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      console.log("❌ Archivo muy grande:", file.size)
      return NextResponse.json({ message: "Archivo muy grande (máximo 5MB)" }, { status: 400 })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `posts/uploads/${timestamp}-${randomString}.${fileExtension}`

    console.log("📝 Nombre de archivo generado:", fileName)

    // Convertir archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log("💾 Buffer creado, tamaño:", buffer.length)

    // Subir a Cloudflare R2
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${process.env.CLOUDFLARE_BUCKET_NAME}/objects/${fileName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": file.type,
        },
        body: buffer,
      },
    )

    console.log("📡 Respuesta de Cloudflare:", uploadResponse.status)

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("❌ Error de Cloudflare:", errorText)
      throw new Error(`Error subiendo a Cloudflare: ${uploadResponse.status}`)
    }

    // Construir URL pública
    const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || "https://pub-e8d3b4b205fb43f594d31b93a69f016.r2.dev"}/${fileName}`

    console.log("✅ Imagen subida exitosamente:", publicUrl)

    return NextResponse.json({
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("💥 Error en upload/simple:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
