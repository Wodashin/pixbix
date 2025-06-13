import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Obtener datos de la solicitud
    const { userId, newRole } = await request.json()

    if (!userId || !newRole) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Validar que el rol sea válido
    const validRoles = ["user", "event_creator", "moderator", "admin"]
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
    }

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

    if (roleError || !currentUserData) {
      console.error("Error al obtener el rol del usuario:", roleError)
      return NextResponse.json({ error: "Error al verificar permisos" }, { status: 500 })
    }

    // Verificar si el usuario tiene permisos para cambiar roles
    const currentUserRole = currentUserData.role

    if (currentUserRole !== "admin" && currentUserRole !== "moderator") {
      return NextResponse.json({ error: "No tiene permisos para cambiar roles" }, { status: 403 })
    }

    // Los moderadores solo pueden asignar roles de usuario y creador de eventos
    if (currentUserRole === "moderator" && (newRole === "admin" || newRole === "moderator")) {
      return NextResponse.json(
        {
          error: "Los moderadores solo pueden asignar roles de usuario y creador de eventos",
        },
        { status: 403 },
      )
    }

    // Actualizar el rol del usuario
    const { error: updateError } = await adminSupabase.from("users").update({ role: newRole }).eq("id", userId)

    if (updateError) {
      console.error("Error al actualizar el rol:", updateError)
      return NextResponse.json({ error: "Error al actualizar el rol" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Rol actualizado correctamente" })
  } catch (error) {
    console.error("Error en la API de actualización de roles:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
