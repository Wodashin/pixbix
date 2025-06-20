import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    // Rutas públicas que no requieren autenticación
    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/auth/callback",
      "/comunidad",
      "/compañeros", // Ruta con ñ
      "/companeros", // Versión sin ñ por si acaso
      "/noticias",
      "/eventos",
      "/marketplace",
      "/debug",
      "/error", // Página de error
    ]

    // Verificar si la ruta actual es pública
    const url = request.nextUrl.pathname
    console.log("Middleware - Processing URL:", url)

    const isPublicRoute = publicRoutes.some(
      (route) =>
        url === route ||
        url.startsWith("/api/") ||
        url.startsWith("/_next/") ||
        url.startsWith("/auth/") ||
        url.includes("favicon") ||
        url.includes("."), // Static files
    )

    console.log("Middleware - Is public route:", isPublicRoute)

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

    // Obtener el usuario (esto actualiza la sesión automáticamente)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.log("Middleware - Auth error:", authError.message)
    }

    console.log("Middleware - Has user:", !!user)

    // Si es una ruta pública, permitir acceso independientemente del estado de autenticación
    if (isPublicRoute) {
      console.log("Middleware - Allowing public route")
      return supabaseResponse
    }

    // Para rutas protegidas, verificar si hay usuario
    if (!user) {
      console.log("Middleware - Redirecting to login")
      // Redirigir a login si no hay usuario en ruta protegida
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = "/login"
      loginUrl.searchParams.set("redirectTo", url)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  } catch (error) {
    console.error("Middleware error:", error)
    // En caso de error, permitir el acceso pero logear el error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
