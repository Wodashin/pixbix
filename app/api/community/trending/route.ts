import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Obtener tags más usados en los últimos 7 días
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const { data: posts } = await supabase.from("posts").select("tags").gte("created_at", sevenDaysAgo.toISOString())

    // Contar frecuencia de tags
    const tagCounts: { [key: string]: number } = {}

    posts?.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // Convertir a array y ordenar por frecuencia
    const trendingTopics = Object.entries(tagCounts)
      .map(([name, posts]) => ({ name, posts }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5)

    // Si no hay suficientes tags reales, agregar algunos por defecto
    const defaultTopics = [
      { name: "Elden Ring DLC", posts: 1234 },
      { name: "Valorant Champions", posts: 987 },
      { name: "Nintendo Direct", posts: 756 },
      { name: "Gaming Setup", posts: 543 },
      { name: "Indie Games", posts: 432 },
    ]

    const finalTopics = trendingTopics.length > 0 ? trendingTopics : defaultTopics

    return NextResponse.json(finalTopics)
  } catch (error) {
    console.error("Error fetching trending topics:", error)
    return NextResponse.json([])
  }
}
