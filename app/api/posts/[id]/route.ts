import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json({ error: "ID de post requerido" }, { status: 400 })
    }

    // Aquí iría la lógica para obtener el post
    // Por ahora, devolvemos datos de ejemplo
    const post = {
      id: postId,
      title: "Guía completa de Elden Ring",
      content:
        "Elden Ring es un juego de rol de acción desarrollado por FromSoftware y publicado por Bandai Namco Entertainment. El juego es una colaboración entre el director del juego Hidetaka Miyazaki y el novelista de fantasía George R. R. Martin.",
      author: {
        id: "1",
        name: "GamerPro_2024",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      image: "/placeholder.svg?height=300&width=500",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      likes: 234,
      comments: 45,
      shares: 12,
      tags: ["Elden Ring", "Guía", "RPG"],
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error al obtener post:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    const { title, content, tags } = await request.json()

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

    // Aquí iría la lógica para actualizar el post
    // Por ahora, simulamos una respuesta exitosa
    const updatedPost = {
      id: postId,
      title,
      content,
      tags,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error("Error al actualizar post:", error)
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

    // Aquí iría la lógica para eliminar el post
    // Por ahora, simulamos una respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Post eliminado correctamente",
      postId,
    })
  } catch (error) {
    console.error("Error al eliminar post:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
