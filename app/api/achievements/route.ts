import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Ejemplo de logros
const achievements = [
  {
    id: 1,
    title: "Primer Paso",
    description: "Completar el registro en la plataforma",
    icon: "🏆",
    points: 10,
  },
  {
    id: 2,
    title: "Explorador",
    description: "Visitar todas las secciones de la plataforma",
    icon: "🧭",
    points: 20,
  },
  {
    id: 3,
    title: "Social",
    description: "Conectar con 5 compañeros gaming",
    icon: "👥",
    points: 30,
  },
  {
    id: 4,
    title: "Veterano",
    description: "Estar activo por más de 30 días",
    icon: "⏱️",
    points: 50,
  },
]

export async function GET() {
  try {
    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Aquí iría la lógica para obtener los logros del usuario desde la base de datos
    // Por ahora, devolvemos datos de ejemplo

    // Simular logros desbloqueados por el usuario
    const userAchievements = achievements.slice(0, 2).map((achievement) => ({
      ...achievement,
      unlocked: true,
      unlockedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    }))

    // Simular logros bloqueados
    const lockedAchievements = achievements.slice(2).map((achievement) => ({
      ...achievement,
      unlocked: false,
    }))

    return NextResponse.json({
      achievements: [...userAchievements, ...lockedAchievements],
      totalPoints: userAchievements.reduce((sum, a) => sum + a.points, 0),
    })
  } catch (error) {
    console.error("Error al obtener logros:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { achievementId } = await request.json()

    if (!achievementId) {
      return NextResponse.json({ error: "ID de logro requerido" }, { status: 400 })
    }

    // Aquí iría la lógica para desbloquear un logro
    // Por ejemplo, verificar si el usuario cumple los requisitos y luego guardar en la base de datos

    // Simulamos una respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Logro desbloqueado correctamente",
      achievement: achievements.find((a) => a.id === achievementId),
    })
  } catch (error) {
    console.error("Error al desbloquear logro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
