"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail, Edit2, Check, X, Loader2, Gamepad2, Trophy, Star, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"
import { createClient } from "@/utils/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface UserStats {
  gamesPlayed: number
  achievements: number
  rating: number
  memberSince: string
}

interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  avatar_url: string
  created_at: string
  provider: string
}

export function SimpleUserProfile() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    gamesPlayed: 0,
    achievements: 0,
    rating: 0,
    memberSince: "",
  })
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Error al obtener datos del usuario:", error)
        }

        // Determinar el proveedor de autenticación
        let provider = "email"
        if (user.app_metadata?.provider) {
          provider = user.app_metadata.provider
        } else if (user.user_metadata?.provider) {
          provider = user.user_metadata.provider
        }

        const profile = {
          id: user.id,
          name: userData?.name || user.user_metadata?.name || user.user_metadata?.full_name || "Usuario",
          username: userData?.username || user.email?.split("@")[0] || "usuario",
          email: user.email || "",
          avatar_url: userData?.avatar_url || user.user_metadata?.avatar_url || "",
          created_at: userData?.created_at || user.created_at || new Date().toISOString(),
          provider: provider,
        }

        setUserProfile(profile)
        setNewUsername(profile.username)

        const memberSince = formatDistanceToNow(new Date(profile.created_at), {
          addSuffix: true,
          locale: es,
        })

        setUserStats({
          gamesPlayed: 42,
          achievements: 15,
          rating: 4.8,
          memberSince: memberSince,
        })
      } catch (error) {
        console.error("Error al obtener estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === userProfile?.username) {
      setEditingUsername(false)
      setNewUsername(userProfile?.username || "")
      return
    }

    setUpdating(true)
    setError("")

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userProfile?.name,
          username: newUsername.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el perfil")
      }

      setUserProfile({ ...userProfile, username: newUsername.trim() })
      setEditingUsername(false)
    } catch (error) {
      console.error("Error al actualizar username:", error)
      setError(error instanceof Error ? error.message : "Error al actualizar")
      setNewUsername(userProfile?.username || "")
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingUsername(false)
    setNewUsername(userProfile?.username || "")
    setError("")
  }

  const getProviderBadge = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return <Badge className="bg-red-600 text-white">Google</Badge>
      case "discord":
        return <Badge className="bg-indigo-600 text-white">Discord</Badge>
      default:
        return <Badge className="bg-gray-600 text-white">Email</Badge>
    }
  }

  const getDaysActive = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

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
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-slate-400">Cargando perfil...</p>
        </CardContent>
      </Card>
    )
  }

  if (!userProfile) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4 text-center">
          <p className="text-slate-400">Error al cargar el perfil</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Información Personal */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{userProfile.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-white text-lg">{userProfile.name}</h3>
                {getProviderBadge(userProfile.provider)}
              </div>

              {/* Username editable */}
              {editingUsername ? (
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white w-40 h-8 text-sm"
                    placeholder="Username"
                    disabled={updating}
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateUsername}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                  >
                    {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={updating}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 h-8 w-8 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-purple-400">@{userProfile.username}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingUsername(true)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700 h-6 w-6 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3 text-slate-400" />
                <span className="text-slate-400 text-sm">{userProfile.email}</span>
              </div>

              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
    </div>
  )
}
