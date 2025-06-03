import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

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
    console.log("POST /api/posts - Starting...")

    // Verificar cookies
    const cookieStore = cookies()
    const sessionToken =
      cookieStore.get("next-auth.session-token") || cookieStore.get("__Secure-next-auth.session-token")
    console.log("Session token found:", !!sessionToken)

    // Intentar obtener la sesión con diferentes métodos
    let session = null

    try {
      session = await getServerSession(authOptions)
      console.log("getServerSession result:", session?.user?.id)
    } catch (sessionError) {
      console.error("Error getting session:", sessionError)
    }

    // Si no hay sesión, intentar con el request
    if (!session) {
      try {
        const req = {
          headers: Object.fromEntries(request.headers.entries()),
          cookies: Object.fromEntries(cookieStore.getAll().map((cookie) => [cookie.name, cookie.value])),
        }
        session = await getServerSession(req as any, {} as any, authOptions)
        console.log("getServerSession with request result:", session?.user?.id)
      } catch (sessionError2) {
        console.error("Error getting session with request:", sessionError2)
      }
    }

    if (!session?.user?.id) {
      console.log("No session found after all attempts")
      return NextResponse.json(
        {
          error: "Unauthorized - No session",
          debug: {
            hasSessionToken: !!sessionToken,
            sessionTokenName: sessionToken?.name,
            cookieCount: cookieStore.getAll().length,
          },
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    console.log("Request body:", body)

    const { content, image_url, tags } = body

    if (!content?.trim()) {
      console.log("No content provided")
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const supabase = createClient()
    console.log("Creating post for user:", session.user.id)

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: session.user.id,
        content: content.trim(),
        image_url,
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
      console.error("Supabase error creating post:", error)
      return NextResponse.json(
        {
          error: "Error creating post in database",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("Post created successfully:", post)

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
    console.error("Error creating post:", error)
    return NextResponse.json(
      {
        error: "Error creating post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
