import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
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

    // Aquí iría la lógica para obtener mensajes de chat
    // Por ahora, devolvemos datos de ejemplo
    const messages = [
      {
        id: "1",
        content: "¡Hola a todos! ¿Alguien quiere jugar Valorant?",
        author: { name: "GamerPro", avatar: "/placeholder.svg?height=32&width=32" },
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "2",
        content: "¡Yo me apunto! ¿Qué rango eres?",
        author: { name: "PixelHunter", avatar: "/placeholder.svg?height=32&width=32" },
        timestamp: new Date(Date.now() - 240000).toISOString(),
      },
      {
        id: "3",
        content: "Diamante 2, ¿y tú?",
        author: { name: "GamerPro", avatar: "/placeholder.svg?height=32&width=32" },
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
    ]

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
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

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "El contenido del mensaje es requerido" }, { status: 400 })
    }

    // Aquí iría la lógica para guardar el mensaje en la base de datos
    // Por ahora, simulamos una respuesta exitosa
    const message = {
      id: Date.now().toString(),
      content,
      author: {
        name: user.user_metadata?.name || user.email || "Usuario",
        avatar: user.user_metadata?.avatar_url,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
