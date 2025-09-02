import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// --- OBTENER PUBLICACIONES (GET) ---
// Esta función se encarga de leer todas las publicaciones de tu base de datos.
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Consulta para obtener los posts y la información del autor de la tabla 'users'
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        image_url,
        tags,
        created_at,
        user:users (
          display_name,
          username,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false }); // Ordena para mostrar los más recientes primero

    if (error) {
      console.error("Error al obtener posts:", error);
      throw error;
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error en GET /api/posts:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// --- CREAR UNA NUEVA PUBLICACIÓN (POST) ---
// Esta función guarda una nueva publicación en tu base de datos.
export async function POST(request: NextRequest) {
  try {
    const { content, image_url, tags } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "El contenido es requerido" }, { status: 400 });
    }

    const supabase = createClient();

    // Verifica que el usuario esté autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Inserta la nueva publicación en la tabla 'posts'
    const { data: newPost, error: insertError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content,
        image_url, // Guarda la URL de la imagen si existe
        tags: tags || [],
      })
      .select()
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
