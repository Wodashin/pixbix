"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Heart,
  Share2,
  Users,
  TrendingUp,
  Calendar,
  Search,
  Plus,
  MessageCircle,
  Eye,
} from "lucide-react"

const communityPosts = [
  {
    id: 1,
    author: {
      name: "GamerPro_2024",
      avatar: "/placeholder.svg?height=40&width=40",
      badge: "Veterano",
      level: 45,
    },
    content:
      "¡Acabo de completar Elden Ring al 100%! Después de 120 horas, finalmente derroté a todos los jefes. ¿Alguien más ha logrado esto? ¡Compartan sus experiencias!",
    image: "/placeholder.svg?height=300&width=500",
    timestamp: "hace 2 horas",
    likes: 234,
    comments: 45,
    shares: 12,
    tags: ["Elden Ring", "Logro", "RPG"],
  },
  {
    id: 2,
    author: {
      name: "StreamerLuna",
      avatar: "/placeholder.svg?height=40&width=40",
      badge: "Streamer",
      level: 38,
    },
    content:
      "¡Hoy empiezo mi stream de 24 horas jugando Valorant! El objetivo es llegar a Radiante. ¡Vengan a apoyar y juguemos juntos! 🎮✨",
    timestamp: "hace 4 horas",
    likes: 189,
    comments: 67,
    shares: 23,
    tags: ["Valorant", "Stream", "Competitivo"],
  },
  {
    id: 3,
    author: {
      name: "RetroGamer95",
      avatar: "/placeholder.svg?height=40&width=40",
      badge: "Coleccionista",
      level: 52,
    },
    content:
      "Encontré mi vieja consola Nintendo 64 en el ático. ¿Qué juegos me recomiendan para revivir la nostalgia? Estoy pensando en Super Mario 64 y Zelda OoT.",
    timestamp: "hace 6 horas",
    likes: 156,
    comments: 89,
    shares: 8,
    tags: ["Retro", "Nintendo", "Nostalgia"],
  },
]

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
  const [newPost, setNewPost] = useState("")
  const [activeTab, setActiveTab] = useState("feed")

  const handleCreatePost = () => {
    if (newPost.trim()) {
      // Aquí iría la lógica para crear un nuevo post
      console.log("Nuevo post:", newPost)
      setNewPost("")
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
            <Card className="bg-slate-800 border-slate-700 mb-6">
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
                  <Button onClick={handleCreatePost} className="bg-purple-600 hover:bg-purple-700">
                    Publicar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <TabsContent value="feed" className="space-y-6">
              {communityPosts.map((post) => (
                <Card key={post.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    {/* Post Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar>
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white">{post.author.name}</h3>
                          <Badge variant="secondary" className="bg-purple-600 text-white">
                            {post.author.badge}
                          </Badge>
                          <span className="text-xs text-slate-400">Nivel {post.author.level}</span>
                        </div>
                        <p className="text-sm text-slate-400">{post.timestamp}</p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-slate-300 mb-4">{post.content}</p>

                    {/* Post Image */}
                    {post.image && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="Post content"
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-cyan-500 text-cyan-400">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center space-x-2 text-slate-400 hover:text-red-400 transition-colors">
                          <Heart className="h-5 w-5" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors">
                          <MessageCircle className="h-5 w-5" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-slate-400 hover:text-purple-400 transition-colors">
                          <Share2 className="h-5 w-5" />
                          <span>{post.shares}</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">{post.likes * 3} vistas</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
