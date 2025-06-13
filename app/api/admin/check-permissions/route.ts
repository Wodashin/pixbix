import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Crear cliente de Supabase con cookies para obtener la sesión
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Obtener el token de acceso de las cookies
    const accessToken = cookieStore.get("sb-access-token")?.value
    const refreshToken = cookieStore.get("sb-refresh-token")?.value

    if (!accessToken) {
      console.log("No se encontró token de acceso")
      return NextResponse.json({ isAuthorized: false, error: "No autorizado" }, { status: 401 })
    }

    // Crear cliente de Supabase con la clave de servicio para consultar la base de datos
    const adminSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Obtener información del usuario desde el token
    const {
      data: { user },
      error: userError,
    } = await adminSupabase.auth.getUser(accessToken)

    if (userError || !user) {
      console.log("Error al obtener usuario:", userError)
      return NextResponse.json({ isAuthorized: false, error: "No autorizado" }, { status: 401 })
    }

    // Obtener el rol del usuario
    const { data: userData, error: roleError } = await adminSupabase
      .from("users")
      .select("role")
      .eq("email", user.email)
      .single()

    if (roleError) {
      console.error("Error al obtener el rol del usuario:", roleError)
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
