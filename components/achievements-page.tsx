"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Zap, Target, Users, Calendar, Award, Lock } from "lucide-react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: "social" | "gaming" | "community" | "special"
  points: number
  rarity: "common" | "rare" | "epic" | "legendary"
  earned: boolean
  earned_at: string | null
}

interface AchievementStats {
  achievements: Achievement[]
  total_points: number
  total_earned: number
  total_available: number
}

export function AchievementsPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AchievementStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    if (session) {
      fetchAchievements()
    }
  }, [session])

  const fetchAchievements = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/achievements")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "trophy":
        return <Trophy className="h-6 w-6" />
      case "star":
        return <Star className="h-6 w-6" />
      case "zap":
        return <Zap className="h-6 w-6" />
      case "target":
        return <Target className="h-6 w-6" />
      case "users":
        return <Users className="h-6 w-6" />
      case "calendar":
        return <Calendar className="h-6 w-6" />
      case "award":
        return <Award className="h-6 w-6" />
      default:
        return <Trophy className="h-6 w-6" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "social":
        return <Users className="h-4 w-4" />
      case "gaming":
        return <Trophy className="h-4 w-4" />
      case "community":
        return <Star className="h-4 w-4" />
      case "special":
        return <Award className="h-4 w-4" />
      default:
        return <Trophy className="h-4 w-4" />
    }
  }

  const filteredAchievements =
    stats?.achievements.filter(
      (achievement) => selectedCategory === "all" || achievement.category === selectedCategory,
    ) || []

  const earnedAchievements = filteredAchievements.filter((a) => a.earned)
  const progressPercentage = stats ? (stats.total_earned / stats.total_available) * 100 : 0

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-400 mb-2">Inicia sesión para ver tus logros</h2>
          <p className="text-slate-500">Conecta tu cuenta para desbloquear el sistema de logros</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Logros y Progreso</h1>
          <p className="text-slate-400">Desbloquea logros y gana puntos por tu actividad</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-slate-400">Cargando logros...</div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Logros Obtenidos</p>
                      <p className="text-2xl font-bold text-white">{stats.total_earned}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-500 rounded-lg">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Puntos Totales</p>
                      <p className="text-2xl font-bold text-white">{stats.total_points}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Progreso</p>
                      <p className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Disponibles</p>
                      <p className="text-2xl font-bold text-white">{stats.total_available}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <Card className="bg-slate-800 border-slate-700 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Progreso General</h3>
                  <span className="text-sm text-slate-400">
                    {stats.total_earned} / {stats.total_available}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </CardContent>
            </Card>

            {/* Achievements Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-5 bg-slate-800">
                <TabsTrigger value="all" className="data-[state=active]:bg-cyan-600">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-cyan-600">
                  <Users className="h-4 w-4 mr-1" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="gaming" className="data-[state=active]:bg-cyan-600">
                  <Trophy className="h-4 w-4 mr-1" />
                  Gaming
                </TabsTrigger>
                <TabsTrigger value="community" className="data-[state=active]:bg-cyan-600">
                  <Star className="h-4 w-4 mr-1" />
                  Comunidad
                </TabsTrigger>
                <TabsTrigger value="special" className="data-[state=active]:bg-cyan-600">
                  <Award className="h-4 w-4 mr-1" />
                  Especiales
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAchievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`bg-slate-800 border-slate-700 ${
                        achievement.earned ? "ring-2 ring-cyan-500" : "opacity-75"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${achievement.earned ? "bg-cyan-500" : "bg-slate-600"}`}>
                              {achievement.earned ? getAchievementIcon(achievement.icon) : <Lock className="h-6 w-6" />}
                            </div>
                            <div>
                              <CardTitle className={`text-lg ${achievement.earned ? "text-white" : "text-slate-400"}`}>
                                {achievement.name}
                              </CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs`}>
                                  {achievement.rarity}
                                </Badge>
                                <Badge variant="outline" className="text-cyan-400 border-cyan-400 text-xs">
                                  {achievement.points} pts
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-sm mb-3 ${achievement.earned ? "text-slate-300" : "text-slate-500"}`}>
                          {achievement.description}
                        </p>

                        {achievement.earned && achievement.earned_at && (
                          <div className="flex items-center text-xs text-slate-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            Obtenido el {format(new Date(achievement.earned_at), "PPP", { locale: es })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredAchievements.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">No hay logros en esta categoría</h3>
                    <p className="text-slate-500">Explora otras categorías para encontrar más logros</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Error al cargar logros</h3>
            <p className="text-slate-500">Intenta recargar la página</p>
          </div>
        )}
      </div>
    </div>
  )
}
