"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Plus,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"

const trendingTopics = [
  { name: "Elden Ring DLC", posts: 1234 },
  { name: "Valorant Champions", posts: 987 },
  { name: "Nintendo Direct", posts: 756 },
  { name: "Gaming Setup", posts: 543 },
  { name: "Indie Games", posts: 432 },
]

const communityStats = [
  { label: "Miembros Activos", value: "15.2K", icon: Users },
  { label: "Posts Hoy", value: "342", icon: MessageSquare },
  { label: "Trending", value: "25", icon: TrendingUp },
  { label: "Eventos", value: "8", icon: Calendar },
]

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState("feed")
  const { data: session } = useSession()
  const [newPost, setNewPost] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts")
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleCreatePost = async () => {
    if (!newPost.trim() || !session) return

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newPost,
        }),
      })

      if (response.ok) {
        const newPostData = await response.json()
        setPosts([newPostData, ...posts])
        setNewPost("")
      }
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        // Update the post in the local state
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, likes_count: (post.likes_count || 0) + 1, liked: true } : post,
          ),
        )
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Comunidad Gaming</h1>
        <p className="text-xl text-slate-400 max-w-2xl">
          Conecta con gamers de todo el mundo, comparte tus logros y descubre nuevas experiencias
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {communityStats.map((stat, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <stat.icon className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
              <TabsTrigger value="feed" className="data-[state=active]:bg-purple-600">
                Feed
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-purple-600">
                Popular
              </TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-purple-600">
                Reciente
              </TabsTrigger>
            </TabsList>

            {/* Create Post */}
            {session && (
              <Card className="bg-slate-800 border-slate-700 mb-6 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Crear Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="¿Qué está pasando en tu mundo gaming?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100 min-h-[100px]"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                        📷 Imagen
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                        🎮 Juego
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                        🏆 Logro
                      </Button>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!newPost.trim()}
                    >
                      Publicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <TabsContent value="feed" className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">Cargando posts...</p>
                </div>
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      {/* Post Header */}
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar>
                          <AvatarImage
                            src={post.user?.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
                          />
                          <AvatarFallback>{post.user?.username?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">{post.user?.username || "Usuario"}</h3>
                            {post.user?.badge && (
                              <Badge variant="secondary" className="bg-purple-600 text-white">
                                {post.user.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">
                            {new Date(post.created_at).toLocaleString("es-ES", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-slate-300 mb-4">{post.content}</p>

                      {/* Post Image */}
                      {post.image_url && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={post.image_url || "/placeholder.svg"}
                            alt="Post content"
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-cyan-500 text-cyan-400">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="flex items-center space-x-6">
                          <button
                            className="flex items-center space-x-2 text-slate-400 hover:text-red-400 transition-colors"
                            onClick={() => handleLikePost(post.id)}
                          >
                            <Heart className={`h-5 w-5 ${post.liked ? "fill-red-400 text-red-400" : ""}`} />
                            <span>{post.likes_count || 0}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors">
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.comments_count || 0}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-slate-400 hover:text-purple-400 transition-colors">
                            <Share2 className="h-5 w-5" />
                            <span>{post.shares_count || 0}</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">{post.views_count || 0} vistas</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-white mb-2">¡Bienvenido a la comunidad!</h3>
                  <p className="text-slate-400 mb-4">No hay posts aún. ¡Sé el primero en compartir algo!</p>
                  {!session && <p className="text-slate-500">Inicia sesión para crear tu primer post</p>}
                </div>
              )}
            </TabsContent>

            <TabsContent value="popular" className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-white mb-2">Posts Populares</h3>
                <p className="text-slate-400">Los posts más populares de la semana aparecerán aquí</p>
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-white mb-2">Posts Recientes</h3>
                <p className="text-slate-400">Los posts más recientes aparecerán aquí</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar en la comunidad..."
                  className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />
                Trending
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">#{topic.name}</p>
                    <p className="text-sm text-slate-400">{topic.posts} posts</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                    Ver
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                <Users className="mr-2 h-4 w-4" />
                Encontrar Compañeros
              </Button>
              <Button
                variant="outline"
                className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Ver Eventos
              </Button>
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat Global
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
