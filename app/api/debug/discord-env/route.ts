import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET

    return NextResponse.json({
      clientId: clientId || null,
      clientSecret: !!clientSecret, // Solo devolvemos si existe, no el valor
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
    })
  } catch (error) {
    console.error("Error checking Discord environment variables:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
