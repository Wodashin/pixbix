"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Users, TrendingUp, Calendar, Search } from "lucide-react"
import { CreatePost } from "@/components/create-post"
import { PostsFeed } from "@/components/posts-feed"
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

            <TabsContent value="feed" className="space-y-6">
              <CreatePost />
              <PostsFeed />
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
