import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/events - Obtener eventos
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all" // all, upcoming, past
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let query = supabase
      .from("events")
      .select(`
        *,
        creator:creator_id (
          id,
          username,
          display_name,
          avatar_url
        ),
        participants:event_participants (
          user_id,
          user:user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `)
      .order("start_date", { ascending: true })
      .limit(limit)

    if (type === "upcoming") {
      query = query.gte("start_date", new Date().toISOString())
    } else if (type === "past") {
      query = query.lt("start_date", new Date().toISOString())
    }

    const { data: events, error } = await query

    if (error) {
      console.error("Error fetching events:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(events || [])
  } catch (error) {
    console.error("Error in GET events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/events - Crear evento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, game, start_date, end_date, max_participants, event_type } = await request.json()

    if (!title || !description || !start_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title,
        description,
        game,
        start_date,
        end_date,
        max_participants: max_participants || null,
        event_type: event_type || "tournament",
        creator_id: userData.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error in POST events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
