import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const supabase = createClient()

    // Obtener usuario autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const targetUserId = userId || user?.id

    if (!targetUserId) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener perfiles de gaming
    const { data: profiles, error } = await supabase
      .from("user_gaming_profiles")
      .select("*")
      .eq("user_id", targetUserId)

    if (error) {
      console.error("Error al obtener perfiles de gaming:", error)
      return NextResponse.json({ error: "Error al obtener perfiles" }, { status: 500 })
    }

    // Convertir array a objeto con game como key
    const profilesObject = profiles?.reduce(
      (acc, profile) => {
        acc[profile.game] = {
          game: profile.game,
          username: profile.username,
          rank: profile.rank,
          tracker_url: profile.tracker_url,
        }
        return acc
      },
      {} as Record<string, any>,
    )

    return NextResponse.json({ gaming_profiles: profilesObject || {} })
  } catch (error) {
    console.error("Error en API de perfiles de gaming:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
    const { game, username, rank, tracker_url } = body

    // Insertar o actualizar perfil de gaming
    const { data: newProfile, error: upsertError } = await supabase
      .from("user_gaming_profiles")
      .upsert(
        {
          user_id: user.id,
          game,
          username,
          rank,
          tracker_url,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,game",
        },
      )
      .select()
      .single()

    if (upsertError) {
      console.error("Error al guardar perfil de gaming:", upsertError)
      return NextResponse.json({ error: "Error al guardar perfil" }, { status: 500 })
    }

    return NextResponse.json({ profile: newProfile })
  } catch (error) {
    console.error("Error en POST de perfiles de gaming:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
