import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/utils/supabase/server"

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

    // MÉTODO 3: Supabase auth como último recurso
    if (!userId) {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.log("🔵 Supabase session:", !!session)

      if (session?.user?.id) {
        userId = session.user.id
        userEmail = session.user.email
        console.log("✅ User found via Supabase:", userId)
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
    const fileName = `${timestamp}-${randomString}-${file.name}`

    // Por ahora usar placeholder (más tarde conectar con Cloudflare R2)
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
