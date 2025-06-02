import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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

        return {
          ...post,
          user: post.users,
          likes_count: likesCount || 0,
          comments_count: 0,
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, image_url, tags, game } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const supabase = createClient()

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
      console.error("Error creating post:", error)
      return NextResponse.json({ error: "Error creating post" }, { status: 500 })
    }

    return NextResponse.json({
      ...post,
      user: post.users,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0,
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Error creating post" }, { status: 500 })
  }
}
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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

        return {
          ...post,
          user: post.users,
          likes_count: likesCount || 0,
          comments_count: 0,
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, image_url, tags, game } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const supabase = createClient()

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
      console.error("Error creating post:", error)
      return NextResponse.json({ error: "Error creating post" }, { status: 500 })
    }

    return NextResponse.json({
      ...post,
      user: post.users,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0,
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Error creating post" }, { status: 500 })
  }
}
