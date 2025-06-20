import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar que el usuario solo pueda acceder a su propio perfil
    if (user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Por ahora devolvemos datos simulados basados en el usuario
    // En el futuro, aquí consultarías la tabla gaming_profiles
    const mockProfile = {
      id: `gaming_${user.id}`,
      userId: user.id,
      username: user.user_metadata?.name || user.email?.split("@")[0] || "Gamer",
      bio: "¡Listo para jugar y hacer nuevos amigos!",
      favoriteGames: ["Valorant", "League of Legends"],
      lookingForGroup: true,
      skillLevel: 65,
      platform: "PC",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(mockProfile)
  } catch (error) {
    console.error("Error fetching gaming profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, username, bio, favoriteGames, lookingForGroup, skillLevel, platform } = body

    // Validaciones
    if (!userId || !username) {
      return NextResponse.json({ error: "User ID and username are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar que el usuario solo pueda crear su propio perfil
    if (user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validar datos
    if (skillLevel < 0 || skillLevel > 100) {
      return NextResponse.json({ error: "Skill level must be between 0 and 100" }, { status: 400 })
    }

    const validPlatforms = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"]
    if (platform && !validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 })
    }

    // Por ahora simulamos la creación
    // En el futuro, aquí insertarías en la tabla gaming_profiles
    const newProfile = {
      id: `gaming_${user.id}`,
      userId: user.id,
      username: username.trim(),
      bio: bio?.trim() || "",
      favoriteGames: Array.isArray(favoriteGames) ? favoriteGames : [],
      lookingForGroup: Boolean(lookingForGroup),
      skillLevel: Number(skillLevel) || 50,
      platform: platform || "PC",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(newProfile, { status: 201 })
  } catch (error) {
    console.error("Error creating gaming profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, username, bio, favoriteGames, lookingForGroup, skillLevel, platform } = body

    // Validaciones
    if (!userId || !username) {
      return NextResponse.json({ error: "User ID and username are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar que el usuario solo pueda actualizar su propio perfil
    if (user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validar datos
    if (skillLevel < 0 || skillLevel > 100) {
      return NextResponse.json({ error: "Skill level must be between 0 and 100" }, { status: 400 })
    }

    const validPlatforms = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"]
    if (platform && !validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 })
    }

    // Por ahora simulamos la actualización
    // En el futuro, aquí actualizarías la tabla gaming_profiles
    const updatedProfile = {
      id: `gaming_${user.id}`,
      userId: user.id,
      username: username.trim(),
      bio: bio?.trim() || "",
      favoriteGames: Array.isArray(favoriteGames) ? favoriteGames : [],
      lookingForGroup: Boolean(lookingForGroup),
      skillLevel: Number(skillLevel) || 50,
      platform: platform || "PC",
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Simular fecha anterior
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error updating gaming profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
