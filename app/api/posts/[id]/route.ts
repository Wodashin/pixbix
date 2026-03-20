import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// GET - obtener un post por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    if (!postId) return NextResponse.json({ error: "ID de post requerido" }, { status: 400 })

    const supabase = createClient()
    const { data: post, error } = await supabase
      .from("posts")
      .select(`
        id, content, image_url, tags, created_at, user_id,
        user:users ( display_name, username, avatar_url ),
        likes_data:likes ( type ),
        comments_count:comments ( count )
      `)
      .eq("id", postId)
      .single()

    if (error) return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })

    return NextResponse.json({ post })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT - editar un post
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    const { content, tags } = await request.json()
    if (!postId) return NextResponse.json({ error: "ID de post requerido" }, { status: 400 })

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    // Verificar que el post pertenece al usuario
    const { data: existing } = await supabase.from("posts").select("user_id").eq("id", postId).single()
    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "No tienes permiso para editar este post" }, { status: 403 })
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from("posts")
      .update({ content, tags, updated_at: new Date().toISOString() })
      .eq("id", postId)
      .select()
      .single()

    if (updateError) return NextResponse.json({ error: "Error al actualizar el post" }, { status: 500 })
    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - eliminar un post (CORREGIDO: antes simulaba, ahora realmente borra)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    if (!postId) return NextResponse.json({ error: "ID de post requerido" }, { status: 400 })

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    // Verificar que el post pertenece al usuario (o es admin)
    const { data: existing } = await supabase.from("posts").select("user_id").eq("id", postId).single()
    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "No tienes permiso para eliminar este post" }, { status: 403 })
    }

    // Borrar likes y comentarios del post primero (integridad referencial)
    await supabase.from("likes").delete().eq("post_id", postId)
    await supabase.from("comments").delete().eq("post_id", postId)

    // Borrar el post
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)
    if (deleteError) return NextResponse.json({ error: "Error al eliminar el post" }, { status: 500 })

    return NextResponse.json({ success: true, message: "Post eliminado correctamente" })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
