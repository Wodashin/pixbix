import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Upload API - Starting...")

    // MÉTODO DIRECTO: Obtener email del header personalizado
    const userEmail = request.headers.get("x-user-email")
    console.log("📧 User email from header:", userEmail)

    let userId = null

    if (userEmail) {
      // Buscar usuario directamente en Supabase
      const supabase = createClient()
      const { data: user, error } = await supabase.from("users").select("id, email").eq("email", userEmail).single()

      if (error) {
        console.error("❌ Error fetching user:", error)
      } else if (user) {
        userId = user.id
        console.log("✅ User found:", userId)
      }
    }

    if (!userId) {
      console.log("❌ No valid user found")
      return NextResponse.json(
        {
          error: "No autorizado - Usuario no encontrado",
          debug: {
            userEmail,
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
    const fileName = `${timestamp}-${randomString}-${file.name}`

    // Por ahora usar placeholder
    const imageUrl = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(file.name)}`

    console.log("✅ Upload successful (placeholder):", imageUrl)

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName,
      message: "¡Imagen subida exitosamente! (modo desarrollo)",
      user: userEmail,
    })
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
