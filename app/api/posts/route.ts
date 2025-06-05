import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching posts:", error)
      return NextResponse.json([])
    }

    // Para cada post, obtener conteos de likes y comentarios
    const postsWithCounts = await Promise.all(
      (posts || []).map(async (post) => {
        // Contar likes
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id)

        // Contar comentarios
        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id)

        return {
          ...post,
          user: post.users,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          shares_count: 0,
          views_count: Math.floor(Math.random() * 100) + 10,
        }
      }),
    )

    return NextResponse.json(postsWithCounts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 POST /api/posts - Starting...")

    let userId = null
    let userEmail = null

    // MÉTODO 1: Obtener email del header personalizado
    const headerEmail = request.headers.get("x-user-email")
    console.log("📧 Header email:", headerEmail)

    if (headerEmail) {
      userEmail = headerEmail

      // Buscar usuario en Supabase por email
      const supabase = createClient()
      const { data: user, error } = await supabase.from("users").select("id").eq("email", userEmail).single()

      if (user && !error) {
        userId = user.id
        console.log("✅ User found via header email:", userId)
      } else {
        console.log("❌ User not found for email:", userEmail)
      }
    }

    // MÉTODO 2: Intentar con NextAuth como fallback
    if (!userId) {
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
    }

    // MÉTODO 3: Supabase auth como último recurso
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

    const { content, tags } = body

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
        tags: tags || [],
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
