import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Recopilar información de depuración
    const debug = {
      nextauth: null,
      supabase: null,
      cookies: [],
    }

    // 1. Verificar sesión de NextAuth
    try {
      const session = await getServerSession()
      debug.nextauth = {
        hasSession: !!session,
        user: session?.user
          ? {
              email: session.user.email,
              name: session.user.name,
              image: session.user.image,
            }
          : null,
      }
    } catch (error) {
      debug.nextauth = { error: "Error al obtener sesión de NextAuth" }
    }

    // 2. Verificar sesión de Supabase
    try {
      const cookieStore = cookies()
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name) {
              return cookieStore.get(name)?.value
            },
          },
        },
      )

      const { data, error } = await supabaseClient.auth.getSession()
      debug.supabase = {
        hasSession: !!data.session,
        user: data.session?.user
          ? {
              email: data.session.user.email,
              id: data.session.user.id,
            }
          : null,
        error: error ? error.message : null,
      }
    } catch (error) {
      debug.supabase = { error: "Error al obtener sesión de Supabase" }
    }

    // 3. Listar cookies (solo nombres por seguridad)
    const cookieStore = cookies()
    debug.cookies = cookieStore.getAll().map((cookie) => cookie.name)

    return NextResponse.json(debug)
  } catch (error) {
    console.error("Error en la API de estado de autenticación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
