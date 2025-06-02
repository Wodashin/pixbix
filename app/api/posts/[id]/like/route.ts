import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
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
      const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", session.user.id)
      if (error) {
        console.error("Error removing like:", error)
        return NextResponse.json({ error: "Error removing like" }, { status: 500 })
      }
      return NextResponse.json({ liked: false })
    } else {
      // Dar like
      const { error } = await supabase.from("likes").insert({
        post_id: postId,
        user_id: session.user.id,
      })
      if (error) {
        console.error("Error adding like:", error)
        return NextResponse.json({ error: "Error adding like" }, { status: 500 })
      }
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Error toggling like" }, { status: 500 })
  }
}
