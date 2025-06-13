"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Trophy, Star, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"
import { createClient } from "@/utils/supabase/client"

interface UserStats {
  gamesPlayed: number
  achievements: number
  rating: number
  memberSince: string
}

export function SimpleUserProfile() {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<UserStats>({
    gamesPlayed: 0,
    achievements: 0,
    rating: 0,
    memberSince: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Aquí iría la lógica para obtener las estadísticas del usuario
        // Por ahora, usamos datos de ejemplo
        const supabase = createClient()

        // Intentar obtener datos reales del usuario
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Error al obtener datos del usuario:", error)
        }

        // Datos de ejemplo (o usar datos reales si están disponibles)
        setUserStats({
          gamesPlayed: 42,
          achievements: 15,
          rating: 4.8,
          memberSince: new Date(user.created_at || Date.now()).toLocaleDateString(),
        })
      } catch (error) {
        console.error("Error al obtener estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [user])

  if (!user) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4 text-center">
          <p className="text-slate-400">Inicia sesión para ver tu perfil</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4 text-center">
          <p className="text-slate-400">Cargando perfil...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{user.email?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-white text-lg">
              {user.user_metadata?.name || user.email?.split("@")[0] || "Usuario"}
            </h3>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-600">Nivel 12</Badge>
              <span className="text-slate-400 text-sm">Gamer Entusiasta</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-4 w-4 text-cyan-400" />
            <div>
              <p className="text-sm text-slate-400">Partidas</p>
              <p className="font-semibold text-white">{userStats.gamesPlayed}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-sm text-slate-400">Logros</p>
              <p className="font-semibold text-white">{userStats.achievements}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-orange-400" />
            <div>
              <p className="text-sm text-slate-400">Valoración</p>
              <p className="font-semibold text-white">{userStats.rating}/5</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">Miembro desde</p>
              <p className="font-semibold text-white">{userStats.memberSince}</p>
            </div>
          </div>
        </div>

        <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700">Ver Perfil Completo</Button>
      </CardContent>
    </Card>
  )
}
