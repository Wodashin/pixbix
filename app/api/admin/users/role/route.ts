import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado. Debe iniciar sesión." }, { status: 401 })
    }

    // Obtener datos de la solicitud
    const { userId, newRole } = await request.json()

    if (!userId || !newRole) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Validar el rol
    const validRoles = ["user", "event_creator", "moderator", "admin"]
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
    }

    // Crear cliente de Supabase con la clave de servicio
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    // Verificar si el usuario tiene permisos para cambiar roles
    const currentUserRole = currentUserData.role
    if (currentUserRole !== "admin" && currentUserRole !== "moderator") {
      return NextResponse.json({ error: "No tiene permisos para realizar esta acción" }, { status: 403 })
    }

    // Los moderadores no pueden crear otros moderadores o administradores
    if (currentUserRole === "moderator" && (newRole === "moderator" || newRole === "admin")) {
      return NextResponse.json(
        { error: "Los moderadores no pueden asignar roles de moderador o administrador" },
        { status: 403 },
      )
    }

    // Actualizar el rol del usuario
    const { error: updateError } = await supabase.from("users").update({ role: newRole }).eq("id", userId)

    if (updateError) {
      console.error("Error al actualizar el rol:", updateError)
      return NextResponse.json({ error: "Error al actualizar el rol del usuario" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Rol actualizado a ${newRole}` })
  } catch (error) {
    console.error("Error en la API de actualización de roles:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
