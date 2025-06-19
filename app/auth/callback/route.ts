import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("Auth callback - Code:", !!code)
  console.log("Auth callback - Error:", error)
  console.log("Auth callback - Error Description:", errorDescription)
  console.log("Auth callback - Next:", next)

  // Si hay un error en los parámetros, redirigir con el error
  if (error) {
    console.error("OAuth error:", error, errorDescription)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url))
  }

  if (code) {
    const supabase = createClient()

    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
      }

      console.log("Auth callback - Session created successfully for:", data.user?.email)

      // Verificar que el usuario se creó en la tabla users
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (userError) {
          console.error("Error verificando usuario en tabla users:", userError)
          // No redirigir con error, el trigger debería manejar esto
        } else {
          console.log("Usuario verificado en tabla users:", userData?.id)
        }
      }

      // Redirigir a la página solicitada o a la página principal
      return NextResponse.redirect(new URL(next, request.url))
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      return NextResponse.redirect(new URL("/login?error=unexpected_error", request.url))
    }
  }

  // Si no hay código, redirigir a la página de login
  console.log("Auth callback - No code provided")
  return NextResponse.redirect(new URL("/login?error=no_code", request.url))
}
