import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🧪 Probando conexión a Supabase...")

    // Prueba simple de conexión
    const { data, error } = await supabaseAdmin.from("users").select("count").limit(1)

    if (error) {
      console.error("❌ Error en prueba:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("✅ Conexión exitosa")
    return NextResponse.json({
      success: true,
      message: "Conexión a Supabase exitosa",
      data,
    })
  } catch (error) {
    console.error("💥 Error de conexión:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
