import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { Database } from "@/lib/database.types"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = session.user

  const body = await request.json()
  const { name, username } = body

  // Verificar si el username ya existe (si se está actualizando)
  if (username) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "Este nombre de usuario ya está en uso" }, { status: 400 })
    }
  }

  const { error } = await supabase
    .from("users")
    .update({
      name,
      username,
    })
    .eq("id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Profile updated" }, { status: 200 })
}
