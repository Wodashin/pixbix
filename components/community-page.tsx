"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
  Search,
  Plus,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider-supabase";
import PostCard from "@/components/post-card"; // Usaremos el PostCard para mostrar las publicaciones
import { SimpleImageUpload } from "@/components/simple-image-upload"; // Componente para subir imágenes

// Definimos la interfaz para los posts, incluyendo la información del usuario
interface Post {
  id: number;
  content: string;
  image_url?: string;
  tags?: string[];
  created_at?: string;
  user: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
  // Agregaremos los recuentos más adelante
  likes_count?: number;
  comments_count?: number;
}

const trendingTopics = [
  { name: "Elden Ring DLC", posts: 1234 },
  { name: "Valorant Champions", posts: 987 },
  { name: "Nintendo Direct", posts: 756 },
  { name: "Gaming Setup", posts: 543 },
  { name: "Indie Games", posts: 432 },
];

const communityStats = [
  { label: "Miembros Activos", value: "15.2K", icon: Users },
  { label: "Posts Hoy", value: "342", icon: MessageSquare },
  { label: "Trending", value: "25", icon: TrendingUp },
  { label: "Eventos", value: "8", icon: Calendar },
];

export function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("feed");

  // Función para obtener los posts desde la API
  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error al cargar los posts:", error);
    }
  };

  // Cargar los posts cuando el componente se monta
  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent, image_url: imageUrl }),
      });

      if (response.ok) {
        setNewPostContent("");
        setImageUrl("");
        fetchPosts(); // Vuelve a cargar los posts para mostrar el nuevo
      }
    } catch (error) {
      console.error("Error al crear el post:", error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* ... (el resto del header y las estadísticas se mantienen igual) ... */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Comunidad Gaming</h1>
        <p className="text-xl text-slate-400 max-w-2xl">
          Conecta con gamers de todo el mundo, comparte tus logros y descubre nuevas experiencias
        </p>
      </div>

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
          {user && (
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
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-100 min-h-[100px]"
                />
                <SimpleImageUpload onUpload={setImageUrl} currentImage={imageUrl} />
                <div className="flex justify-end">
                  <Button onClick={handleCreatePost} className="bg-purple-600 hover:bg-purple-700">
                    Publicar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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

            <TabsContent value="feed" className="space-y-6 mt-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={(postId, type) => console.log(`Liked post ${postId} with ${type}`)}
                />
              ))}
            </TabsContent>
            {/* ... (otras pestañas) ... */}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           {/* ... (contenido de la barra lateral como Búsqueda, Trending Topics, etc.) ... */}
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

        </div>
      </div>
    </main>
  );
}
