import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Crear cliente de Supabase con cookies para obtener la sesión
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

    // Obtener el token de acceso de las cookies
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      console.log("No se encontró token de acceso")
      return NextResponse.json({ error: "No autorizado. Debe iniciar sesión." }, { status: 401 })
    }

    // Crear cliente de Supabase con la clave de servicio
    const adminSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Obtener información del usuario desde el token
    const {
      data: { user },
      error: userError,
    } = await adminSupabase.auth.getUser(accessToken)

    if (userError || !user) {
      console.log("Error al obtener usuario:", userError)
      return NextResponse.json({ error: "No autorizado. Debe iniciar sesión." }, { status: 401 })
    }

    // Obtener el rol del usuario actual
    const { data: currentUserData, error: roleError } = await adminSupabase
      .from("users")
      .select("role")
      .eq("email", user.email)
      .single()

    if (roleError) {
      console.error("Error al obtener el rol del usuario:", roleError)
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
    const { data: users, error: usersError } = await adminSupabase
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
