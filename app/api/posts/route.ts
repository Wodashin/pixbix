import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// --- OBTENER PUBLICACIONES (GET) ---
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Obtenemos el usuario actual (puede ser null si no está logueado)
    const { data: { user } } = await supabase.auth.getUser();

    // Consulta para obtener los posts con autor y contadores
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        image_url,
        tags,
        created_at,
        user_id,
        user:users (
          display_name,
          username,
          avatar_url
        ),
        likes_data:likes ( type ),
        comments_count:comments ( count )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener posts:", error);
      throw error;
    }

    // Si el usuario está logueado, obtenemos sus interacciones para marcar qué posts ya likeó
    let userInteractions: Record<number, "like" | "dislike"> = {};
    if (user) {
      const { data: interactions } = await supabase
        .from("likes")
        .select("post_id, type")
        .eq("user_id", user.id);

      if (interactions) {
        userInteractions = interactions.reduce((acc, interaction) => {
          acc[interaction.post_id] = interaction.type;
          return acc;
        }, {} as Record<number, "like" | "dislike">);
      }
    }

    // Formateamos los posts para que los contadores sean números simples
    const formattedPosts = (posts || []).map((post: any) => {
      const likesData: { type: string }[] = post.likes_data || [];
      return {
        ...post,
        likes_data: undefined, // limpiamos el campo raw
        likes_count: likesData.filter((l) => l.type === "like").length,
        dislikes_count: likesData.filter((l) => l.type === "dislike").length,
        comments_count: post.comments_count?.[0]?.count ?? 0,
        user_interaction: userInteractions[post.id] || null,
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error en GET /api/posts:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// --- CREAR UNA NUEVA PUBLICACIÓN (POST) ---
export async function POST(request: NextRequest) {
  try {
    const { content, image_url, tags } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "El contenido es requerido" }, { status: 400 });
    }

    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: newPost, error: insertError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content,
        image_url: image_url || null,
        tags: tags || [],
      })
      .select("id, content, image_url, tags, created_at, user_id")
      .single();

    if (insertError) {
      console.error("Error al crear el post:", insertError);
      return NextResponse.json({ error: "No se pudo crear el post" }, { status: 500 });
    }

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/posts:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
