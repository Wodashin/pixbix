import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // 1. Obtener el usuario autenticado de la sesión
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // 2. Obtener el perfil del usuario de la tabla 'users'
    //    Esta consulta es mucho más simple y asume que el perfil ya existe.
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    // 3. Si hay un error al buscar el perfil, devolver un error claro
    if (profileError) {
      console.error("Error al obtener el perfil de la base de datos:", profileError)
      return NextResponse.json({ error: "No se pudo cargar el perfil del usuario." }, { status: 500 })
    }

    // 4. Devolver el perfil encontrado
    return NextResponse.json({ user: profile })

  } catch (error) {
    console.error("Error inesperado en la API de perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const updates = await request.json()

        // Validar si se está actualizando el username para verificar si ya existe
        if (updates.username) {
            const { data: existingUser } = await supabase
                .from("users")
                .select("id")
                .eq("username", updates.username)
                .neq("id", user.id)
                .single()

            if (existingUser) {
                return NextResponse.json({ error: "Este nombre de usuario ya está en uso" }, { status: 400 })
            }
        }

        const { data: updatedProfile, error: updateError } = await supabase
            .from("users")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", user.id)
            .select()
            .single()

        if (updateError) {
            console.error("Error al actualizar el perfil:", updateError)
            return NextResponse.json({ error: "Error al actualizar el perfil." }, { status: 500 })
        }

        return NextResponse.json({ user: updatedProfile })
    } catch (error) {
        console.error("Error inesperado al actualizar el perfil:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
