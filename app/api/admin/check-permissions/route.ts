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
      return NextResponse.json({ isAuthorized: false, error: "No autorizado" }, { status: 401 })
    }

    // Crear cliente de Supabase con la clave de servicio para consultar la base de datos
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Obtener el rol del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", userEmail)
      .single()

    if (userError) {
      console.error("Error al obtener el rol del usuario:", userError)
      return NextResponse.json({ isAuthorized: false, error: "Error al verificar permisos" }, { status: 500 })
    }

    if (!userData) {
      console.log("No se encontró el usuario en la base de datos")
      return NextResponse.json({ isAuthorized: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("Rol del usuario:", userData.role)

    // Verificar si el usuario tiene permisos de admin o moderador
    const isAuthorized = ["admin", "moderator"].includes(userData.role)

    return NextResponse.json({ isAuthorized, role: userData.role })
  } catch (error) {
    console.error("Error en la API de verificación de permisos:", error)
    return NextResponse.json({ isAuthorized: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
