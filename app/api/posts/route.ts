import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Aquí iría la lógica para obtener posts con filtros
    // Por ahora, devolvemos datos de ejemplo
    const posts = [
      {
        id: "1",
        title: "Guía completa de Elden Ring",
        excerpt: "Todo lo que necesitas saber para dominar Elden Ring desde el principio.",
        image: "/placeholder.svg?height=300&width=500",
        author: {
          name: "GamerPro_2024",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        likes: 234,
        comments: 45,
        tags: ["Elden Ring", "Guía", "RPG"],
      },
      {
        id: "2",
        title: "Los mejores periféricos gaming de 2024",
        excerpt: "Análisis de los mejores teclados, ratones y auriculares para gamers.",
        image: "/placeholder.svg?height=300&width=500",
        author: {
          name: "TechMaster",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        likes: 156,
        comments: 23,
        tags: ["Hardware", "Periféricos", "Análisis"],
      },
    ]

    return NextResponse.json({
      posts,
      pagination: {
        total: 42,
        page,
        limit,
        pages: Math.ceil(42 / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener posts:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, tags, image } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Título y contenido son requeridos" }, { status: 400 })
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

    // Aquí iría la lógica para crear un nuevo post
    // Por ahora, simulamos una respuesta exitosa
    const post = {
      id: Date.now().toString(),
      title,
      content,
      tags: tags || [],
      image: image || null,
      author: {
        id: user.id,
        name: user.user_metadata?.name || user.email || "Usuario",
        avatar: user.user_metadata?.avatar_url,
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Error al crear post:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
