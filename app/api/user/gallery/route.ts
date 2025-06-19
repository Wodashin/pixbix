import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const supabase = createClient()

    // Obtener usuario autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const targetUserId = userId || user?.id

    if (!targetUserId) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener imágenes de la galería
    let query = supabase.from("user_gallery").select("*").eq("user_id", targetUserId)

    // Si no es el propio usuario, solo mostrar imágenes públicas
    if (user?.id !== targetUserId) {
      query = query.eq("is_public", true)
    }

    const { data: images, error } = await query.order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Error al obtener galería:", error)
      return NextResponse.json({ error: "Error al obtener galería" }, { status: 500 })
    }

    return NextResponse.json({ images: images || [] })
  } catch (error) {
    console.error("Error en API de galería:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { image_url, title, description, is_public } = body

    // Insertar imagen en la galería
    const { data: newImage, error: insertError } = await supabase
      .from("user_gallery")
      .insert({
        user_id: user.id,
        image_url,
        title,
        description,
        is_public: is_public ?? true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error al guardar imagen:", insertError)
      return NextResponse.json({ error: "Error al guardar imagen" }, { status: 500 })
    }

    return NextResponse.json({ image: newImage })
  } catch (error) {
    console.error("Error en POST de galería:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
