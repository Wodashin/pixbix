import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function DELETE(request: Request, { params }: { params: { game: string } }) {
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

    // Eliminar perfil de gaming
    const { error: deleteError } = await supabase
      .from("user_gaming_profiles")
      .delete()
      .eq("game", params.game)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Error al eliminar perfil de gaming:", deleteError)
      return NextResponse.json({ error: "Error al eliminar perfil" }, { status: 500 })
    }

    return NextResponse.json({ message: "Perfil eliminado correctamente" })
  } catch (error) {
    console.error("Error en DELETE de perfil de gaming:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
