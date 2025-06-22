"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider-supabase"
import { AlertCircle, Gamepad2, Save, Trash2, Plus } from "lucide-react"

interface GameProfile {
  game: string;
  username: string;
  rank?: string;
}

const gameRanks: { [key: string]: string[] } = {
  "Valorant": ["Hierro", "Bronce", "Plata", "Oro", "Platino", "Diamante", "Ascendente", "Inmortal", "Radiante"],
  "League of Legends": ["Hierro", "Bronce", "Plata", "Oro", "Platino", "Esmeralda", "Diamante", "Maestro", "Gran Maestro", "Aspirante"],
};

export function GamingProfiles() {
  const { user, loading: authLoading } = useAuth()
  const [profiles, setProfiles] = useState<GameProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchGamingProfiles()
    }
  }, [user])

  const fetchGamingProfiles = async () => {
    if (!user) return;
    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/gaming-profiles?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setProfiles(data.profiles || [])
      }
    } catch (error) {
      setError("Error al cargar los perfiles de juego.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfiles = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/gaming-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, profiles }),
      });
      if (response.ok) {
        setMessage("Perfiles de juego guardados.")
      } else {
        setError("Error al guardar los perfiles.")
      }
    } catch (err) {
      setError("Error de conexión al guardar perfiles.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProfile = () => {
    setProfiles([...profiles, { game: "", username: "", rank: "" }])
  }

  const handleProfileChange = (index: number, field: keyof GameProfile, value: string) => {
    const newProfiles = [...profiles]
    const profileToUpdate = { ...newProfiles[index], [field]: value };

    if (field === 'game') {
        profileToUpdate.rank = '';
    }
    
    newProfiles[index] = profileToUpdate;
    setProfiles(newProfiles)
  }

  const handleRemoveProfile = (index: number) => {
    const newProfiles = profiles.filter((_, i) => i !== index)
    setProfiles(newProfiles)
  }

  if (authLoading) {
    return <Skeleton className="h-48 w-full bg-slate-700" />
  }

  if (!user) {
    return <p className="text-slate-400">Inicia sesión para ver tu perfil de juego.</p>
  }
  
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Gamepad2 className="h-6 w-6 mr-2 text-cyan-400" />
            Perfiles de Juego
          </div>
          <Button onClick={handleAddProfile} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Juego
          </Button>
        </CardTitle>
        <CardDescription className="text-slate-400">Añade los juegos que juegas y tu rango en cada uno.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && <div className="text-green-400">{message}</div>}
        {error && <div className="text-red-400">{error}</div>}

        <div className="space-y-4">
          {profiles.map((profile, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-700 rounded-lg">
              <div className="space-y-2">
                <Label className="text-slate-300">Juego</Label>
                <Input
                  value={profile.game}
                  onChange={(e) => handleProfileChange(index, 'game', e.target.value)}
                  placeholder="Ej: Valorant"
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Username</Label>
                <Input
                  value={profile.username}
                  onChange={(e) => handleProfileChange(index, 'username', e.target.value)}
                  placeholder="Tu nombre en el juego"
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Rango</Label>
                {gameRanks[profile.game] ? (
                  <Select
                    value={profile.rank}
                    onValueChange={(value) => handleProfileChange(index, 'rank', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Selecciona tu rango" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {gameRanks[profile.game].map(rank => (
                        <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={profile.rank || ''}
                    onChange={(e) => handleProfileChange(index, 'rank', e.target.value)}
                    placeholder="Tu rango"
                    className="bg-slate-700 border-slate-600"
                  />
                )}
              </div>
               <div className="col-span-3 flex justify-end">
                 <Button variant="destructive" size="sm" onClick={() => handleRemoveProfile(index)}>
                   <Trash2 className="h-4 w-4 mr-2" />
                   Eliminar
                 </Button>
               </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveProfiles} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Guardando..." : "Guardar Perfiles"}
        </Button>
      </CardFooter>
    </Card>
  )
}
