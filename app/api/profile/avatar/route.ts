import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 })
    }

    // Validar tamaño de archivo (5MB máximo)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "El archivo es demasiado grande (máximo 5MB)" }, { status: 400 })
    }

    // Aquí iría la lógica para subir el archivo a un servicio de almacenamiento
    // Por ejemplo, Supabase Storage o Cloudflare R2
    // Por ahora, simulamos una respuesta exitosa

    // Simular URL de avatar
    const avatarUrl = `/placeholder.svg?height=200&width=200&query=user-${user.id}`

    // Actualizar el perfil del usuario con la nueva URL de avatar
    const { error: updateError } = await supabase.from("users").update({ image: avatarUrl }).eq("id", user.id)

    if (updateError) {
      console.error("Error al actualizar avatar en la base de datos:", updateError)
      return NextResponse.json({ error: "Error al actualizar avatar" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
    })
  } catch (error) {
    console.error("Error al subir avatar:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
