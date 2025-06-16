import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variables de entorno necesarias para OAuth
    const config = {
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      oauth: {
        google: {
          clientId: !!process.env.GOOGLE_CLIENT_ID,
          clientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        },
        discord: {
          clientId: !!process.env.DISCORD_CLIENT_ID,
          clientSecret: !!process.env.DISCORD_CLIENT_SECRET,
        },
      },
      urls: {
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      },
    }

    return NextResponse.json({
      config,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en debug de configuración:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
