import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/auth/callback",
      "/comunidad",
      "/compañeros",
      "/companeros",
      "/noticias",
      "/eventos",
      "/marketplace",
      "/debug",
      "/error",
      // Agrega aquí cualquier otra ruta pública
      "/accesibilidad", //
      "/privacidad", //
      "/seguridad", //
      "/terminos", //
      "/sitemap", //
      "/desarrolladores", //
      "/configuracion", //
    ]

    const url = request.nextUrl.pathname
    const isPublicRoute = publicRoutes.some(
      (route) =>
        url === route ||
        url.startsWith("/api/") ||
        url.startsWith("/_next/") ||
        url.startsWith("/auth/") ||
        url.includes("favicon") ||
        url.includes("."),
    )

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.log("Middleware - Auth error:", authError.message)
    }

    if (!user) {
      console.log("Middleware - Redirecting unauthenticated user from protected route")
      // Opción A: Redirigir a la página principal
      return NextResponse.redirect(new URL("/", request.url))
      // Opción B: Redirigir a una página de "acceso denegado"
      // return NextResponse.redirect(new URL("/acceso-denegado", request.url))
    }

    return supabaseResponse
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
