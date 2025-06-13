import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ isAuthorized: false, error: "No autorizado" }, { status: 401 })
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

    // Obtener el rol del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single()

    if (userError || !userData) {
      console.error("Error al obtener el rol del usuario:", userError)
      return NextResponse.json({ isAuthorized: false, error: "Error al verificar permisos" }, { status: 500 })
    }

    // Verificar si el usuario tiene permisos de admin o moderador
    const isAuthorized = ["admin", "moderator"].includes(userData.role)

    return NextResponse.json({ isAuthorized })
  } catch (error) {
    console.error("Error en la API de verificación de permisos:", error)
    return NextResponse.json({ isAuthorized: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
