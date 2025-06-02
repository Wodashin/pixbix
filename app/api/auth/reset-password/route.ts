import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Se requieren token y contraseña" }, { status: 400 })
    }

    const supabase = createClient()

    // Verificar si el token es válido
    const { data: tokenData, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("user_id, expires_at, used")
      .eq("token", token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    // Verificar si el token ya fue usado
    if (tokenData.used) {
      return NextResponse.json({ error: "Este enlace ya ha sido utilizado" }, { status: 400 })
    }

    // Verificar si el token ha expirado
    const now = new Date()
    const expires = new Date(tokenData.expires_at)
    if (now > expires) {
      return NextResponse.json({ error: "El enlace ha expirado" }, { status: 400 })
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Actualizar la contraseña del usuario
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", tokenData.user_id)

    if (updateError) {
      console.error("Error al actualizar contraseña:", updateError)
      return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 })
    }

    // Marcar el token como usado
    await supabase.from("password_reset_tokens").update({ used: true }).eq("token", token)

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("Error en reset-password:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
