import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession()

    if (!session?.user?.email) {
      console.log("No hay sesión de usuario")
      return NextResponse.json({ error: "No autorizado. Debe iniciar sesión." }, { status: 401 })
    }

    // Crear cliente de Supabase con la clave de servicio
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Obtener el rol del usuario actual
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("users")
      .select("role")
      .eq("email", session.user.email)
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
