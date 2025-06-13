"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

interface Comment {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  timestamp: string
  likes: number
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

export function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      // Aquí iría la lógica para enviar el comentario a la API
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          name: user.user_metadata?.name || user.email || "Usuario",
          avatar: user.user_metadata?.avatar_url,
        },
        timestamp: new Date().toISOString(),
        likes: 0,
      }

      setComments([comment, ...comments])
      setNewComment("")
    } catch (error) {
      console.error("Error al enviar comentario:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
        {comments.map((comment) => (
          <Card key={comment.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-white">{comment.author.name}</span>
                    <span className="text-xs text-slate-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 mb-3">{comment.content}</p>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-slate-400 hover:text-red-400">
                      <Heart className="h-4 w-4" />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400">
                      <MessageCircle className="h-4 w-4" />
                      <span>Responder</span>
                    </button>
                    <button className="text-slate-400 hover:text-slate-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
