import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(new URL("/login?error=auth", request.url))
    }

    // Después de autenticar, redirigir a la página principal
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Si no hay código, redirigir a la página de login
  return NextResponse.redirect(new URL("/login", request.url))
}
