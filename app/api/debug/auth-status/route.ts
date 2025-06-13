import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createClient()

    // Obtener sesión de Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // Listar cookies (solo nombres por seguridad)
    const cookieList = cookieStore.getAll().map((cookie) => cookie.name)

    return NextResponse.json({
      supabase: {
        hasSession: !!session,
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              metadata: session.user.user_metadata,
            }
          : null,
        error: error?.message,
      },
      cookies: cookieList,
    })
  } catch (error) {
    console.error("Error en debug:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
