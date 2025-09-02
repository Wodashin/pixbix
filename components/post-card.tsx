"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Eye, MoreHorizontal, Trash2, ThumbsDown } from "lucide-react"; // Importamos el ícono de dislike
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider-supabase"; // Usaremos el hook de Supabase
import Image from "next/image";

interface Post {
  id: number;
  title?: string;
  content: string;
  image_url?: string;
  user_id?: string;
  created_at?: string;
  tags?: string[];
  user?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  // Necesitamos obtener los contadores y el estado del voto del usuario desde la BD
  likes_count?: number;
  dislikes_count?: number;
  user_interaction?: 'like' | 'dislike' | null;
}

interface PostCardProps {
  post: Post;
  onComment?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onInteraction?: () => void; // Para refrescar los datos
}

const PostCard: React.FC<PostCardProps> = ({ post, onComment, onDelete, onInteraction }) => {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [dislikesCount, setDislikesCount] = useState(post.dislikes_count || 0);
  const [userInteraction, setUserInteraction] = useState(post.user_interaction || null);
  const [imageError, setImageError] = useState(false);

  // Sincronizar el estado si las props del post cambian
  useEffect(() => {
    setLikesCount(post.likes_count || 0);
    setDislikesCount(post.dislikes_count || 0);
    setUserInteraction(post.user_interaction || null);
  }, [post]);


  const handleInteraction = async (type: 'like' | 'dislike') => {
    if (!user) return; // Si no hay usuario, no hacer nada

    try {
      // Lógica optimista: actualiza la UI inmediatamente
      const originalInteraction = userInteraction;
      const originalLikes = likesCount;
      const originalDislikes = dislikesCount;

      let newInteraction: 'like' | 'dislike' | null = null;
      let newLikes = likesCount;
      let newDislikes = dislikesCount;

      if (originalInteraction === type) { // Quitar el voto
        newInteraction = null;
        if (type === 'like') newLikes--;
        else newDislikes--;
      } else if (originalInteraction) { // Cambiar el voto
        newInteraction = type;
        if (type === 'like') {
          newLikes++;
          newDislikes--;
        } else {
          newLikes--;
          newDislikes++;
        }
      } else { // Voto nuevo
        newInteraction = type;
        if (type === 'like') newLikes++;
        else newDislikes++;
      }
      
      setUserInteraction(newInteraction);
      setLikesCount(newLikes);
      setDislikesCount(newDislikes);


      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        // Si falla la API, revierte los cambios en la UI
        setUserInteraction(originalInteraction);
        setLikesCount(originalLikes);
        setDislikesCount(originalDislikes);
      } else {
        onInteraction?.(); // Llama a la función para refrescar si es necesario
      }
    } catch (error) {
      console.error("Error en la interacción:", error);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm("¿Estás seguro de que quieres eliminar este post?")) return;

    try {
      const response = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (response.ok) {
        onDelete?.(post.id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const formatDate = (dateString?: string) => {
    // ... (la función formatDate se mantiene igual)
  };

  const isOwner = user && post.user_id === user.id;

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-4">
      {/* ... (código del header y contenido del post se mantiene igual) ... */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {post.user?.avatar_url ? (
              <Image
                src={post.user.avatar_url}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              (post.user?.display_name || post.user?.username || "U")[0].toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white">
                {post.user?.display_name || post.user?.username || "Usuario"}
              </h3>
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">Gamer</span>
            </div>
            <p className="text-sm text-slate-400">{formatDate(post.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-slate-400">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Contenido del post */}
      <div className="space-y-3">
        <p className="text-white leading-relaxed">{post.content}</p>

        {post.image_url && !imageError && (
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-slate-800">
            <Image
              src={post.image_url}
              alt="Imagen del post"
              fill
              className="object-cover rounded-lg"
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        )}
      </div>

      {/* Acciones del post */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleInteraction('like')}
            className={`flex items-center space-x-2 ${userInteraction === 'like' ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
          >
            <Heart className={`h-5 w-5 ${userInteraction === 'like' ? "fill-current" : ""}`} />
            <span>{likesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleInteraction('dislike')}
            className={`flex items-center space-x-2 ${userInteraction === 'dislike' ? "text-blue-500" : "text-slate-400 hover:text-blue-400"}`}
          >
            <ThumbsDown className={`h-5 w-5 ${userInteraction === 'dislike' ? "fill-current" : ""}`} />
            <span>{dislikesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment?.(post.id)}
            className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments_count || 0}</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <Eye className="h-4 w-4" />
          <span>{post.views_count || 0} vistas</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
