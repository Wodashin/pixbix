import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    "/error",
    "/accesibilidad",
    "/privacidad",
    "/seguridad",
    "/terminos",
    "/sitemap",
    "/desarrolladores",
    "/configuracion",
  ];

  const url = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(url);

  // Si el usuario no está autenticado y la ruta no es pública, redirigir a /login
  if (!user && !isPublicRoute) {
    console.log(
      "Middleware: Redirigiendo usuario no autenticado desde una ruta protegida."
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
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
};
