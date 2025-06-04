import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { cloudflareStorage } from "@/lib/cloudflare-storage"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const variant = (formData.get("variant") as string) || "post"

    if (!file) {
      return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 })
    }

    // Determinar ruta según el tipo
    const basePath = variant === "avatar" ? "avatars" : variant === "banner" ? "banners" : "posts"

    const userPath = `${basePath}/${session.user.email}`

    // Subir usando Cloudflare Images (recomendado para mejor rendimiento)
    const result = await cloudflareStorage.uploadToCloudflareImages(file)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      // Fallback a R2 si Cloudflare Images falla
      const r2Result = await cloudflareStorage.uploadImage(file, userPath)
      return NextResponse.json(r2Result)
    }
  } catch (error) {
    console.error("Error uploading to Cloudflare:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
