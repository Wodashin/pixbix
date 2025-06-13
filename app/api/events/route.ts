import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Obtener eventos (simulado - puedes reemplazar con tu lógica real)
    const events = [
      {
        id: 1,
        title: "Nobux Gaming Championship 2024",
        date: "2024-02-15",
        time: "19:00",
        location: "Online",
        participants: "500+",
        prize: "$50,000",
        game: "Valorant",
        status: "Registrándose",
      },
      {
        id: 2,
        title: "Encuentro de Compañeros Gaming",
        date: "2024-02-20",
        time: "14:00",
        location: "Discord",
        participants: "200",
        prize: "Networking",
        game: "Evento Social",
        status: "Próximamente",
      },
    ]

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error al obtener eventos:", error)
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

    // Aquí iría la lógica para crear un nuevo evento
    // Por ahora solo simulamos la respuesta
    const newEvent = {
      id: Date.now(),
      ...body,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ event: newEvent }, { status: 201 })
  } catch (error) {
    console.error("Error al crear evento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
