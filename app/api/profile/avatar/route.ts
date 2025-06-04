import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { avatar_url } = await request.json()

    if (!avatar_url) {
      return NextResponse.json({ error: "URL de avatar requerida" }, { status: 400 })
    }

    const supabase = createClient()

    // Actualizar avatar en la base de datos
    const { error } = await supabase.from("users").update({ avatar_url }).eq("email", session.user.email)

    if (error) {
      console.error("Error updating avatar:", error)
      return NextResponse.json({ error: "Error al actualizar avatar" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in avatar update:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
