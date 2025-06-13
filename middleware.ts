import type { NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

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
  ]

  // Verificar si la ruta actual es pública
  const url = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.some(
    (route) => url === route || url.startsWith("/api/") || url.startsWith("/_next/"),
  )

  // Si es una ruta pública, solo actualizar la sesión sin redireccionar
  if (isPublicRoute) {
    return await updateSession(request)
  }

  // Para rutas protegidas, actualizar sesión y verificar autenticación
  const response = await updateSession(request)

  // Obtener la URL de la respuesta para verificar si hubo redirección
  const responseUrl = response.headers.get("location")

  // Si hay redirección a login, significa que no hay sesión
  if (responseUrl && responseUrl.includes("/login")) {
    return response
  }

  return response
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
import type { NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

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
  ]

  // Verificar si la ruta actual es pública
  const url = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.some(
    (route) => url === route || url.startsWith("/api/") || url.startsWith("/_next/"),
  )

  // Si es una ruta pública, solo actualizar la sesión sin redireccionar
  if (isPublicRoute) {
    return await updateSession(request)
  }

  // Para rutas protegidas, actualizar sesión y verificar autenticación
  const response = await updateSession(request)

  // Obtener la URL de la respuesta para verificar si hubo redirección
  const responseUrl = response.headers.get("location")

  // Si hay redirección a login, significa que no hay sesión
  if (responseUrl && responseUrl.includes("/login")) {
    return response
  }

  return response
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
import type { NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

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
  ]

  // Verificar si la ruta actual es pública
  const url = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.some(
    (route) => url === route || url.startsWith("/api/") || url.startsWith("/_next/"),
  )

  // Si es una ruta pública, solo actualizar la sesión sin redireccionar
  if (isPublicRoute) {
    return await updateSession(request)
  }

  // Para rutas protegidas, actualizar sesión y verificar autenticación
  const response = await updateSession(request)

  // Obtener la URL de la respuesta para verificar si hubo redirección
  const responseUrl = response.headers.get("location")

  // Si hay redirección a login, significa que no hay sesión
  if (responseUrl && responseUrl.includes("/login")) {
    return response
  }

  return response
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
