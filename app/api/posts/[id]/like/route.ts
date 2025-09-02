import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id;
    const { type } = await request.json(); // Ahora esperamos 'like' o 'dislike' desde el frontend

    // Verificación para asegurar que el tipo de interacción es válido
    if (!type || (type !== 'like' && type !== 'dislike')) {
      return NextResponse.json({ error: "Tipo de interacción no válido" }, { status: 400 });
    }

    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Busca si ya existe una interacción (like o dislike) del usuario en este post
    const { data: existingInteraction, error: findError } = await supabase
      .from("likes")
      .select("id, type")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();
    
    // Ignoramos el error esperado cuando no se encuentran filas
    if (findError && findError.code !== 'PGRST116') {
        throw findError;
    }

    if (existingInteraction) {
      // Si el usuario hace clic en el mismo botón de nuevo (ej. ya dio like y vuelve a dar like)
      if (existingInteraction.type === type) {
        // Se elimina la interacción (quitar like/dislike)
        const { error: deleteError } = await supabase.from("likes").delete().eq("id", existingInteraction.id);
        if (deleteError) throw deleteError;
        return NextResponse.json({ success: true, message: "Interacción eliminada" });
      } else {
        // Si el usuario cambia su voto (ej. de like a dislike)
        const { error: updateError } = await supabase.from("likes").update({ type }).eq("id", existingInteraction.id);
        if (updateError) throw updateError;
        return NextResponse.json({ success: true, message: "Interacción actualizada" });
      }
    } else {
      // Si no hay ninguna interacción previa, se crea una nueva
      const { error: insertError } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id, type });
      if (insertError) throw insertError;
      return NextResponse.json({ success: true, message: "Interacción añadida" });
    }

  } catch (error) {
    console.error("Error al procesar la interacción:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
