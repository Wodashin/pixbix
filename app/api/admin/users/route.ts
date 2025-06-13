import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Obtener email del usuario de diferentes fuentes
    let userEmail = null

    // 1. Intentar obtener email desde NextAuth
    const session = await getServerSession()
    if (session?.user?.email) {
      userEmail = session.user.email
      console.log("Email obtenido de NextAuth:", userEmail)
    }

    // 2. Si no hay sesión de NextAuth, intentar con Supabase
    if (!userEmail) {
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

      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      if (user?.email) {
        userEmail = user.email
        console.log("Email obtenido de Supabase:", userEmail)
      }
    }

    // Si no hay email en ninguna fuente, no hay sesión
    if (!userEmail) {
      console.log("No se encontró sesión de usuario en ninguna fuente")
      return NextResponse.json({ error: "No autorizado. Debe iniciar sesión." }, { status: 401 })
    }

    // Crear cliente de Supabase con la clave de servicio
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Obtener el rol del usuario actual
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("users")
      .select("role")
      .eq("email", userEmail)
      .single()

    if (currentUserError) {
      console.error("Error al obtener el rol del usuario:", currentUserError)
      return NextResponse.json({ error: "Error al verificar permisos" }, { status: 500 })
    }

    if (!currentUserData) {
      console.log("No se encontró el usuario en la base de datos")
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("Rol del usuario actual:", currentUserData.role)

    // Verificar si el usuario tiene permisos de admin o moderador
    const currentUserRole = currentUserData.role
    if (currentUserRole !== "admin" && currentUserRole !== "moderator") {
      console.log("Usuario sin permisos suficientes:", currentUserRole)
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
