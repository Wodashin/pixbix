import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // CORREGIDO: bloquear rutas de debug y test en producción
  const url = request.nextUrl.pathname;
  const isProduction = process.env.NODE_ENV === "production";

  const debugRoutes = ["/debug", "/test-upload", "/api/debug", "/api/test-supabase"];
  const isDebugRoute = debugRoutes.some((route) => url.startsWith(route));

  if (isProduction && isDebugRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const publicRoutes = [
    "/", "/login", "/register", "/forgot-password", "/reset-password",
    "/auth/callback", "/comunidad", "/compañeros", "/noticias",
    "/eventos", "/marketplace", "/error", "/accesibilidad", "/privacidad",
    "/seguridad", "/terminos", "/sitemap", "/desarrolladores", "/configuracion",
  ];

  const isPublicRoute =
    publicRoutes.includes(url) ||
    url.startsWith("/api/") || // Las APIs manejan su propia auth
    url.startsWith("/_next/") ||
    url.startsWith("/public/");

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
