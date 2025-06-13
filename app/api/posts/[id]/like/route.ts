import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json({ error: "ID de post requerido" }, { status: 400 })
    }

    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Aquí iría la lógica para dar like al post
    // Por ahora, simulamos una respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Like añadido correctamente",
      postId,
      userId: user.id,
    })
  } catch (error) {
    console.error("Error al dar like:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json({ error: "ID de post requerido" }, { status: 400 })
    }

    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Aquí iría la lógica para quitar el like del post
    // Por ahora, simulamos una respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Like eliminado correctamente",
      postId,
      userId: user.id,
    })
  } catch (error) {
    console.error("Error al quitar like:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
