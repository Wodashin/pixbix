import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Obtener usuario autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener perfil del usuario desde la tabla users
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      console.error("Error al obtener perfil:", profileError)
      return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 })
    }

    return NextResponse.json({ user: profile })
  } catch (error) {
    console.error("Error en API de perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, username } = body

    // Verificar si el username ya existe (si se está actualizando)
    if (username) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .single()

      if (existingUser) {
        return NextResponse.json({ error: "Este nombre de usuario ya está en uso" }, { status: 400 })
      }
    }

    // Actualizar perfil del usuario
    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update({
        name,
        username,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error al actualizar perfil:", updateError)
      return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 })
    }

    return NextResponse.json({ user: updatedProfile })
  } catch (error) {
    console.error("Error en actualización de perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
