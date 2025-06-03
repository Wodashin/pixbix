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

    // MÉTODO 1: Intentar con cookies de NextAuth directamente
    const sessionToken =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value

    console.log("🍪 Session token found:", !!sessionToken)

    if (sessionToken) {
      // Decodificar el token de sesión (esto es un ejemplo simplificado)
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        })

        if (response.ok) {
          const session = await response.json()
          console.log("🔑 NextAuth session from API:", session?.user?.email)

          if (session?.user?.email) {
            userEmail = session.user.email

            // Buscar usuario en Supabase
            const supabase = createClient()
            const { data: user } = await supabase.from("users").select("id").eq("email", userEmail).single()

            if (user) {
              userId = user.id
              console.log("✅ User found via NextAuth API:", userId)
            }
          }
        }
      } catch (error) {
        console.log("⚠️ Error fetching session from API:", error)
      }
    }

    // MÉTODO 2: Header Authorization (si existe)
    if (!userId) {
      const authHeader = request.headers.get("authorization")
      console.log("🔐 Auth header:", !!authHeader)

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        // Aquí podrías verificar el token si usas JWT personalizado
        console.log("🎫 Bearer token found")
      }
    }

    // MÉTODO 3: Supabase auth (método original)
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

    // MÉTODO 4: NextAuth getServerSession (método original)
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

    console.log("📊 Final auth result:")
    console.log("  - User ID:", userId)
    console.log("  - User Email:", userEmail)

    if (!userId) {
      console.log("❌ No session found with any method")
      return NextResponse.json(
        {
          error: "Unauthorized - No session found",
          debug: {
            sessionToken: !!sessionToken,
            methods_tried: ["nextauth_api", "auth_header", "supabase", "nextauth_server"],
          },
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    console.log("📝 Request body:", body)

    const { content, image_url, tags } = body

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
