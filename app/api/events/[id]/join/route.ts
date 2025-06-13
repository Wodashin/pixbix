import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json({ error: "ID de evento requerido" }, { status: 400 })
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

    // Aquí iría la lógica para unir al usuario al evento
    // Por ejemplo, verificar si el evento existe, si hay cupo, etc.
    // Por ahora, simulamos una respuesta exitosa

    return NextResponse.json({
      success: true,
      message: "Te has unido al evento correctamente",
      eventId,
      userId: user.id,
    })
  } catch (error) {
    console.error("Error al unirse al evento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json({ error: "ID de evento requerido" }, { status: 400 })
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

    // Aquí iría la lógica para que el usuario abandone el evento
    // Por ahora, simulamos una respuesta exitosa

    return NextResponse.json({
      success: true,
      message: "Has abandonado el evento correctamente",
      eventId,
      userId: user.id,
    })
  } catch (error) {
    console.error("Error al abandonar el evento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
