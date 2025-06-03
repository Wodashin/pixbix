import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { supabaseAdmin } from "@/lib/supabase"

// Importar authOptions desde el archivo de NextAuth
const authOptions = {
  // Configuración básica para getServerSession
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id
      }
      return session
    },
  },
}

export async function GET() {
  try {
    console.log("📖 Obteniendo posts...")

    const { data: posts, error } = await supabaseAdmin!
      .from("posts")
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error obteniendo posts:", error)
      return NextResponse.json({ error: "Error obteniendo posts" }, { status: 500 })
    }

    console.log(`✅ Posts obtenidos: ${posts?.length || 0}`)
    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    console.error("💥 Error general:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Verificando sesión...")

    // Intentar obtener la sesión de múltiples formas
    const session = await getServerSession(authOptions)
    console.log("📋 Sesión obtenida:", session ? "✅ Válida" : "❌ Nula")

    if (!session?.user?.id) {
      console.log("❌ No hay sesión válida")
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 })
    }

    console.log("👤 Usuario autenticado:", session.user.id)

    const body = await request.json()
    console.log("📝 Datos recibidos:", body)

    const { content, game_tags = [], image_url = null } = body

    if (!content || content.trim().length === 0) {
      console.log("❌ Contenido vacío")
      return NextResponse.json({ error: "El contenido es requerido" }, { status: 400 })
    }

    // Buscar el usuario en Supabase
    console.log("🔍 Buscando usuario en Supabase...")
    const { data: user, error: userError } = await supabaseAdmin!
      .from("users")
      .select("id, email")
      .eq("email", session.user.email)
      .single()

    if (userError || !user) {
      console.error("❌ Usuario no encontrado en Supabase:", userError)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("✅ Usuario encontrado:", user.id)

    // Crear el post
    console.log("📝 Creando post...")
    const postData = {
      user_id: user.id,
      content: content.trim(),
      game_tags: game_tags,
      image_url: image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newPost, error: postError } = await supabaseAdmin!
      .from("posts")
      .insert([postData])
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (postError) {
      console.error("❌ Error creando post:", postError)
      return NextResponse.json({ error: "Error creando el post" }, { status: 500 })
    }

    console.log("🎉 Post creado exitosamente:", newPost.id)
    return NextResponse.json({ post: newPost }, { status: 201 })
  } catch (error) {
    console.error("💥 Error general en POST:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
