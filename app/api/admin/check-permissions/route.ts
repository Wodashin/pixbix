import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession()

    if (!session?.user?.email) {
      console.log("No hay sesión de usuario")
      return NextResponse.json({ isAuthorized: false, error: "No autorizado" }, { status: 401 })
    }

    // Crear cliente de Supabase con la clave de servicio
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Obtener el rol del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", session.user.email)
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
