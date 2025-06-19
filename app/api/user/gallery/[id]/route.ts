import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
    const { is_public } = body

    // Actualizar visibilidad de la imagen
    const { data: updatedImage, error: updateError } = await supabase
      .from("user_gallery")
      .update({ is_public })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error al actualizar imagen:", updateError)
      return NextResponse.json({ error: "Error al actualizar imagen" }, { status: 500 })
    }

    return NextResponse.json({ image: updatedImage })
  } catch (error) {
    console.error("Error en PATCH de galería:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    // Eliminar imagen de la galería
    const { error: deleteError } = await supabase
      .from("user_gallery")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Error al eliminar imagen:", deleteError)
      return NextResponse.json({ error: "Error al eliminar imagen" }, { status: 500 })
    }

    return NextResponse.json({ message: "Imagen eliminada correctamente" })
  } catch (error) {
    console.error("Error en DELETE de galería:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
