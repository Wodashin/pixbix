import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import nodemailer from "nodemailer"

// Configure nodemailer with your email service
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com", // Your email
    pass: process.env.EMAIL_PASSWORD || "your-app-password", // Your email password or app password
  },
})

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

    // Enviar correo electrónico
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to: email,
        subject: "Restablece tu contraseña - Nobux Gaming",
        text: `Haz clic en este enlace para restablecer tu contraseña: ${resetUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="background-color: #1e293b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0;">Nobux Gaming</h1>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
              <h2 style="color: #1e293b;">Restablece tu contraseña</h2>
              <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Restablecer Contraseña</a>
              </div>
              <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
              <p>Este enlace expirará en 1 hora por seguridad.</p>
              <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="color: #64748b; font-size: 12px; text-align: center;">© 2024 Nobux Gaming. Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      })

      console.log("Correo enviado a:", email)
    } catch (emailError) {
      console.error("Error al enviar correo:", emailError)
      // No devolvemos error al usuario por seguridad
    }

    return NextResponse.json({
      success: true,
      message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
    })
  } catch (error) {
    console.error("Error en forgot-password:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
