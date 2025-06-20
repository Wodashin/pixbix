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

    // Por ahora devolvemos datos simulados
    // En el futuro, aquí consultarías la tabla gaming_profiles
    const mockProfile = {
      id: "1",
      userId: user.id,
      username: user.user_metadata?.name || user.email?.split("@")[0] || "Gamer",
      bio: "Gaming enthusiast ready to play!",
      favoriteGames: ["Valorant", "League of Legends", "Apex Legends"],
      lookingForGroup: true,
      skillLevel: 75,
      platform: "PC",
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

    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Por ahora simulamos la creación
    // En el futuro, aquí insertarías en la tabla gaming_profiles
    const newProfile = {
      id: Date.now().toString(),
      userId: user.id,
      username,
      bio,
      favoriteGames,
      lookingForGroup,
      skillLevel,
      platform,
      createdAt: new Date().toISOString(),
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
    const { id, username, bio, favoriteGames, lookingForGroup, skillLevel, platform } = body

    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Por ahora simulamos la actualización
    // En el futuro, aquí actualizarías la tabla gaming_profiles
    const updatedProfile = {
      id,
      userId: user.id,
      username,
      bio,
      favoriteGames,
      lookingForGroup,
      skillLevel,
      platform,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error updating gaming profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
