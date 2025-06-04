import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 POST /api/posts - Starting...")

    let userId = null
    let userEmail = null

    // Intentar con NextAuth getServerSession
    const nextAuthSession = await getServerSession()
    console.log("🟢 NextAuth server session:", nextAuthSession?.user?.email)

    if (nextAuthSession?.user?.email) {
      userEmail = nextAuthSession.user.email

      const supabase = createClient()
      const { data: user } = await supabase.from("users").select("id").eq("email", userEmail).single()

      if (user) {
        userId = user.id
        console.log("✅ User found via NextAuth server:", userId)
      }
    }

    // Si no se encontró usuario, intentar con Supabase
    if (!userId) {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.log("🔵 Supabase session:", !!session)

      if (session?.user?.id) {
        userId = session.user.id
        userEmail = session.user.email
        console.log("✅ User found via Supabase:", userId)
      }
    }

    console.log("📊 Final auth result:")
    console.log("  - User ID:", userId)
    console.log("  - User Email:", userEmail)

    if (!userId) {
      console.log("❌ No session found with any method")
      return NextResponse.json(
        {
          error: "Unauthorized - No session found",
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    console.log("📝 Request body:", body)

    const { content, game_id, achievement_id, image_url } = body

    if (!content?.trim()) {
      console.log("❌ No content provided")
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    console.log("💾 Creating post for user:", userId)

    const supabase = createClient()
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        content: content.trim(),
        game_id: game_id || null,
        achievement_id: achievement_id || null,
        image_url: image_url || null, // Agregar soporte para imágenes
      })
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error("💥 Supabase error creating post:", error)
      return NextResponse.json(
        {
          error: "Error creating post in database",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("🎉 Post created successfully:", post.id)

    const responseData = {
      ...post,
      user: post.users,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("💥 Error creating post:", error)
    return NextResponse.json(
      {
        error: "Error creating post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
