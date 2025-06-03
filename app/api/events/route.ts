import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
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

export async function POST(request: Request) {
  try {
    console.log("POST /api/events - Starting...")

    // Obtener cliente de Supabase
    const supabase = createClient()

    // Intentar obtener sesión de NextAuth
    const session = await getServerSession(authOptions)
    console.log("NextAuth session:", session?.user?.email || "undefined")

    // Intentar obtener sesión de Supabase
    const {
      data: { session: supabaseSession },
    } = await supabase.auth.getSession()
    console.log("Supabase session:", supabaseSession?.user?.email || "undefined")

    // Obtener headers personalizados
    const headers = request.headers
    const userEmailHeader = headers.get("X-User-Email")
    const userIdHeader = headers.get("X-User-ID")

    // Determinar el email del usuario
    const userEmail = session?.user?.email || supabaseSession?.user?.email || userEmailHeader

    if (!userEmail) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 })
    }

    // Obtener datos del evento
    const body = await request.json()
    const { title, description, game, start_date, end_date, max_participants, event_type } = body

    if (!title || !description || !start_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convertir las fechas al formato correcto para PostgreSQL
    const formatDateForPostgres = (dateString: string) => {
      if (!dateString) return null
      try {
        // Convertir de formato datetime-local a ISO string
        const date = new Date(dateString)
        return date.toISOString()
      } catch (error) {
        console.error("Error formatting date:", dateString, error)
        return null
      }
    }

    const formattedStartDate = formatDateForPostgres(start_date)
    const formattedEndDate = end_date ? formatDateForPostgres(end_date) : null

    console.log("Original start_date:", start_date)
    console.log("Formatted start_date:", formattedStartDate)

    if (!formattedStartDate) {
      return NextResponse.json(
        {
          error: "Invalid start date format. Please use YYYY-MM-DDTHH:MM format.",
        },
        { status: 400 },
      )
    }

    // Obtener el ID del usuario desde la base de datos
    console.log("Fetching user ID from database for email:", userEmail)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", userEmail)
      .single()

    if (userError || !userData) {
      console.error("User not found for email:", userEmail, userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verificar si el usuario tiene el rol adecuado
    if (userData.role !== "event_creator" && userData.role !== "admin") {
      console.error("User does not have permission to create events:", userEmail)
      return NextResponse.json(
        {
          error: "You don't have permission to create events. Contact an administrator.",
        },
        { status: 403 },
      )
    }

    // Usar el ID de la base de datos
    const validUserId = userData.id
    console.log("Found valid user ID from database:", validUserId)

    // Crear el evento
    console.log("Creating event for user:", validUserId)
    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title,
        description,
        game,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        max_participants: max_participants || null,
        event_type: event_type || "tournament",
        creator_id: validUserId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Event created successfully:", event.id)
    return NextResponse.json(event)
  } catch (error: any) {
    console.error("Error in POST events:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
