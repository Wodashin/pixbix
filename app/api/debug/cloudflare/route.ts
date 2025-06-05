import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variables de entorno
    const config = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID ? "✅ Set" : "❌ Missing",
      apiToken: process.env.CLOUDFLARE_API_TOKEN ? "✅ Set" : "❌ Missing",
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing",
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing",
      bucketName: process.env.CLOUDFLARE_BUCKET_NAME ? "✅ Set" : "❌ Missing",
      customDomain: process.env.CLOUDFLARE_CUSTOM_DOMAIN ? "✅ Set" : "❌ Missing",
    }

    // Mostrar valores parciales (sin exponer secretos)
    const values = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID
        ? `${process.env.CLOUDFLARE_ACCOUNT_ID.substring(0, 8)}...`
        : "Not set",
      bucketName: process.env.CLOUDFLARE_BUCKET_NAME || "Not set",
      customDomain: process.env.CLOUDFLARE_CUSTOM_DOMAIN || "Not set",
    }

    return NextResponse.json({
      message: "Cloudflare R2 Configuration Debug",
      config,
      values,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error checking configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
