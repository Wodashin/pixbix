import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

// Extrae el Key de R2 a partir de la URL pública
function extractR2Key(imageUrl: string): string | null {
  try {
    const publicUrlBase = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL
    if (!publicUrlBase || !imageUrl.startsWith(publicUrlBase)) return null
    return imageUrl.replace(publicUrlBase + "/", "")
  } catch {
    return null
  }
}

async function deleteFromR2(imageUrl: string) {
  try {
    const key = extractR2Key(imageUrl)
    if (!key) return // No es una imagen de R2, ignorar

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
      },
    })

    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
      Key: key,
    }))

    console.log("✅ Imagen eliminada de R2:", key)
  } catch (error) {
    // No falla el DELETE del post si R2 falla — se loguea y sigue
    console.error("⚠️ No se pudo eliminar la imagen de R2:", error)
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
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

    if (error || !post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }

    const likesData: { type: string }[] = (post as any).likes_data || []
    const formattedPost = {
      ...post,
      likes_data: undefined,
      likes_count: likesData.filter((l) => l.type === "like").length,
      dislikes_count: likesData.filter((l) => l.type === "dislike").length,
      comments_count: (post as any).comments_count?.[0]?.count ?? 0,
    }

    return NextResponse.json({ post: formattedPost })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    const { content, tags } = await request.json()
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo el dueño puede editar
    const { data: updatedPost, error } = await supabase
      .from("posts")
      .update({ content, tags, updated_at: new Date().toISOString() })
      .eq("id", postId)
      .eq("user_id", user.id) // ← seguridad: solo el dueño
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "No se pudo actualizar el post" }, { status: 500 })
    }

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el post primero para saber si tiene imagen y verificar dueño
    const { data: post } = await supabase
      .from("posts")
      .select("user_id, image_url")
      .eq("id", postId)
      .single()

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }

    // Solo el dueño o un admin puede borrar
    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = currentUser?.role === "admin"
    if (post.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "No tienes permiso para eliminar este post" }, { status: 403 })
    }

    // Borrar likes y comentarios (integridad referencial)
    await supabase.from("likes").delete().eq("post_id", postId)
    await supabase.from("comments").delete().eq("post_id", postId)

    // Borrar el post de la BD
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)

    if (error) {
      return NextResponse.json({ error: "No se pudo eliminar el post" }, { status: 500 })
    }

    // Borrar la imagen de Cloudflare R2 si tiene una
    if (post.image_url) {
      await deleteFromR2(post.image_url)
    }

    return NextResponse.json({ success: true, message: "Post eliminado correctamente" })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
