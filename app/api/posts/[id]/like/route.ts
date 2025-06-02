import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()
    const postId = params.id

    // Verificar si ya dio like
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", session.user.id)
      .single()

    if (existingLike) {
      // Quitar like
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", session.user.id)
      return NextResponse.json({ liked: false })
    } else {
      // Dar like
      await supabase.from("likes").insert({
        post_id: postId,
        user_id: session.user.id,
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Error toggling like" }, { status: 500 })
  }
}
