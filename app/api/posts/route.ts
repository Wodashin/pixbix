import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { content, game_id, achievement_id, image_url } = await request.json()

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      content,
      user_id: user.id,
      game_id: game_id || null,
      achievement_id: achievement_id || null,
      image_url: image_url || null, // Agregar esta línea
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }

  return NextResponse.json(post)
}
