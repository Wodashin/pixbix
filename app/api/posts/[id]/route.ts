import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@/utils/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Delete Post API - Starting...")

    // Método 1: Intentar obtener la sesión de NextAuth
    const session = await getServerSession(authOptions)
    console.log("Delete Post API - NextAuth Session:", session?.user?.email)

    // Método 2: Si no hay sesión de NextAuth, intentar con headers personalizados
    let userEmail = session?.user?.email

    if (!userEmail) {
      const customEmail = request.headers.get("x-user-email")
      if (customEmail) {
        userEmail = customEmail
        console.log("Delete Post API - Using custom header email:", userEmail)
      }
    }

    // Método 3: Intentar obtener email desde Supabase directamente
    if (!userEmail) {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (user?.email) {
        userEmail = user.email
        console.log("Delete Post API - Using Supabase user email:", userEmail)
      }
    }

    if (!userEmail) {
      console.log("Delete Post API - No user email found with any method")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Delete Post API - Final auth result:")
    console.log("- User Email:", userEmail)

    const postId = params.id
    const supabase = createClient()

    // Obtener el post para verificar que el usuario es el propietario
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id, users!posts_user_id_fkey(email)")
      .eq("id", postId)
      .single()

    if (fetchError || !post) {
      console.error("Delete Post API - Post not found:", fetchError)
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Verificar que el usuario es el propietario del post
    if (post.users?.email !== userEmail) {
      console.log("Delete Post API - User is not the owner")
      console.log("- Post owner:", post.users?.email)
      console.log("- Current user:", userEmail)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("Delete Post API - User is the owner, proceeding with deletion")

    // Eliminar el post
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)

    if (deleteError) {
      console.error("Delete Post API - Error deleting post:", deleteError)
      return NextResponse.json({ error: "Error deleting post" }, { status: 500 })
    }

    console.log("Delete Post API - Post deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete Post API - General error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
