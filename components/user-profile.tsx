"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProfile } from "@/hooks/use-profile"
import { useSession } from "next-auth/react"
import { EditProfileModal } from "./edit-profile-modal"
import { UserPosts } from "./user-posts"
import {
  Calendar,
  MapPin,
  LinkIcon,
  Edit,
  Settings,
  Trophy,
  Heart,
  MessageCircle,
  Users,
  Gamepad2,
  Star,
  Crown,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface UserProfileProps {
  userId?: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const { data: session } = useSession()
  const { profile, loading, error, updateProfile } = useProfile(userId)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Cargando perfil...</h2>
            <p className="text-slate-400">Obteniendo información del usuario</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="bg-slate-800 border-slate-700 max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Error al cargar perfil</h2>
              <p className="text-slate-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="bg-slate-800 border-slate-700 max-w-md">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Usuario no encontrado</h2>
              <p className="text-slate-400 mb-4">El perfil que buscas no existe o no está disponible.</p>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Volver atrás
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isOwnProfile = session?.user?.email === profile.email
  const memberSince = formatDistanceToNow(new Date(profile.created_at), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header del perfil */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar y info básica */}
            <div className="flex items-center space-x-6">
              <Avatar className="h-32 w-32 border-4 border-cyan-400">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.real_name} />
                <AvatarFallback className="bg-slate-700 text-cyan-400 text-4xl">
                  {(profile.real_name || profile.name)?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-white">{profile.real_name || profile.name}</h1>
                  <Badge className="bg-purple-600 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Gamer
                  </Badge>
                </div>
                <p className="text-xl text-purple-400">@{profile.username}</p>
                <p className="text-slate-400">{profile.email}</p>

                {profile.bio && <p className="text-slate-300 max-w-md">{profile.bio}</p>}

                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Miembro {memberSince}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center space-x-1">
                      <LinkIcon className="w-4 h-4" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        Sitio web
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex-1 flex justify-end">
              {isOwnProfile ? (
                <div className="flex space-x-3">
                  <Button onClick={() => setIsEditModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Perfil
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Users className="mr-2 h-4 w-4" />
                    Seguir
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Mensaje
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{profile.stats.posts_count}</div>
            <div className="text-sm text-slate-400">Posts</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{profile.stats.likes_received}</div>
            <div className="text-sm text-slate-400">Likes</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{profile.stats.comments_count}</div>
            <div className="text-sm text-slate-400">Comentarios</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{profile.stats.followers_count}</div>
            <div className="text-sm text-slate-400">Seguidores</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{profile.stats.following_count}</div>
            <div className="text-sm text-slate-400">Siguiendo</div>
          </CardContent>
        </Card>
      </div>

      {/* Juegos favoritos y plataformas */}
      {(profile.favorite_games?.length || profile.gaming_platforms?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {profile.favorite_games?.length && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gamepad2 className="mr-2 h-5 w-5 text-cyan-400" />
                  Juegos Favoritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_games.map((game, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300">
                      {game}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.gaming_platforms?.length && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-purple-400" />
                  Plataformas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.gaming_platforms.map((platform, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
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

        <TabsContent value="posts" className="mt-6">
          <UserPosts userId={profile.id} />
        </TabsContent>

        <TabsContent value="likes" className="mt-6">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Posts que le gustaron</h3>
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

      {/* Modal de edición */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onUpdate={updateProfile}
        />
      )}
    </div>
  )
}
