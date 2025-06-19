"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Edit2, Check, X, Loader2, Calendar, MessageSquare, Heart, Users, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"
import { createClient } from "@/utils/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { UserGallery } from "@/components/user-gallery"
import { GamingProfiles } from "@/components/gaming-profiles"

interface UserStats {
  gamesPlayed: number
  achievements: number
  rating: number
  memberSince: string
  postsCount: number
  likesReceived: number
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

interface UserPost {
  id: string
  title: string
  content: string
  created_at: string
  likes_count: number
  comments_count: number
}

export function SimpleUserProfile() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    gamesPlayed: 0,
    achievements: 0,
    rating: 0,
    memberSince: "",
    postsCount: 0,
    likesReceived: 0,
  })
  const [userPosts, setUserPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("info")

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

        // Obtener posts del usuario (simulado por ahora)
        const mockPosts: UserPost[] = [
          {
            id: "1",
            title: "Mi primera partida en Valorant",
            content: "¡Acabo de terminar mi primera partida clasificatoria! Fue increíble...",
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
            likes_count: 12,
            comments_count: 5,
          },
          {
            id: "2",
            title: "Nuevo setup gaming",
            content: "Finalmente actualicé mi setup con una nueva GPU RTX 4070...",
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
            likes_count: 8,
            comments_count: 3,
          },
        ]

        setUserPosts(mockPosts)

        setUserStats({
          gamesPlayed: 42,
          achievements: 15,
          rating: 4.8,
          memberSince: memberSince,
          postsCount: mockPosts.length,
          likesReceived: mockPosts.reduce((sum, post) => sum + post.likes_count, 0),
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

      setUserProfile({ ...userProfile!, username: newUsername.trim() })
      setEditingUsername(false)
      setError("")
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Inicia sesión para ver tu perfil</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-slate-400">Cargando perfil...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Error al cargar el perfil</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header del perfil */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 mb-6">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <Avatar className="h-32 w-32 border-4 border-cyan-400">
              <AvatarImage src={userProfile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-slate-700 text-cyan-400 text-4xl">
                {userProfile.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{userProfile.name}</h1>
                    {getProviderBadge(userProfile.provider)}
                  </div>

                  {/* Username editable */}
                  {editingUsername ? (
                    <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white w-48"
                        placeholder="Nombre de usuario"
                        disabled={updating}
                      />
                      <Button
                        size="sm"
                        onClick={handleUpdateUsername}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updating}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                      <span className="text-xl text-purple-400">@{userProfile.username}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingUsername(true)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-400">
                    <Mail className="h-4 w-4" />
                    <span>{userProfile.email}</span>
                  </div>
                </div>

                <Button className="bg-cyan-600 hover:bg-cyan-700 mt-4 md:mt-0">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Button>
              </div>

              {error && <p className="text-red-400 text-sm mb-4 text-center md:text-left">{error}</p>}

              <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>Miembro {userStats.memberSince}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{userStats.postsCount}</div>
            <div className="text-sm text-slate-400">Posts</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{userStats.likesReceived}</div>
            <div className="text-sm text-slate-400">Likes</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{userStats.gamesPlayed}</div>
            <div className="text-sm text-slate-400">Partidas</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{userStats.achievements}</div>
            <div className="text-sm text-slate-400">Logros</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{userStats.rating}</div>
            <div className="text-sm text-slate-400">Valoración</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">12</div>
            <div className="text-sm text-slate-400">Nivel</div>
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

        <TabsContent value="info" className="mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Detalles de la cuenta</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Nombre completo</label>
                      <p className="text-white">{userProfile.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Nombre de usuario</label>
                      <p className="text-white">@{userProfile.username}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Correo electrónico</label>
                      <p className="text-white">{userProfile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Método de acceso</label>
                      <p className="text-white capitalize">{userProfile.provider}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Estadísticas</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Miembro desde</label>
                      <p className="text-white">{userStats.memberSince}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Posts publicados</label>
                      <p className="text-white">{userStats.postsCount}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Likes recibidos</label>
                      <p className="text-white">{userStats.likesReceived}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Nivel actual</label>
                      <p className="text-white">Nivel 12 - Gamer Entusiasta</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <Card key={post.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                    <p className="text-slate-300 mb-4">{post.content}</p>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments_count}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No hay posts aún</h3>
                  <p className="text-slate-400">¡Comparte tu primera publicación con la comunidad!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Actividad Reciente</h3>
              <p className="text-slate-400">Tu actividad reciente aparecerá aquí</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <UserGallery userId={userProfile.id} isOwnProfile={true} />
        </TabsContent>

        <TabsContent value="gaming" className="mt-6">
          <GamingProfiles userId={userProfile.id} isOwnProfile={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
