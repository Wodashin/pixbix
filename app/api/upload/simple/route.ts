import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
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

    // Por ahora solo devolvemos un placeholder
    // En producción, usaríamos las variables de entorno para subir a R2
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileName = `${timestamp}-${randomString}-${file.name}`

    // URL de placeholder para desarrollo
    const imageUrl = `/placeholder.svg?height=400&width=600&query=image`

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName,
    })
  } catch (error) {
    console.error("Error uploading:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
