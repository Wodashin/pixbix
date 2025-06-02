import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando proceso de reset de contraseña...")

    const { token, password } = await request.json()
    console.log("📝 Token recibido:", token ? "✅ Presente" : "❌ Ausente")
    console.log("📝 Password recibido:", password ? "✅ Presente" : "❌ Ausente")

    if (!token || !password) {
      console.log("❌ Faltan datos requeridos")
      return NextResponse.json({ error: "Se requieren token y contraseña" }, { status: 400 })
    }

    console.log("🔗 Conectando a Supabase...")
    const supabase = createClient()

    // Verificar si el token es válido
    console.log("🔍 Buscando token en la base de datos...")
    const { data: tokenData, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("user_id, expires_at, used")
      .eq("token", token)
      .single()

    if (tokenError) {
      console.error("❌ Error al buscar token:", tokenError)
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    if (!tokenData) {
      console.log("❌ Token no encontrado")
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    console.log("✅ Token encontrado:", tokenData)

    // Verificar si el token ya fue usado
    if (tokenData.used) {
      console.log("❌ Token ya utilizado")
      return NextResponse.json({ error: "Este enlace ya ha sido utilizado" }, { status: 400 })
    }

    // Verificar si el token ha expirado
    const now = new Date()
    const expires = new Date(tokenData.expires_at)
    console.log("⏰ Verificando expiración:", { now: now.toISOString(), expires: expires.toISOString() })

    if (now > expires) {
      console.log("❌ Token expirado")
      return NextResponse.json({ error: "El enlace ha expirado" }, { status: 400 })
    }

    // Hashear la nueva contraseña
    console.log("🔐 Hasheando nueva contraseña...")
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("✅ Contraseña hasheada correctamente")

    // Actualizar la contraseña del usuario - CORREGIDO: usar password_hash
    console.log("💾 Actualizando contraseña del usuario:", tokenData.user_id)
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: hashedPassword, // 👈 CORREGIDO: era 'password', ahora es 'password_hash'
        updated_at: new Date().toISOString(),
      })
      .eq("id", tokenData.user_id)

    if (updateError) {
      console.error("❌ Error al actualizar contraseña:", updateError)
      return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 })
    }

    console.log("✅ Contraseña actualizada correctamente")

    // Marcar el token como usado
    console.log("🔒 Marcando token como usado...")
    const { error: markUsedError } = await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("token", token)

    if (markUsedError) {
      console.error("⚠️ Error al marcar token como usado:", markUsedError)
      // No retornamos error aquí porque la contraseña ya se actualizó
    }

    console.log("🎉 Proceso completado exitosamente")
    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("💥 Error crítico en reset-password:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
