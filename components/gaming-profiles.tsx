"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ExternalLink, Edit2, Trash2, Trophy, Target } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

interface GamingProfile {
  game: string
  username: string
  rank: string
  tracker_url: string
}

interface GamingProfilesProps {
  userId?: string
  isOwnProfile?: boolean
}

const SUPPORTED_GAMES = [
  { id: "valorant", name: "Valorant", icon: "🎯" },
  { id: "league", name: "League of Legends", icon: "⚔️" },
  { id: "csgo", name: "CS:GO", icon: "🔫" },
  { id: "apex", name: "Apex Legends", icon: "🏆" },
  { id: "overwatch", name: "Overwatch 2", icon: "🎮" },
  { id: "rocket", name: "Rocket League", icon: "🚗" },
]

export function GamingProfiles({ userId, isOwnProfile = false }: GamingProfilesProps) {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Record<string, GamingProfile>>({})
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    game: "",
    username: "",
    rank: "",
    tracker_url: "",
  })

  useEffect(() => {
    fetchGamingProfiles()
  }, [userId, user])

  const fetchGamingProfiles = async () => {
    try {
      const targetUserId = userId || user?.id
      if (!targetUserId) return

      const response = await fetch(`/api/user/gaming-profiles?userId=${targetUserId}`)
      if (response.ok) {
        const data = await response.json()
        setProfiles(data.gaming_profiles || {})
      }
    } catch (error) {
      console.error("Error al cargar perfiles de gaming:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch("/api/user/gaming-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ game: "", username: "", rank: "", tracker_url: "" })
        setDialogOpen(false)
        setEditingProfile(null)
        fetchGamingProfiles()
      }
    } catch (error) {
      console.error("Error al guardar perfil:", error)
    }
  }

  const handleDeleteProfile = async (game: string) => {
    try {
      const response = await fetch(`/api/user/gaming-profiles/${game}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const newProfiles = { ...profiles }
        delete newProfiles[game]
        setProfiles(newProfiles)
      }
    } catch (error) {
      console.error("Error al eliminar perfil:", error)
    }
  }

  const handleEditProfile = (game: string, profile: GamingProfile) => {
    setFormData(profile)
    setEditingProfile(game)
    setDialogOpen(true)
  }

  const getRankColor = (rank: string) => {
    const lowerRank = rank.toLowerCase()
    if (lowerRank.includes("radiant") || lowerRank.includes("challenger")) return "bg-red-600"
    if (lowerRank.includes("immortal") || lowerRank.includes("grandmaster")) return "bg-purple-600"
    if (lowerRank.includes("diamond") || lowerRank.includes("master")) return "bg-blue-600"
    if (lowerRank.includes("platinum") || lowerRank.includes("emerald")) return "bg-green-600"
    if (lowerRank.includes("gold")) return "bg-yellow-600"
    if (lowerRank.includes("silver")) return "bg-gray-500"
    return "bg-orange-600"
  }

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400">Cargando perfiles...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
          Perfiles de Gaming
        </CardTitle>
        {isOwnProfile && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Perfil
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingProfile ? "Editar Perfil" : "Agregar Perfil de Gaming"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={formData.game} onValueChange={(value) => setFormData({ ...formData, game: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecciona un juego" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {SUPPORTED_GAMES.map((game) => (
                      <SelectItem key={game.id} value={game.id} className="text-white">
                        {game.icon} {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Nombre de usuario en el juego"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />

                <Input
                  placeholder="Rango actual (ej: Diamond III)"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />

                <Input
                  placeholder="URL de Tracker.gg (opcional)"
                  value={formData.tracker_url}
                  onChange={(e) => setFormData({ ...formData, tracker_url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />

                <Button onClick={handleSaveProfile} className="w-full bg-purple-600 hover:bg-purple-700">
                  {editingProfile ? "Actualizar Perfil" : "Guardar Perfil"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {Object.keys(profiles).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(profiles).map(([gameId, profile]) => {
              const gameInfo = SUPPORTED_GAMES.find((g) => g.id === gameId)
              return (
                <Card key={gameId} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{gameInfo?.icon}</span>
                        <h3 className="font-semibold text-white">{gameInfo?.name}</h3>
                      </div>
                      {isOwnProfile && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditProfile(gameId, profile)}
                            className="text-slate-400 hover:text-white h-8 w-8 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProfile(gameId)}
                            className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-slate-400">Usuario</p>
                        <p className="text-white font-medium">{profile.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Rango</p>
                        <Badge className={`${getRankColor(profile.rank)} text-white`}>{profile.rank}</Badge>
                      </div>
                      {profile.tracker_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(profile.tracker_url, "_blank")}
                          className="w-full border-slate-600 text-slate-300 hover:bg-slate-600"
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Ver en Tracker.gg
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No hay perfiles de gaming</h3>
            <p className="text-slate-400">
              {isOwnProfile ? "¡Agrega tus perfiles de gaming!" : "Este usuario no ha agregado perfiles aún"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
