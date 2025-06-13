import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, confirmPassword } = await request.json()

    // Validaciones básicas
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json({ success: false, message: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: "Las contraseñas no coinciden" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      )
    }

    // Crear cliente de Supabase
    const supabase = createClient()

    // Registrar usuario con Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin")}/auth/callback`,
      },
    })

    if (error) {
      console.error("Error al registrar usuario:", error)
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Error al crear la cuenta",
        },
        { status: 400 },
      )
    }

    // Crear entrada en la tabla users
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        username,
        role: "user",
      })

      if (profileError) {
        console.error("Error al crear perfil de usuario:", profileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente. Por favor verifica tu email.",
    })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
