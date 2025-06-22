"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider-supabase"
import { UserGallery } from "@/components/user-gallery"
import { GamingProfiles } from "@/components/gaming-profiles"
import { toast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Loader2, Edit3, Check, X, Mail, Calendar, Crown, Settings, MessageSquare, User, Activity } from "lucide-react"

// ... (Las interfaces UserProfile y UserStats se mantienen igual)
interface UserProfile {
  id: string
  email: string
  name: string | null
  username: string | null
  image: string | null
  role: string
  level: number
  bio: string | null
  location: string | null
  website: string | null
  created_at: string
  updated_at: string
  username_change_count: number
  is_companion: boolean
}

interface UserStats {
  posts: number
  likes: number
  matches: number
  achievements: number
  rating: number
  level: number
}


export function UserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    posts: 2,
    likes: 20,
    matches: 42,
    achievements: 15,
    rating: 4.8,
    level: 12,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("information")

  const [editingName, setEditingName] = useState(false)
  const [editingUsername, setEditingUsername] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [newName, setNewName] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newBio, setNewBio] = useState("")
  const [updating, setUpdating] = useState(false)

  const USERNAME_CHANGE_LIMIT = 2

  useEffect(() => {
    if (user) {
      loadProfileData()
    } else {
        setLoading(false)
    }
  }, [user])

  const loadProfileData = async () => {
    // ... (La función loadProfileData se mantiene igual)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // ... (La función updateProfile se mantiene igual)
  }

  const handleNameUpdate = async () => {
    // ... (La función handleNameUpdate se mantiene igual)
  }

  const handleUsernameUpdate = async () => {
    // ... (La función handleUsernameUpdate se mantiene igual)
  }

  const handleBioUpdate = async () => {
    // ... (La función handleBioUpdate se mantiene igual)
  }

  const handleCompanionToggle = async (isCompanion: boolean) => {
    await updateProfile({ is_companion: isCompanion });
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    // ... (El return de loading se mantiene igual)
  }

  if (!user) {
    // ... (El return de !user se mantiene igual)
  }

  if (!profile) {
    // ... (El return de !profile se mantiene igual)
  }

  return (
    // Reemplaza todo el return de tu componente con este bloque
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="relative mb-8">
        <div className="h-48 bg-slate-800 rounded-t-lg border-x border-t border-slate-700"></div>
        <div className="bg-slate-800 border-x border-b border-slate-700 rounded-b-lg p-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-32 w-32 border-4 border-cyan-400 bg-slate-700">
              <AvatarImage src={profile.image || ""} alt={profile.name || "User"} />
              <AvatarFallback className="bg-slate-700 text-cyan-400 text-4xl">
                {(profile.name || profile.email)?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-white">{profile.name || "Usuario Sin Nombre"}</h1>
                <Badge className="bg-purple-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Gamer
                </Badge>
              </div>
              <p className="text-slate-400">@{profile.username || "sin-usuario"}</p>
              <div className="flex items-center space-x-1 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Miembro desde {formatDate(profile.created_at)}</span>
              </div>
            </div>

            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {/* ... (Las tarjetas de estadísticas se mantienen igual) ... */}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
            {/* ... (Los triggers de las pestañas se mantienen igual) ... */}
        </TabsList>

        {/* Information Tab */}
        <TabsContent value="information">
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center">
                        <User className="mr-2 h-5 w-5 text-cyan-400" />
                        Información del Perfil
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Nombre */}
                    <div>
                        <label className="text-sm font-medium text-white">Nombre Completo</label>
                        <p className="text-slate-300">{profile.name || "No especificado"}</p>
                    </div>

                    {/* Username Editable */}
                    <div>
                        <label className="text-sm font-medium text-white">Nombre de Usuario</label>
                        {editingUsername ? (
                            <div className="flex items-center gap-2 mt-1">
                                <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="bg-slate-700 border-slate-600"/>
                                <Button size="sm" onClick={handleUsernameUpdate} disabled={updating || profile.username_change_count >= 2} className="bg-green-600 hover:bg-green-700">
                                    {updating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)}><X className="h-4 w-4"/></Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p className="text-slate-300">@{profile.username || "sin-usuario"}</p>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingUsername(true)} disabled={profile.username_change_count >= 2}>
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-1">Puedes cambiar tu nombre de usuario {Math.max(0, 2 - (profile.username_change_count || 0))} veces más.</p>
                    </div>

                    {/* Biografía Editable */}
                    <div>
                        <label className="text-sm font-medium text-white">Biografía</label>
                        {editingBio ? (
                             <div className="space-y-2 mt-1">
                                <Textarea value={newBio} onChange={(e) => setNewBio(e.target.value)} className="bg-slate-700 border-slate-600" rows={4}/>
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setEditingBio(false)}>Cancelar</Button>
                                    <Button size="sm" onClick={handleBioUpdate} disabled={updating} className="bg-green-600 hover:bg-green-700">
                                        {updating ? "Guardando..." : "Guardar Bio"}
                                    </Button>
                                </div>
                             </div>
                        ) : (
                            <div className="flex items-start gap-2">
                                <p className="text-slate-300 flex-1 whitespace-pre-wrap">{profile.bio || "Aún no has añadido una biografía."}</p>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingBio(true)}>
                                   <Edit3 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    {/* Convertirse en Compañero */}
                    <div className="border-t border-slate-700 pt-6">
                         <label className="text-sm font-medium text-white">Modo Compañero</label>
                         <div className="flex items-center justify-between mt-2">
                            <p className="text-slate-400 text-sm">Activa esta opción para que otros puedan contratarte para jugar.</p>
                            <Switch
                                checked={profile.is_companion || false}
                                onCheckedChange={handleCompanionToggle}
                            />
                         </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        {/* ... (El resto de las pestañas se mantienen igual) ... */}
      </Tabs>
    </div>
  )
}
