import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/posts/[id]/comments - Obtener comentarios de un post
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    const supabase = createClient()

    const { data: comments, error } = await supabase
      .from("comments")
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
      .eq("post_id", postId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching comments:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error in GET comments:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/posts/[id]/comments - Crear un comentario
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = params.id
    const { content } = await request.json()

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
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

    // Crear el comentario
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userData.id,
        content,
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
      console.error("Error creating comment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Actualizar el contador de comentarios del post
    await supabase.rpc("increment_comments_count", { post_id: postId })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error in POST comment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
