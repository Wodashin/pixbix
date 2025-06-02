import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventId = params.id
    const supabase = createClient()

    // Obtener el ID del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verificar si el evento existe y no está lleno
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*, participants:event_participants(count)")
      .eq("id", eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Verificar si ya está inscrito
    const { data: existingParticipant } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userData.id)
      .single()

    if (existingParticipant) {
      return NextResponse.json({ error: "Already joined this event" }, { status: 400 })
    }

    // Verificar límite de participantes
    if (event.max_participants && event.participants[0]?.count >= event.max_participants) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 })
    }

    // Unirse al evento
    const { error: joinError } = await supabase.from("event_participants").insert({
      event_id: eventId,
      user_id: userData.id,
    })

    if (joinError) {
      console.error("Error joining event:", joinError)
      return NextResponse.json({ error: joinError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST join event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventId = params.id
    const supabase = createClient()

    // Obtener el ID del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Salir del evento
    const { error } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userData.id)

    if (error) {
      console.error("Error leaving event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE leave event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
