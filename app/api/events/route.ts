import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const validUserId = session?.user.id

  const { title, description, game, start_date, end_date, max_participants, event_type } = await request.json()

  if (!title || !description || !start_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Convertir las fechas al formato correcto para PostgreSQL
  const formatDateForPostgres = (dateString: string) => {
    if (!dateString) return null
    // Convertir de formato datetime-local a ISO string
    const date = new Date(dateString)
    return date.toISOString()
  }

  const formattedStartDate = formatDateForPostgres(start_date)
  const formattedEndDate = end_date ? formatDateForPostgres(end_date) : null

  console.log("Original start_date:", start_date)
  console.log("Formatted start_date:", formattedStartDate)

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
    console.error(error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }

  return NextResponse.json(event)
}
