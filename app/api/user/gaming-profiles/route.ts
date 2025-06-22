import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const targetUserId = userId || user?.id
    if (!targetUserId) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const { data: profiles, error } = await supabase
      .from("user_gaming_profiles")
      .select("*")
      .eq("user_id", targetUserId)

    if (error) {
      console.error("Error al obtener perfiles de gaming:", error)
      return NextResponse.json({ error: "Error al obtener perfiles" }, { status: 500 })
    }

    // ¡CAMBIO CLAVE! Devolvemos el array directamente.
    return NextResponse.json({ profiles: profiles || [] })

  } catch (error) {
    console.error("Error en API de perfiles de gaming:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// (El resto del archivo, la función POST, se mantiene igual)
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { profiles } = await request.json()

    if (!Array.isArray(profiles)) {
        return NextResponse.json({ error: "Se esperaba un array de perfiles" }, { status: 400 });
    }

    await supabase.from('user_gaming_profiles').delete().eq('user_id', user.id);
    
    const profilesToInsert = profiles
        .filter(p => p.game && p.username)
        .map(profile => ({
            user_id: user.id,
            game: profile.game,
            username: profile.username,
            rank: profile.rank,
            tracker_url: profile.tracker_url, // <-- DATO AÑADIDO
        }));

    if (profilesToInsert.length > 0) {
        const { error: upsertError } = await supabase.from("user_gaming_profiles").insert(profilesToInsert);
        if (upsertError) throw upsertError;
    }

    return NextResponse.json({ success: true, message: "Perfiles guardados correctamente" })
  } catch (error) {
    console.error("Error en POST de perfiles de gaming:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
