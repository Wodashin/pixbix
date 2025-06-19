import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const supabase = createClient()

    // Get authenticated user
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

    // Get gallery images
    let query = supabase
      .from("user_gallery")
      .select("*")
      .eq("user_id", targetUserId)
      .order("uploaded_at", { ascending: false })

    // If viewing another user's gallery, only show public images
    if (userId && userId !== user?.id) {
      query = query.eq("is_public", true)
    }

    const { data: images, error } = await query

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

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { image_url, title, description, is_public = false } = body

    // Insert new gallery image
    const { data: newImage, error: insertError } = await supabase
      .from("user_gallery")
      .insert({
        user_id: user.id,
        image_url,
        title,
        description,
        is_public,
        uploaded_at: new Date().toISOString(),
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
