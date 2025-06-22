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
import { Loader2, Edit3, Check, X, Mail, Calendar, Crown, Settings, MessageSquare, User, Activity } from "lucide-react"

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
    try {
      setLoading(true)
      setError(null)

      const profileResponse = await fetch("/api/user/profile")

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.user)
        setNewName(profileData.user.name || "")
        setNewUsername(profileData.user.username || "")
        setNewBio(profileData.user.bio || "")
        setStats((prev) => ({
          ...prev,
          level: profileData.user.level || 1,
        }))
      } else {
        if (user) {
          const fallbackProfile: UserProfile = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            username: user.user_metadata?.preferred_username || null,
            image: user.user_metadata?.avatar_url || null,
            role: "user",
            level: 1,
            bio: null,
            location: null,
            website: null,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            username_change_count: 0,
          }
          setProfile(fallbackProfile)
          setNewName(fallbackProfile.name || "")
          setNewUsername(fallbackProfile.username || "")
          setNewBio("")
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setUpdating(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        toast({
          title: "¡Éxito!",
          description: "Perfil actualizado correctamente",
        })
        return true
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Error al actualizar perfil",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Error al actualizar perfil",
        variant: "destructive",
      })
      return false
    } finally {
      setUpdating(false)
    }
  }

    const handleUsernameUpdate = async () => {
        if (!newUsername.trim() || newUsername === profile?.username) {
            setEditingUsername(false)
            return
        }

        if (profile && profile.username_change_count >= USERNAME_CHANGE_LIMIT) {
            toast({
                title: "Límite alcanzado",
                description: "Ya has cambiado tu nombre de usuario el máximo de veces permitido.",
                variant: "destructive",
            })
            setEditingUsername(false)
            return
        }

        const success = await updateProfile({
            username: newUsername.trim(),
            username_change_count: (profile?.username_change_count || 0) + 1,
        })
        if (success) {
            setEditingUsername(false)
        }
    }


  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "El nombre no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    const success = await updateProfile({ name: newName.trim() })
    if (success) {
      setEditingName(false)
    }
  }

  const handleBioUpdate = async () => {
    const success = await updateProfile({ bio: newBio.trim() || null })
    if (success) {
      setEditingBio(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <span className="ml-2 text-white">Cargando perfil...</span>
      </div>
    )
  }

    if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8">
          <CardContent>
            <h1 className="text-2xl font-bold text-white mb-4">Inicia sesión para ver tu perfil</h1>
            <Button onClick={() => window.location.href = '/login'} className="bg-cyan-600 hover:bg-cyan-700">
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8">
          <CardContent>
            <h1 className="text-2xl font-bold text-white mb-4">Error al cargar el perfil</h1>
            {error && <p className="text-red-400 mb-4">Error: {error}</p>}
            <Button onClick={loadProfileData} className="bg-cyan-600 hover:bg-cyan-700">
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
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
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-2xl font-bold"
                      placeholder="Nombre completo"
                    />
                    <Button
                      size="sm"
                      onClick={handleNameUpdate}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewName(profile.name || "")
                        setEditingName(false)
                      }}
                      className="border-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-white">{profile.name || "Usuario Sin Nombre"}</h1>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingName(true)}
                      className="text-slate-400 hover:text-white p-1 h-auto"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <Badge className="bg-purple-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Gamer
                </Badge>
              </div>

              <p className="text-slate-400">@{profile.username || "kevinaguilera97"}</p>

              <div className="flex items-center space-x-1 text-slate-400">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>

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
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.posts}</div>
            <div className="text-slate-400 text-sm">Posts</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.likes}</div>
            <div className="text-slate-400 text-sm">Likes</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.matches}</div>
            <div className="text-slate-400 text-sm">Partidas</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.achievements}</div>
            <div className="text-slate-400 text-sm">Logros</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.rating}</div>
            <div className="text-slate-400 text-sm">Valoración</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.level}</div>
            <div className="text-slate-400 text-sm">Nivel</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
          <TabsTrigger value="information" className="data-[state=active]:bg-purple-600">
            Información
          </TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-purple-600">
            Mis Posts
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">
            Actividad
          </TabsTrigger>
          <TabsTrigger value="gallery" className="data-[state=active]:bg-purple-600">
            Galería
          </TabsTrigger>
          <TabsTrigger value="gaming" className="data-[state=active]:bg-purple-600">
            Gaming
          </TabsTrigger>
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
              <div>
                <label className="text-slate-400 text-sm">Nombre Completo</label>
                <p className="text-white font-medium">{profile.name || "No especificado"}</p>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Nombre de Usuario</label>
                <p className="text-white font-medium">@{profile.username || "sin-usuario"}</p>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Biografía</label>
                {editingBio ? (
                  <div className="space-y-2">
                    <Textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Cuéntanos sobre ti..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleBioUpdate}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewBio(profile.bio || "")
                          setEditingBio(false)
                        }}
                        className="border-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-white font-medium flex-1">{profile.bio || "Sin biografía disponible"}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingBio(true)}
                      className="text-slate-400 hover:text-white p-1 h-auto"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-400 text-sm">Email</label>
                <p className="text-white font-medium">{profile.email}</p>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Nivel</label>
                <p className="text-white font-medium">Nivel {profile.level}</p>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Rol</label>
                <p className="text-white font-medium">{profile.role === "admin" ? "Administrador" : "Usuario"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-cyan-400" />
                Mis Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-600 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">No hay posts aún</h3>
                <p className="text-slate-400">¡Comparte tus experiencias gaming!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="mr-2 h-5 w-5 text-cyan-400" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-slate-600 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">Sin actividad reciente</h3>
                <p className="text-slate-400">¡Empieza a jugar para ver tu actividad!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <UserGallery userId={profile.id} isOwnProfile={true} />
        </TabsContent>

        {/* Gaming Tab */}
        <TabsContent value="gaming">
          <GamingProfiles />
        </TabsContent>
      </Tabs>
    </div>
  )
}
