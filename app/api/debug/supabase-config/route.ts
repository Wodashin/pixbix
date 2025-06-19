import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const vercelUrl = process.env.VERCEL_URL
    const nextAuthUrl = process.env.NEXTAUTH_URL

    return NextResponse.json({
      supabaseUrl,
      supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : null,
      siteUrl,
      vercelUrl,
      nextAuthUrl,
      currentOrigin: typeof window !== "undefined" ? window.location.origin : "server-side",
    })
  } catch (error) {
    console.error("Error checking Supabase configuration:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
