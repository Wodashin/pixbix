import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Like API - Starting...")

    const session = await getServerSession(authOptions)
    console.log("Like API - Session:", session?.user?.email)

    if (!session?.user?.email) {
      console.log("Like API - No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()
    const postId = params.id

    // Obtener el ID del usuario desde la base de datos
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (userError || !userData) {
      console.error("Like API - Error getting user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Like API - User found:", userData.id)

    // Verificar si ya dio like
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userData.id)
      .single()

    if (existingLike) {
      // Quitar like
      const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userData.id)

      if (error) {
        console.error("Like API - Error removing like:", error)
        return NextResponse.json({ error: "Error removing like" }, { status: 500 })
      }

      console.log("Like API - Like removed")
      return NextResponse.json({ liked: false })
    } else {
      // Dar like
      const { error } = await supabase.from("likes").insert({
        post_id: postId,
        user_id: userData.id,
      })

      if (error) {
        console.error("Like API - Error adding like:", error)
        return NextResponse.json({ error: "Error adding like" }, { status: 500 })
      }

      console.log("Like API - Like added")
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Like API - General error:", error)
    return NextResponse.json({ error: "Error toggling like" }, { status: 500 })
  }
}
