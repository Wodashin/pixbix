import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)

    // Después de autenticar, redirigir a la página principal
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Si no hay código, redirigir a la página de login
  return NextResponse.redirect(new URL("/login", request.url))
}
