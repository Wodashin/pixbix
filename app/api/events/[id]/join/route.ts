import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// POST /api/events/[id]/join - Unirse a evento
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("POST /api/events/[id]/join - Starting...")

    // Método 1: Intentar con NextAuth
    const session = await getServerSession(authOptions)
    console.log("NextAuth session:", session?.user?.email || "undefined")

    // Método 2: Intentar con Supabase
    const supabase = createClient()
    const {
      data: { session: supabaseSession },
      error: sessionError,
    } = await supabase.auth.getSession()
    console.log("Supabase session:", supabaseSession?.user?.email || "undefined")

    let userEmail: string | null = null
    let userId: string | null = null

    // Priorizar NextAuth, luego Supabase
    if (session?.user?.email) {
      userEmail = session.user.email
      console.log("Using NextAuth email:", userEmail)
    } else if (supabaseSession?.user?.email) {
      userEmail = supabaseSession.user.email
      userId = supabaseSession.user.id
      console.log("Using Supabase email:", userEmail)
    }

    if (!userEmail) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener el ID del usuario si no lo tenemos
    if (!userId) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userEmail)
        .single()

      if (userError || !userData) {
        console.error("User not found for email:", userEmail, userError)
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      userId = userData.id
    }

    const eventId = params.id

    // Verificar si el evento existe
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, max_participants")
      .eq("id", eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Verificar si ya está unido
    const { data: existingParticipant } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single()

    if (existingParticipant) {
      return NextResponse.json({ error: "Already joined" }, { status: 400 })
    }

    // Verificar límite de participantes
    if (event.max_participants) {
      const { count } = await supabase
        .from("event_participants")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)

      if (count && count >= event.max_participants) {
        return NextResponse.json({ error: "Event is full" }, { status: 400 })
      }
    }

    // Unirse al evento
    const { error: joinError } = await supabase.from("event_participants").insert({
      event_id: eventId,
      user_id: userId,
    })

    if (joinError) {
      console.error("Error joining event:", joinError)
      return NextResponse.json({ error: joinError.message }, { status: 500 })
    }

    console.log("User joined event successfully:", eventId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST events join:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/events/[id]/join - Salir de evento
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("DELETE /api/events/[id]/join - Starting...")

    // Método 1: Intentar con NextAuth
    const session = await getServerSession(authOptions)
    console.log("NextAuth session:", session?.user?.email || "undefined")

    // Método 2: Intentar con Supabase
    const supabase = createClient()
    const {
      data: { session: supabaseSession },
      error: sessionError,
    } = await supabase.auth.getSession()
    console.log("Supabase session:", supabaseSession?.user?.email || "undefined")

    let userEmail: string | null = null
    let userId: string | null = null

    // Priorizar NextAuth, luego Supabase
    if (session?.user?.email) {
      userEmail = session.user.email
      console.log("Using NextAuth email:", userEmail)
    } else if (supabaseSession?.user?.email) {
      userEmail = supabaseSession.user.email
      userId = supabaseSession.user.id
      console.log("Using Supabase email:", userEmail)
    }

    if (!userEmail) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener el ID del usuario si no lo tenemos
    if (!userId) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userEmail)
        .single()

      if (userError || !userData) {
        console.error("User not found for email:", userEmail, userError)
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      userId = userData.id
    }

    const eventId = params.id

    // Salir del evento
    const { error: leaveError } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId)

    if (leaveError) {
      console.error("Error leaving event:", leaveError)
      return NextResponse.json({ error: leaveError.message }, { status: 500 })
    }

    console.log("User left event successfully:", eventId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE events join:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
