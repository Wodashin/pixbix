import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/chat/messages - Obtener mensajes del chat global
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select(`
        *,
        user:user_id (
          id,
          name,
          username,
          display_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(messages.reverse())
  } catch (error) {
    console.error("Error in GET messages:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/chat/messages - Enviar mensaje al chat global
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 })
    }

    const supabase = createClient()

    // Obtener el ID del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (userError || !userData) {
      console.error("Error getting user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Crear el mensaje
    const { data: chatMessage, error } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userData.id,
        message: message.trim(),
      })
      .select(`
        *,
        user:user_id (
          id,
          name,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error("Error creating message:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(chatMessage)
  } catch (error) {
    console.error("Error in POST message:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
