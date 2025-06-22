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
import { AlertCircle, Gamepad2, Save } from "lucide-react"

interface GamingProfile {
  id: string
  userId: string
  username: string
  bio: string
  favoriteGames: string[]
  lookingForGroup: boolean
  skillLevel: number
  platform: string
}

export default function GamingProfiles() {
  const { user, loading: authLoading } = useAuth()
  const [gamingProfile, setGamingProfile] = useState<GamingProfile | null>(null)
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [favoriteGames, setFavoriteGames] = useState<string[]>([])
  const [lookingForGroup, setLookingForGroup] = useState(false)
  const [skillLevel, setSkillLevel] = useState([50])
  const [platform, setPlatform] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || authLoading) return

    const fetchGamingProfile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Intentar obtener el perfil gaming del usuario
        const response = await fetch(`/api/gaming-profiles?userId=${user.id}`)

        if (response.ok) {
          const profile = await response.json()
          setGamingProfile(profile)
          setUsername(profile.username || "")
          setBio(profile.bio || "")
          setFavoriteGames(profile.favoriteGames || [])
          setLookingForGroup(profile.lookingForGroup || false)
          setSkillLevel([profile.skillLevel || 50])
          setPlatform(profile.platform || "")
        } else {
          // Si no existe perfil, usar datos por defecto
          const defaultUsername = user.user_metadata?.name || user.email?.split("@")[0] || "Gamer"
          setUsername(defaultUsername)
          setBio("¡Listo para jugar!")
          setFavoriteGames([])
          setLookingForGroup(true)
          setSkillLevel([50])
          setPlatform("PC")
        }
      } catch (error) {
        console.error("Error fetching gaming profile:", error)
        setError("Error al cargar el perfil gaming. Usando valores por defecto.")

        // Usar valores por defecto en caso de error
        const defaultUsername = user.user_metadata?.name || user.email?.split("@")[0] || "Gamer"
        setUsername(defaultUsername)
        setBio("¡Listo para jugar!")
        setFavoriteGames([])
        setLookingForGroup(true)
        setSkillLevel([50])
        setPlatform("PC")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGamingProfile()
  }, [user, authLoading])

  const handleSaveProfile = async () => {
    if (!user) {
      setError("Debes iniciar sesión para guardar tu perfil")
      return
    }

    setIsLoading(true)
    setMessage("")
    setError(null)

    try {
      const profileData = {
        userId: user.id,
        username,
        bio,
        favoriteGames,
        lookingForGroup,
        skillLevel: skillLevel[0],
        platform,
      }

      const method = gamingProfile ? "PUT" : "POST"
      const response = await fetch("/api/gaming-profiles", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        const savedProfile = await response.json()
        setGamingProfile(savedProfile)
        setMessage("¡Perfil gaming guardado exitosamente!")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error al guardar el perfil")
      }
    } catch (error) {
      console.error("Error saving gaming profile:", error)
      setError("Error al guardar el perfil gaming")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFavoriteGamesChange = (value: string) => {
    const games = value
      .split(",")
      .map((game) => game.trim())
      .filter((game) => game.length > 0)
    setFavoriteGames(games)
  }

  if (authLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Skeleton className="h-6 w-6 mr-2 bg-slate-600" />
            <Skeleton className="h-6 w-32 bg-slate-600" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64 bg-slate-600" />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid gap-2">
              <Skeleton className="h-4 w-20 bg-slate-600" />
              <Skeleton className="h-10 w-full bg-slate-600" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Gamepad2 className="h-6 w-6 mr-2 text-cyan-400" />
            Perfil Gaming
          </CardTitle>
          <CardDescription className="text-slate-400">Inicia sesión para gestionar tu perfil gaming.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-slate-400">Por favor, inicia sesión para acceder a tu perfil gaming.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Gamepad2 className="h-6 w-6 mr-2 text-cyan-400" />
          Perfil Gaming
        </CardTitle>
        <CardDescription className="text-slate-400">Gestiona tu perfil gaming y preferencias de juego.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Messages */}
        {message && (
          <div className="bg-green-900/50 text-green-300 border border-green-800 p-3 rounded-md text-sm">{message}</div>
        )}

        {error && (
          <div className="bg-red-900/50 text-red-300 border border-red-800 p-3 rounded-md text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {/* Username */}
        <div className="grid gap-2">
          <Label htmlFor="username" className="text-slate-300">
            Nombre de Usuario Gaming
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nombre gamer"
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>

        {/* Bio */}
        <div className="grid gap-2">
          <Label htmlFor="bio" className="text-slate-300">
            Biografía Gaming
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntanos sobre tu estilo de juego..."
            className="bg-slate-700 border-slate-600 text-slate-100"
            rows={3}
          />
        </div>

        {/* Favorite Games */}
        <div className="grid gap-2">
          <Label className="text-slate-300">Juegos Favoritos</Label>
          <Input
            value={favoriteGames.join(", ")}
            onChange={(e) => handleFavoriteGamesChange(e.target.value)}
            placeholder="Ej: Valorant, League of Legends, Apex Legends"
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
          <p className="text-xs text-slate-500">Separa los juegos con comas</p>
        </div>

        {/* Platform */}
        <div className="grid gap-2">
          <Label htmlFor="platform" className="text-slate-300">
            Plataforma Principal
          </Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="Selecciona tu plataforma" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="PC">PC</SelectItem>
              <SelectItem value="PlayStation">PlayStation</SelectItem>
              <SelectItem value="Xbox">Xbox</SelectItem>
              <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skill Level */}
        <div className="grid gap-3">
          <Label htmlFor="skillLevel" className="text-slate-300">
            Nivel de Habilidad
          </Label>
          <Slider value={skillLevel} onValueChange={setSkillLevel} max={100} step={1} className="w-full" />
          <div className="flex justify-between text-sm text-slate-400">
            <span>Principiante</span>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              Nivel: {skillLevel[0]}
            </Badge>
            <span>Experto</span>
          </div>
        </div>

        {/* Looking for Group */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="lookingForGroup" className="text-slate-300">
              ¿Buscas grupo para jugar?
            </Label>
            <p className="text-sm text-slate-500">Otros jugadores podrán encontrarte más fácilmente</p>
          </div>
          <Switch id="lookingForGroup" checked={lookingForGroup} onCheckedChange={setLookingForGroup} />
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Guardando..." : "Guardar Perfil Gaming"}
        </Button>
      </CardFooter>
    </Card>
  )
}
