import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Upload API - Starting...")

    let userId = null
    let userEmail = null

    // MÉTODO 1: NextAuth getServerSession
    const nextAuthSession = await getServerSession()
    console.log("🟢 NextAuth session:", nextAuthSession?.user?.email)

    if (nextAuthSession?.user?.email) {
      userEmail = nextAuthSession.user.email

      const supabase = createClient()
      const { data: user } = await supabase.from("users").select("id").eq("email", userEmail).single()

      if (user) {
        userId = user.id
        console.log("✅ User found via NextAuth:", userId)
      }
    }

    // MÉTODO 2: Supabase auth como fallback
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

    // MÉTODO 3: Cookies directamente
    if (!userId) {
      const sessionToken =
        request.cookies.get("next-auth.session-token")?.value ||
        request.cookies.get("__Secure-next-auth.session-token")?.value

      console.log("🍪 Session token found:", !!sessionToken)

      if (sessionToken) {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
            headers: {
              cookie: request.headers.get("cookie") || "",
            },
          })

          if (response.ok) {
            const session = await response.json()
            console.log("🔑 Session from API:", session?.user?.email)

            if (session?.user?.email) {
              userEmail = session.user.email

              const supabase = createClient()
              const { data: user } = await supabase.from("users").select("id").eq("email", userEmail).single()

              if (user) {
                userId = user.id
                console.log("✅ User found via cookie:", userId)
              }
            }
          }
        } catch (error) {
          console.log("⚠️ Error fetching session:", error)
        }
      }
    }

    console.log("📊 Final auth result:")
    console.log("  - User ID:", userId)
    console.log("  - User Email:", userEmail)

    if (!userId) {
      console.log("❌ No session found with any method")
      return NextResponse.json({ error: "No autorizado - Debes iniciar sesión" }, { status: 401 })
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

    console.log("📁 File info:", {
      name: file.name,
      size: file.size,
      type: file.type,
      generatedName: fileName,
    })

    // Por ahora usar placeholder hasta que R2 esté completamente configurado
    const imageUrl = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(file.name)}`

    console.log("✅ Upload successful (placeholder):", imageUrl)

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName,
      message: "Imagen subida exitosamente (modo desarrollo)",
    })
  } catch (error) {
    console.error("💥 Error uploading:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
