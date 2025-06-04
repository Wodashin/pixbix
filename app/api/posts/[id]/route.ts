import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@/utils/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = params.id
    const supabase = createClient()

    // Obtener el post para verificar que el usuario es el propietario
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id, users!posts_user_id_fkey(email)")
      .eq("id", postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Verificar que el usuario es el propietario del post
    if (post.users?.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Eliminar el post
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)

    if (deleteError) {
      console.error("Error deleting post:", deleteError)
      return NextResponse.json({ error: "Error deleting post" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE post:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
