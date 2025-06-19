import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variables de entorno de OAuth
    const providers = {
      google: {
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        clientId: process.env.GOOGLE_CLIENT_ID ? "Configurado" : "Faltante",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Configurado" : "Faltante",
      },
      discord: {
        configured: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
        clientId: process.env.DISCORD_CLIENT_ID ? "Configurado" : "Faltante",
        clientSecret: process.env.DISCORD_CLIENT_SECRET ? "Configurado" : "Faltante",
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurado" : "Faltante",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurado" : "Faltante",
      },
    }

    return NextResponse.json(providers)
  } catch (error) {
    console.error("Error al verificar providers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
