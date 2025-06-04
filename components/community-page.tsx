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
  ImageIcon,
  Gamepad2,
  Trophy,
  X,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import { GameSelectorModal } from "@/components/game-selector-modal"
import { createClient } from "@/utils/supabase/client"
import { AchievementSelectorModal } from "@/components/achievement-selector-modal"
import { CommentSection } from "@/components/comment-section"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CommunityStats {
  activeUsers: number
  postsToday: number
  totalPosts: number
  upcomingEvents: number
}

interface TrendingTopic {
  name: string
  posts: number
}

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState("feed")
  const { data: session } = useSession()
  const [newPost, setNewPost] = useState("")
  const [selectedGame, setSelectedGame] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [expandedComments, setExpandedComments] = useState<string[]>([])
  const [stats, setStats] = useState<CommunityStats>({
    activeUsers: 0,
    postsToday: 0,
    totalPosts: 0,
    upcomingEvents: 0,
  })
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const supabase = createClient()
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false)

  // Fetch community stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/community/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  // Fetch trending topics
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch("/api/community/trending")
        if (response.ok) {
          const data = await response.json()
          setTrendingTopics(data)
        }
      } catch (error) {
        console.error("Error fetching trending:", error)
      }
    }

    fetchTrending()
  }, [])

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts")
        if (response.ok) {
          const data = await response.json()
          setPosts(Array.isArray(data) ? data : data.posts || [])
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
    if (!newPost.trim() || !session || isPosting) return

    setIsPosting(true)
    try {
      const tags = [...selectedTags]
      if (selectedGame) tags.push(selectedGame)

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newPost,
          tags: tags.length > 0 ? tags : undefined,
        }),
      })

      if (response.ok) {
        const newPostData = await response.json()
        setPosts([newPostData, ...posts])
        setNewPost("")
        setSelectedGame("")
        setSelectedTags([])
      } else {
        const errorData = await response.json()
        alert("Error al crear el post: " + (errorData.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Error al crear el post.")
    } finally {
      setIsPosting(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!session) {
      alert("Debes iniciar sesión para dar like")
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const { liked } = await response.json()
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes_count: liked ? (post.likes_count || 0) + 1 : Math.max((post.likes_count || 0) - 1, 0),
                  user_has_liked: liked,
                }
              : post,
          ),
        )
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este post?")) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId))
      } else {
        alert("Error al eliminar el post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Error al eliminar el post")
    }
  }

  const handleSharePost = async (post: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${post.user?.display_name || post.user?.username || "Usuario"}`,
          text: post.content,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert("Enlace copiado al portapapeles")
      } catch (error) {
        console.log("Error copying to clipboard:", error)
      }
    }
  }

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]))
  }

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const communityStatsDisplay = [
    { label: "Miembros Activos", value: stats.activeUsers.toLocaleString(), icon: Users },
    { label: "Posts Hoy", value: stats.postsToday.toString(), icon: MessageSquare },
    { label: "Trending", value: trendingTopics.length.toString(), icon: TrendingUp },
    { label: "Eventos", value: stats.upcomingEvents.toString(), icon: Calendar },
  ]

  const handleAchievementSelect = (achievement: any) => {
    addTag(`logro-${achievement.name}`)
  }

  const isPostOwner = (post: any) => {
    return session?.user?.email === post.user?.username || session?.user?.id === post.user_id
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Comunidad Pixbae</h1>
        <p className="text-xl text-slate-400 max-w-2xl">
          Conecta con gamers de todo el mundo, comparte tus logros y descubre nuevas experiencias
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {communityStatsDisplay.map((stat, index) => (
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

                  {/* Game Selection */}
                  {selectedGame && (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-cyan-600 text-white">
                        🎮 {selectedGame}
                        <button onClick={() => setSelectedGame("")} className="ml-2">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} className="bg-purple-600 text-white">
                          #{tag}
                          <button onClick={() => removeTag(tag)} className="ml-2">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300"
                        onClick={() => {
                          alert("Funcionalidad de imagen próximamente")
                        }}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Imagen
                      </Button>

                      <GameSelectorModal onGameSelect={setSelectedGame}>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                          <Gamepad2 className="mr-2 h-4 w-4" />
                          Juego
                        </Button>
                      </GameSelectorModal>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300"
                        onClick={() => setIsAchievementModalOpen(true)}
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        Logro
                      </Button>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!newPost.trim() || isPosting}
                    >
                      {isPosting ? "Publicando..." : "Publicar"}
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
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={post.user?.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
                            />
                            <AvatarFallback>{post.user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-white">
                                {post.user?.display_name || post.user?.username || "Usuario"}
                              </h3>
                              <Badge variant="secondary" className="bg-purple-600 text-white">
                                Gamer
                              </Badge>
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

                        {/* Post Options */}
                        {isPostOwner(post) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-400">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
                          {post.tags.map((tag: string, index: number) => {
                            if (tag.startsWith("logro-")) {
                              const achievementName = tag.replace("logro-", "").toUpperCase()
                              return (
                                <Badge
                                  key={index}
                                  variant="default"
                                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                                >
                                  🏆 {achievementName}
                                </Badge>
                              )
                            }
                            return (
                              <Badge key={index} variant="outline" className="border-cyan-500 text-cyan-400">
                                #{tag}
                              </Badge>
                            )
                          })}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="flex items-center space-x-6">
                          <button
                            className={`flex items-center space-x-2 transition-colors ${
                              post.user_has_liked ? "text-red-400" : "text-slate-400 hover:text-red-400"
                            }`}
                            onClick={() => handleLikePost(post.id)}
                          >
                            <Heart className={`h-5 w-5 ${post.user_has_liked ? "fill-current" : ""}`} />
                            <span>{post.likes_count || 0}</span>
                          </button>
                          <button
                            className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors"
                            onClick={() => toggleComments(post.id)}
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.comments_count || 0}</span>
                          </button>
                          <button
                            className="flex items-center space-x-2 text-slate-400 hover:text-purple-400 transition-colors"
                            onClick={() => handleSharePost(post)}
                          >
                            <Share2 className="h-5 w-5" />
                            <span>Compartir</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">{post.views_count || 0} vistas</span>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.includes(post.id) && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <CommentSection postId={post.id} />
                        </div>
                      )}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-400 hover:text-purple-300"
                    onClick={() => addTag(topic.name)}
                  >
                    Usar
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
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Modal de selección de logros */}
      <AchievementSelectorModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        onSelect={handleAchievementSelect}
      />
    </main>
  )
}
