import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Aquí iría la lógica de autenticación real
    // Por ejemplo, verificar credenciales en la base de datos

    // Simulación de validación
    if (email === "test@example.com" && password === "password123") {
      // En un caso real, generarías un JWT o session token
      const response = NextResponse.json({
        success: true,
        message: "Login exitoso",
        user: {
          id: "1",
          email: email,
          username: "test_user",
        },
      })

      // Establecer cookie de sesión
      response.cookies.set("auth-token", "fake-jwt-token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 días
      })

      return response
    } else {
      return NextResponse.json({ success: false, message: "Credenciales inválidas" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
