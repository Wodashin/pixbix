import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado. Debe iniciar sesión." }, { status: 401 })
    }

    // Crear cliente de Supabase
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options })
        },
      },
    })

    // Obtener el rol del usuario actual
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single()

    if (currentUserError || !currentUserData) {
      console.error("Error al obtener el rol del usuario:", currentUserError)
      return NextResponse.json({ error: "Error al verificar permisos" }, { status: 500 })
    }

    // Verificar si el usuario tiene permisos de admin o moderador
    const currentUserRole = currentUserData.role
    if (currentUserRole !== "admin" && currentUserRole !== "moderator") {
      return NextResponse.json({ error: "No tiene permisos para realizar esta acción" }, { status: 403 })
    }

    // Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, name, image, role, username")
      .order("role", { ascending: false })

    if (usersError) {
      console.error("Error al obtener usuarios:", usersError)
      return NextResponse.json({ error: "Error al obtener la lista de usuarios" }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error en la API de usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
