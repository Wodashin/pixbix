import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, real_name } = await request.json()

    if (!email || !real_name) {
      return NextResponse.json({ error: "Email y nombre real son requeridos" }, { status: 400 })
    }

    // Actualizar el perfil del usuario
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        real_name: real_name.trim(),
        profile_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select()

    if (error) {
      console.error("Error actualizando perfil:", error)
      return NextResponse.json({ error: "Error actualizando perfil" }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: data[0] })
  } catch (error) {
    console.error("Error en complete-profile:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
