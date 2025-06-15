import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/auth/callback",
    "/comunidad",
    "/compañeros",
    "/noticias",
    "/eventos",
    "/marketplace",
    "/debug",
  ]

  // Verificar si la ruta actual es pública
  const url = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.some(
    (route) => url === route || url.startsWith("/api/") || url.startsWith("/_next/") || url.startsWith("/auth/"),
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

  // Obtener el usuario (esto actualiza la sesión automáticamente)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si es una ruta pública, permitir acceso independientemente del estado de autenticación
  if (isPublicRoute) {
    return supabaseResponse
  }

  // Para rutas protegidas, verificar si hay usuario
  if (!user) {
    // Redirigir a login si no hay usuario en ruta protegida
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
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
