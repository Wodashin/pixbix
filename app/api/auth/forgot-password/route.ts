import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email es requerido" }, { status: 400 })
    }

    const supabase = createClient()

    // Usar la funcionalidad de recuperación de contraseña de Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin")}/auth/callback?next=/reset-password`,
    })

    if (error) {
      console.error("Error al enviar email de recuperación:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error al enviar el email de recuperación",
        },
        { status: 500 },
      )
    }

    // Siempre devolver un mensaje genérico por seguridad
    return NextResponse.json({
      success: true,
      message: "Si el email existe, recibirás un enlace de recuperación",
    })
  } catch (error) {
    console.error("Error en la API de recuperación de contraseña:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
