import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Tipos de roles disponibles
type Role = "user" | "event_creator" | "moderator" | "admin"

export async function POST(req: NextRequest) {
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

    // Obtener datos de la solicitud
    const { userId, newRole } = await req.json()

    if (!userId || !newRole) {
      return NextResponse.json({ error: "Faltan datos requeridos (userId o newRole)" }, { status: 400 })
    }

    // Validar el rol
    const validRoles: Role[] = ["user", "event_creator", "moderator", "admin"]
    if (!validRoles.includes(newRole as Role)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
    }

    // Los moderadores solo pueden asignar roles de usuario y event_creator
    if (currentUserRole === "moderator" && (newRole === "admin" || newRole === "moderator")) {
      return NextResponse.json(
        { error: "Los moderadores no pueden asignar roles de administrador o moderador" },
        { status: 403 },
      )
    }

    // Actualizar el rol del usuario
    const { error: updateError } = await supabase.from("users").update({ role: newRole }).eq("id", userId)

    if (updateError) {
      console.error("Error al actualizar el rol:", updateError)
      return NextResponse.json({ error: "Error al actualizar el rol del usuario" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Rol actualizado correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error en la API de roles:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
