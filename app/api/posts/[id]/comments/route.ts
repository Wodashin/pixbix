import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json({ error: "ID de post requerido" }, { status: 400 })
    }

    // Aquí iría la lógica para obtener comentarios del post
    // Por ahora, devolvemos datos de ejemplo
    const comments = [
      {
        id: "1",
        content: "¡Gran post! Me encantó la información.",
        author: {
          name: "Usuario1",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        likes: 5,
      },
      {
        id: "2",
        content: "Muy interesante, gracias por compartir.",
        author: {
          name: "Usuario2",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        timestamp: new Date(Date.now() - 600000).toISOString(),
        likes: 3,
      },
    ]

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error al obtener comentarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    const { content } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "ID de post requerido" }, { status: 400 })
    }

    if (!content) {
      return NextResponse.json({ error: "Contenido del comentario requerido" }, { status: 400 })
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

    // Aquí iría la lógica para guardar el comentario en la base de datos
    // Por ahora, simulamos una respuesta exitosa
    const comment = {
      id: Date.now().toString(),
      content,
      author: {
        name: user.user_metadata?.name || user.email || "Usuario",
        avatar: user.user_metadata?.avatar_url,
      },
      timestamp: new Date().toISOString(),
      likes: 0,
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Error al crear comentario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
