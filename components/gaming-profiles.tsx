"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch" // <-- Importamos el nuevo componente
import { useAuth } from "@/components/auth-provider-supabase"
import { Gamepad2, Save, Trash2, Plus, Link as LinkIcon, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// --- INTERFAZ Y DATOS ---
interface GameProfile {
  game: string;
  username: string;
  rank?: string;
  tracker_url?: string;
  no_rank?: boolean; // <-- Nuevo campo para manejar el estado del switch
}

const gameRanks: { [key: string]: string[] } = {
  "Valorant": ["Hierro", "Bronce", "Plata", "Oro", "Platino", "Diamante", "Ascendente", "Inmortal", "Radiante"],
  "League of Legends": ["Hierro", "Bronce", "Plata", "Oro", "Platino", "Esmeralda", "Diamante", "Maestro", "Gran Maestro", "Aspirante"],
  "Counter-Strike 2": ["Plata", "Oro Nova", "Maestro Guardián", "Sheriff", "Águila", "Maestro Supremo", "Global Élite"],
  "Fortnite": ["Bronce", "Plata", "Oro", "Platino", "Diamante", "Élite", "As", "Unreal"],
  "Minecraft": [], // Un array vacío indica que por defecto no tiene rangos
};

const predefinedGames = Object.keys(gameRanks);

// --- COMPONENTE PRINCIPAL ---
export function GamingProfiles() {
  const { user, loading: authLoading } = useAuth()
  const [profiles, setProfiles] = useState<GameProfile[]>([])
  const [editingProfiles, setEditingProfiles] = useState<GameProfile[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  // --- LÓGICA DE DATOS ---
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
        const fetchedProfiles = data.profiles || []
        setProfiles(fetchedProfiles)
        setEditingProfiles(fetchedProfiles.length > 0 ? fetchedProfiles : [])
      }
    } catch (error) {
      setError("Error al cargar los perfiles de juego.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!user) return
    setIsLoading(true)
    setMessage("")
    setError(null)
    try {
      // Limpiamos el rango si el switch "sin rango" está activado
      const profilesToSave = editingProfiles.map(p => p.no_rank ? { ...p, rank: '' } : p);

      const response = await fetch('/api/user/gaming-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, profiles: profilesToSave }),
      });
      if (response.ok) {
        setMessage("Perfiles guardados con éxito.")
        setProfiles(profilesToSave)
        setIsEditing(false)
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al guardar los perfiles.")
      }
    } catch (err) {
      setError("Error de conexión al guardar perfiles.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- MANEJO DEL FORMULARIO DE EDICIÓN ---
  const handleAddProfile = () => {
    setEditingProfiles([...editingProfiles, { game: "", username: "", rank: "", tracker_url: "", no_rank: false }])
  }

  const handleProfileChange = (index: number, field: keyof GameProfile, value: string | boolean) => {
    const newProfiles = [...editingProfiles]
    const profileToUpdate = { ...newProfiles[index], [field]: value };

    if (field === 'game') {
        profileToUpdate.rank = '';
        profileToUpdate.no_rank = gameRanks[value as string]?.length === 0;
    }
    
    if (field === 'no_rank' && value === true) {
        profileToUpdate.rank = '';
    }

    newProfiles[index] = profileToUpdate;
    setEditingProfiles(newProfiles)
  }

  const handleRemoveProfile = (index: number) => {
    const newProfiles = editingProfiles.filter((_, i) => i !== index)
    setEditingProfiles(newProfiles)
  }

  // --- RENDERIZADO ---
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
          {!isEditing && (
            <Button onClick={() => { setIsEditing(true); setEditingProfiles(profiles.length > 0 ? [...profiles] : []); }} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              {profiles.length > 0 ? 'Editar Perfiles' : 'Añadir Perfil'}
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-slate-400">Añade los juegos que juegas y tu rango en cada uno.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && <div className="text-green-400 text-sm">{message}</div>}
        {error && <div className="text-red-400 text-sm">{error}</div>}

        {/* --- MODO VISUALIZACIÓN --- */}
        {!isEditing && (
          <div className="space-y-3">
            {profiles.length > 0 ? (
              profiles.map((profile, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                     <div className="flex flex-col">
                        <span className="font-bold text-white">{profile.game}</span>
                        <span className="text-sm text-slate-300">{profile.username}</span>
                     </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {profile.rank ? <Badge variant="secondary">{profile.rank}</Badge> : <Badge variant="outline">Sin Rango</Badge>}
                    {profile.tracker_url && (
                        <Link href={profile.tracker_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400 hover:text-cyan-300">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">Aún no has añadido ningún perfil de juego.</p>
            )}
          </div>
        )}

        {/* --- MODO EDICIÓN --- */}
        {isEditing && (
          <div className="space-y-4">
            {editingProfiles.map((profile, index) => (
              <div key={index} className="space-y-4 p-4 border border-slate-700 rounded-lg relative">
                 <Button variant="ghost" size="icon" onClick={() => handleRemoveProfile(index)} className="absolute top-1 right-1 h-7 w-7 text-slate-400 hover:bg-red-500/20 hover:text-red-400">
                   <Trash2 className="h-4 w-4" />
                 </Button>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Juego</Label>
                       <Select
                          value={predefinedGames.includes(profile.game) ? profile.game : 'Otro'}
                          onValueChange={(value) => handleProfileChange(index, 'game', value === 'Otro' ? '' : value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Selecciona un juego" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {predefinedGames.map(game => (
                              <SelectItem key={game} value={game}>{game}</SelectItem>
                            ))}
                            <SelectItem value="Otro">Otro...</SelectItem>
                          </SelectContent>
                        </Select>
                        {!predefinedGames.includes(profile.game) && (
                            <Input
                                value={profile.game}
                                onChange={(e) => handleProfileChange(index, 'game', e.target.value)}
                                placeholder="Nombre del juego"
                                className="bg-slate-700 border-slate-600 mt-2"
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Username</Label>
                      <Input
                        value={profile.username}
                        onChange={(e) => handleProfileChange(index, 'username', e.target.value)}
                        placeholder="Tu nombre en el juego"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Rango</Label>
                      <div className="flex items-center space-x-2">
                           <Switch 
                                id={`no-rank-${index}`} 
                                checked={profile.no_rank}
                                onCheckedChange={(checked) => handleProfileChange(index, 'no_rank', checked)}
                           />
                           <Label htmlFor={`no-rank-${index}`} className="text-sm text-slate-400">Este juego no tiene rango</Label>
                      </div>
                      {!profile.no_rank && (
                          gameRanks[profile.game] ? (
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
                              placeholder="Tu rango (si aplica)"
                              className="bg-slate-700 border-slate-600"
                            />
                          )
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white flex items-center"><LinkIcon className="h-3 w-3 mr-1"/> Enlace de Tracker</Label>
                       <Input
                          value={profile.tracker_url || ''}
                          onChange={(e) => handleProfileChange(index, 'tracker_url', e.target.value)}
                          placeholder="https://tracker.gg/..."
                          className="bg-slate-700 border-slate-600"
                        />
                    </div>
                 </div>
              </div>
            ))}
            <Button onClick={handleAddProfile} size="sm" variant="outline" className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" />
                Añadir otro juego
            </Button>
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button onClick={handleSaveChanges} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
        </CardFooter>
      )}
    </Card>
  )
}
