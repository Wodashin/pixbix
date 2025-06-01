import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isAdminAvailable } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAvailable()) {
      return NextResponse.json({ error: "Servicio no disponible temporalmente" }, { status: 503 })
    }

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

    // Verificar si el email ya existe
    const { data: existingUser, error: checkError } = await supabaseAdmin!
      .from("users")
      .select("email")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json({ success: false, message: "Este email ya está registrado" }, { status: 400 })
    }

    // Verificar si el username ya existe
    const { data: existingUsername, error: usernameError } = await supabaseAdmin!
      .from("users")
      .select("username")
      .eq("username", username.toLowerCase())
      .single()

    if (existingUsername) {
      return NextResponse.json({ success: false, message: "Este nombre de usuario ya está en uso" }, { status: 400 })
    }

    // Hash de la contraseña
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Crear el usuario
    const userData = {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      display_name: username,
      name: username,
      real_name: "", // Se completará después
      password_hash: passwordHash,
      avatar_url: null,
      profile_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newUser, error: insertError } = await supabaseAdmin!
      .from("users")
      .insert([userData])
      .select()
      .single()

    if (insertError) {
      console.error("Error creando usuario:", insertError)
      return NextResponse.json({ success: false, message: "Error al crear la cuenta" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
