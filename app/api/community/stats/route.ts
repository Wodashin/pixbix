import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Usuarios activos (usuarios que han hecho login en los últimos 7 días)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", sevenDaysAgo.toISOString())

    // Posts de hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: postsToday } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString())

    // Total de posts
    const { count: totalPosts } = await supabase.from("posts").select("*", { count: "exact", head: true })

    // Próximos eventos (simulado por ahora)
    const upcomingEvents = 8

    return NextResponse.json({
      activeUsers: activeUsers || 0,
      postsToday: postsToday || 0,
      totalPosts: totalPosts || 0,
      upcomingEvents,
    })
  } catch (error) {
    console.error("Error fetching community stats:", error)
    return NextResponse.json({
      activeUsers: 0,
      postsToday: 0,
      totalPosts: 0,
      upcomingEvents: 8,
    })
  }
}
