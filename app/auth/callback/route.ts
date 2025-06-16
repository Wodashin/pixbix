import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()

    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(new URL("/login?error=auth_error", origin))
      }

      if (data.user) {
        console.log("Usuario autenticado exitosamente:", data.user.email)

        // Crear o actualizar usuario en la tabla users
        try {
          const { error: upsertError } = await supabase.from("users").upsert(
            {
              id: data.user.id,
              email: data.user.email || "",
              name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
              image: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
              role: "user",
            },
            {
              onConflict: "id",
            },
          )

          if (upsertError) {
            console.error("Error al crear/actualizar usuario:", upsertError)
          }
        } catch (error) {
          console.error("Error al procesar usuario:", error)
        }
      }

      // Redirigir a la página principal después de autenticar
      return NextResponse.redirect(new URL("/", origin))
    } catch (error) {
      console.error("Error inesperado en callback:", error)
      return NextResponse.redirect(new URL("/login?error=unexpected_error", origin))
    }
  }

  // Si no hay código, redirigir a la página de login
  return NextResponse.redirect(new URL("/login?error=no_code", origin))
}
