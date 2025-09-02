import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// --- OBTENER COMENTARIOS DE UN POST (GET) ---
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id;

    if (!postId) {
      return NextResponse.json({ error: "ID de post requerido" }, { status: 400 });
    }

    const supabase = createClient();

    // Consulta para obtener los comentarios y la información de sus autores
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:users (
          display_name,
          username,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true }); // Ordena para mostrar los más antiguos primero

    if (error) {
      console.error("Error al obtener comentarios:", error);
      return NextResponse.json({ error: "Error al obtener comentarios" }, { status: 500 });
    }

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error en GET /api/posts/[id]/comments:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// --- PUBLICAR UN NUEVO COMENTARIO (POST) ---
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "El contenido del comentario es requerido" }, { status: 400 });
    }

    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Inserta el nuevo comentario en la tabla 'comments'
    const { data: newComment, error: insertError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error al guardar comentario:", insertError);
      return NextResponse.json({ error: "Error al guardar el comentario" }, { status: 500 });
    }

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/posts/[id]/comments:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
