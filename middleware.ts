import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // TEMPORALMENTE: Permitir TODAS las rutas para debuggear
  // Solo bloquear rutas específicas de admin que realmente necesiten protección
  if (pathname.startsWith("/admin/usuarios")) {
    // Solo estas rutas necesitan autenticación por ahora
    console.log(`🔒 Ruta protegida: ${pathname}`)
    // Aquí iría la lógica de autenticación más tarde
  }

  // Permitir todo lo demás
  console.log(`✅ Permitiendo: ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
