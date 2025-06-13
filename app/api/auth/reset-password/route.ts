import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { password, confirmPassword } = await request.json()

    // Validaciones básicas
    if (!password || !confirmPassword) {
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

    // Actualizar contraseña
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error("Error al actualizar contraseña:", error)
      return NextResponse.json({ success: false, message: "Error al actualizar la contraseña" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar contraseña:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
