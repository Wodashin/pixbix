import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Se requiere un correo electrónico" }, { status: 400 })
    }

    const supabase = createClient()

    // Verificar si el usuario existe
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single()

    if (userError || !user) {
      // Por seguridad, no revelamos si el correo existe o no
      return NextResponse.json(
        { success: true, message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña." },
        { status: 200 },
      )
    }

    // Generar token único
    const token = randomBytes(32).toString("hex")
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // Token válido por 1 hora

    // Guardar token en la base de datos
    const { error: tokenError } = await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token: token,
      expires_at: expires.toISOString(),
      used: false,
    })

    if (tokenError) {
      console.error("Error al guardar token:", tokenError)
      return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
    }

    // Construir URL de restablecimiento
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    // Aquí normalmente enviarías un correo electrónico
    // Por ahora, solo simulamos el envío y mostramos la URL en la consola para pruebas
    console.log("URL de restablecimiento:", resetUrl)
    console.log("Correo enviado a:", email)

    // En un entorno real, usarías un servicio de correo como SendGrid, Mailgun, etc.
    // Por ejemplo con SendGrid:
    // await sendEmail({
    //   to: email,
    //   subject: 'Restablece tu contraseña',
    //   text: `Haz clic en este enlace para restablecer tu contraseña: ${resetUrl}`,
    //   html: `<p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña.</p>`
    // });

    return NextResponse.json({
      success: true,
      message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
    })
  } catch (error) {
    console.error("Error en forgot-password:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
