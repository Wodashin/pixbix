"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/components/auth-provider-supabase";
import { toast } from "sonner";

// Interfaces para tipar los datos que recibimos
interface Author {
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Función para obtener los comentarios
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
      toast.error("No se pudieron cargar los comentarios.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar comentarios cuando el componente se monta o el postId cambia
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) {
      toast.error("Debes iniciar sesión y escribir un comentario.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const { comment: createdComment } = await response.json();
        // Para mostrar el autor correctamente, lo construimos con los datos del usuario actual
        const commentWithAuthor = {
          ...createdComment,
          author: {
            name: user.user_metadata?.name || user.email,
            avatar: user.user_metadata?.avatar_url,
          }
        }
        setComments((prevComments) => [...prevComments, commentWithAuthor]);
        setNewComment("");
        toast.success("Comentario publicado.");
      } else {
        toast.error("No se pudo publicar tu comentario.");
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      toast.error("Error de conexión al enviar comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulario para nuevo comentario */}
      {user ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{user.email?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? "Enviando..." : "Comentar"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-slate-400">Inicia sesión para comentar</p>
          </CardContent>
        </Card>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {isLoading ? (
            <p className="text-slate-400 text-center">Cargando comentarios...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{comment.author.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-white">{comment.author.name}</span>
                      <span className="text-xs text-slate-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 mb-3">{comment.content}</p>
                    <div className="flex items-center space-x-4">
                      {/* Lógica para likes en comentarios (a implementar) */}
                    </div>
                  </div>
                </div>
