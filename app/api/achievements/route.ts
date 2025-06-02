import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/achievements - Obtener logros del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Obtener el ID del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const targetUserId = userId || userData.id

    // Obtener logros del usuario
    const { data: userAchievements, error } = await supabase
      .from("user_achievements")
      .select(`
        *,
        achievement:achievement_id (
          id,
          name,
          description,
          icon,
          category,
          points,
          rarity
        )
      `)
      .eq("user_id", targetUserId)
      .order("earned_at", { ascending: false })

    if (error) {
      console.error("Error fetching achievements:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obtener todos los logros disponibles
    const { data: allAchievements, error: allError } = await supabase
      .from("achievements")
      .select("*")
      .order("category", { ascending: true })

    if (allError) {
      console.error("Error fetching all achievements:", allError)
      return NextResponse.json({ error: allError.message }, { status: 500 })
    }

    // Combinar logros obtenidos y no obtenidos
    const earnedIds = new Set(userAchievements?.map((ua) => ua.achievement.id) || [])
    const achievements =
      allAchievements?.map((achievement) => ({
        ...achievement,
        earned: earnedIds.has(achievement.id),
        earned_at: userAchievements?.find((ua) => ua.achievement.id === achievement.id)?.earned_at || null,
      })) || []

    return NextResponse.json({
      achievements,
      total_points: userAchievements?.reduce((sum, ua) => sum + (ua.achievement?.points || 0), 0) || 0,
      total_earned: userAchievements?.length || 0,
      total_available: allAchievements?.length || 0,
    })
  } catch (error) {
    console.error("Error in GET achievements:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/achievements - Otorgar logro a usuario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { achievement_id, user_id } = await request.json()

    if (!achievement_id) {
      return NextResponse.json({ error: "Missing achievement_id" }, { status: 400 })
    }

    const supabase = createClient()

    // Obtener el ID del usuario actual
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const targetUserId = user_id || userData.id

    // Verificar si ya tiene el logro
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", targetUserId)
      .eq("achievement_id", achievement_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Achievement already earned" }, { status: 400 })
    }

    // Otorgar logro
    const { data: userAchievement, error } = await supabase
      .from("user_achievements")
      .insert({
        user_id: targetUserId,
        achievement_id,
      })
      .select(`
        *,
        achievement:achievement_id (
          id,
          name,
          description,
          icon,
          points,
          rarity
        )
      `)
      .single()

    if (error) {
      console.error("Error granting achievement:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(userAchievement)
  } catch (error) {
    console.error("Error in POST achievements:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
