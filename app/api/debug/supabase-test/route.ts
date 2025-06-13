import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Verificar conexión a la base de datos
    const { data: testData, error: testError } = await supabase.from("users").select("count").limit(1)

    // Verificar configuración de autenticación
    const { data: authData, error: authError } = await supabase.auth.getSession()

    return NextResponse.json({
      database: {
        connected: !testError,
        error: testError?.message,
        usersTableExists: !testError,
      },
      auth: {
        configured: !authError,
        error: authError?.message,
        hasSession: !!authData.session,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en test de Supabase:", error)
    return NextResponse.json(
      {
        error: "Error al conectar con Supabase",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
