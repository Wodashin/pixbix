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
    console.log("POST /api/events - Starting...")

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

    // Método 3: Intentar con headers personalizados
    const userEmailHeader = request.headers.get("X-User-Email")
    const userIdHeader = request.headers.get("X-User-ID")
    console.log("Custom headers - Email:", userEmailHeader || "undefined", "ID:", userIdHeader || "undefined")

    // Método 4: Intentar con headers de autorización
    const authHeader = request.headers.get("authorization")
    console.log("Auth header present:", !!authHeader)

    let userEmail: string | null = null
    let userId: string | null = null

    // Priorizar headers personalizados, luego NextAuth, luego Supabase
    if (userEmailHeader) {
      userEmail = userEmailHeader
      userId = userIdHeader
      console.log("Using custom headers - Email:", userEmail, "ID:", userId)
    } else if (session?.user?.email) {
      userEmail = session.user.email
      userId = session.user.id
      console.log("Using NextAuth email:", userEmail)
    } else if (supabaseSession?.user?.email) {
      userEmail = supabaseSession.user.email
      userId = supabaseSession.user.id
      console.log("Using Supabase email:", userEmail)
    } else if (authHeader) {
      // Intentar autenticación con token
      const token = authHeader.replace("Bearer ", "")
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token)
      if (user?.email) {
        userEmail = user.email
        userId = user.id
        console.log("Using token email:", userEmail)
      }
    }

    if (!userEmail) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 })
    }

    const { title, description, game, start_date, end_date, max_participants, event_type } = await request.json()

    if (!title || !description || !start_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Obtener el ID del usuario desde la base de datos (para asegurar un UUID válido)
    console.log("Fetching user ID from database for email:", userEmail)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userEmail)
      .single()

    if (userError || !userData) {
      console.error("User not found for email:", userEmail, userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Usar el ID de la base de datos que garantiza ser un UUID válido
    const validUserId = userData.id
    console.log("Found valid user ID from database:", validUserId)

    console.log("Creating event for user:", validUserId)

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
        creator_id: validUserId, // Usar el ID válido de la base de datos
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Event created successfully:", event.id)
    return NextResponse.json(event)
  } catch (error) {
    console.error("Error in POST events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
