import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/posts/[id]/comments - Obtener comentarios de un post
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Comments GET API - Starting...")

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
      console.error("Comments GET API - Error fetching comments:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Comments GET API - Comments found:", comments?.length || 0)
    return NextResponse.json(comments)
  } catch (error) {
    console.error("Comments GET API - General error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/posts/[id]/comments - Crear un comentario
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Comments POST API - Starting...")

    // Intentar obtener la sesión de NextAuth
    const session = await getServerSession(authOptions)
    console.log("Comments POST API - NextAuth Session:", session?.user?.email)

    // Si no hay sesión de NextAuth, intentar con headers personalizados
    let userEmail = session?.user?.email

    if (!userEmail) {
      // Intentar obtener email de headers personalizados
      const customEmail = request.headers.get("x-user-email")
      if (customEmail) {
        userEmail = customEmail
        console.log("Comments POST API - Using custom header email:", userEmail)
      }
    }

    if (!userEmail) {
      console.log("Comments POST API - No user email found in session or headers")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = params.id
    const { content } = await request.json()

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      console.log("Comments POST API - Invalid content")
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Obtener el ID del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userEmail)
      .single()

    if (userError || !userData) {
      console.error("Comments POST API - Error getting user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Comments POST API - User found:", userData.id)

    // Crear el comentario
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userData.id,
        content: content.trim(),
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
      console.error("Comments POST API - Error creating comment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Comments POST API - Comment created successfully")

    // Actualizar el contador de comentarios del post (opcional)
    try {
      await supabase.rpc("increment_comments_count", { post_id: postId })
    } catch (rpcError) {
      console.log("Comments POST API - RPC function not found, skipping counter update")
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Comments POST API - General error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
