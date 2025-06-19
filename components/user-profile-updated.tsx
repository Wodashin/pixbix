"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider-supabase"
import { toast } from "@/hooks/use-toast"
import {
  Calendar,
  Edit,
  Settings,
  Heart,
  MessageCircle,
  Star,
  Crown,
  Loader2,
  Mail,
  User,
  Edit3,
  Check,
  X,
} from "lucide-react"

interface UserProfile {
  id: string
  email: string
  name: string | null
  username: string | null
  image: string | null
  role: string
  created_at: string
  updated_at: string
  bio?: string
  location?: string
  website?: string
  favorite_games?: string[]
  gaming_platforms?: string[]
  stats?: {
    posts_count: number
    likes_received: number
    comments_count: number
    followers_count: number
    following_count: number
  }
}

export function UserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setNewUsername(data.user.username || "")
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "El nombre de usuario no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setEditingUsername(false)
        toast({
          title: "¡Éxito!",
          description: "Nombre de usuario actualizado correctamente",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al actualizar nombre de usuario",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al actualizar username:", error)
      toast({
        title: "Error",
        description: "Error al actualizar nombre de usuario",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const cancelEdit = () => {
    setNewUsername(profile?.username || "")
    setEditingUsername(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getProviderBadge = () => {
    if (user?.app_metadata?.provider === "google") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Google
        </Badge>
      )
    }
    if (user?.app_metadata?.provider === "discord") {
      return (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          Discord
        </Badge>
      )
    }
    return <Badge variant="outline">Email</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Cargando perfil...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Error al cargar el perfil</h1>
        <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  const safeProfile = {
    ...profile,
    name: profile.name || "Usuario",
    username: profile.username || "usuario",
    stats: profile.stats || {
      posts_count: 0,
      likes_received: 0,
      comments_count: 0,
      followers_count: 0,
      following_count: 0,
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header del perfil */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar y info básica */}
            <div className="flex items-center space-x-6">
              <Avatar className="h-32 w-32 border-4 border-cyan-400">
                <AvatarImage src={profile.image || user?.user_metadata?.avatar_url} alt={safeProfile.name} />
                <AvatarFallback className="bg-slate-700 text-cyan-400 text-4xl">
                  {safeProfile.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-white">{safeProfile.name}</h1>
                  <Badge className="bg-purple-600 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    {profile.role === "admin" ? "Admin" : "Gamer"}
                  </Badge>
                  {getProviderBadge()}
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <User className="h-4 w-4" />
                  {editingUsername ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white w-48"
                        placeholder="Nombre de usuario"
                      />
                      <Button
                        size="sm"
                        onClick={updateUsername}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="border-slate-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-purple-400">@{safeProfile.username}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingUsername(true)}
                        className="text-slate-400 hover:text-white p-1 h-auto"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>

                <div className="flex items-center space-x-1 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Miembro desde {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex-1 flex justify-end">
              <div className="flex space-x-3">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{safeProfile.stats.posts_count}</div>
            <div className="text-sm text-slate-400">Posts</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{safeProfile.stats.likes_received}</div>
            <div className="text-sm text-slate-400">Likes</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{safeProfile.stats.comments_count}</div>
            <div className="text-sm text-slate-400">Comentarios</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{safeProfile.stats.followers_count}</div>
            <div className="text-sm text-slate-400">Seguidores</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-slate-400">Días activo</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
          <TabsTrigger value="info" className="data-[state=active]:bg-purple-600">
            Información
          </TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-purple-600">
            Posts
          </TabsTrigger>
          <TabsTrigger value="likes" className="data-[state=active]:bg-purple-600">
            Likes
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">
            Actividad
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">
            Logros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información personal */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-400">Nombre completo</Label>
                  <p className="text-white font-medium">{profile.name || "No especificado"}</p>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <Label className="text-slate-400 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo electrónico
                  </Label>
                  <p className="text-white font-medium">{profile.email}</p>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <Label className="text-slate-400">Nombre de usuario</Label>
                  <p className="text-white font-medium">@{profile.username || "sin-usuario"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Información de la cuenta */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Información de la Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-400">Fecha de registro</Label>
                  <p className="text-white font-medium">{formatDate(profile.created_at)}</p>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <Label className="text-slate-400">Última actualización</Label>
                  <p className="text-white font-medium">{formatDate(profile.updated_at)}</p>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <Label className="text-slate-400">Método de autenticación</Label>
                  <div className="mt-1">{getProviderBadge()}</div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <Label className="text-slate-400">Rol de usuario</Label>
                  <p className="text-white font-medium">{profile.role === "admin" ? "Administrador" : "Usuario"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Tus Posts</h3>
            <p className="text-slate-400">Próximamente...</p>
          </div>
        </TabsContent>

        <TabsContent value="likes" className="mt-6">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Posts que te gustaron</h3>
            <p className="text-slate-400">Próximamente...</p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Actividad Reciente</h3>
            <p className="text-slate-400">Próximamente...</p>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Logros</h3>
            <p className="text-slate-400">Próximamente...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
