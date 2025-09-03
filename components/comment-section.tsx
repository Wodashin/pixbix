"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider-supabase";
import { toast } from "sonner";

// Definimos interfaces para que nuestro código sepa qué forma tienen los datos
interface Author {
  display_name: string;
  avatar_url?: string;
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  created_at: string;
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

  // Función para obtener los comentarios desde nuestra API
  const fetchComments = async () => {
    if (!postId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        toast.error("No se pudieron cargar los comentarios.");
      }
    } catch (error) {
      toast.error("Error de red al cargar comentarios.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar los comentarios cuando el componente se muestra por primera vez
  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast.error("Debes iniciar sesión para poder comentar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();

      if (response.ok) {
        // Para que el nuevo comentario se muestre al instante, lo construimos con los datos del usuario actual
        const commentWithAuthor = {
          ...data.comment,
          author: {
            display_name: user.user_metadata?.name || user.email,
            avatar_url: user.user_metadata?.avatar_url,
          }
        };
        setComments((prevComments) => [...prevComments, commentWithAuthor]);
        setNewComment("");
        toast.success("Comentario publicado.");
      } else {
        toast.error(data.error || "No se pudo publicar tu comentario.");
      }
    } catch (error) {
      toast.error("Error de conexión al enviar el comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulario para nuevo comentario */}
      {user && (
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
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-slate-400 text-center py-4">Cargando comentarios...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{comment.author?.display_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-white">{comment.author?.display_name || "Usuario"}</span>
                      <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-slate-400 text-center py-4">Sé el primero en comentar.</p>
        )}
      </div>
    </div>
  );
}
