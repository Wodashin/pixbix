import { type NextRequest, NextResponse } from "next/server"

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

    // Aquí iría la lógica para:
    // 1. Verificar si el email ya existe
    // 2. Hash de la contraseña
    // 3. Guardar en la base de datos
    // 4. Enviar email de verificación

    // Simulación de registro exitoso
    const response = NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      user: {
        id: "new-user-id",
        username: username,
        email: email,
      },
    })

    // Establecer cookie de sesión
    response.cookies.set("auth-token", "fake-jwt-token-new-user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    return response
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
