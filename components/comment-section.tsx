"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Trash2, Send } from "lucide-react"

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    name: string
    username: string
    display_name: string
    avatar_url: string
  }
}

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data)
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !session || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
        }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([comment, ...comments])
        setNewComment("")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId))
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Comentarios ({comments.length})</h3>

      {/* Formulario para nuevo comentario */}
      {session && (
        <div className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user?.image || ""} />
            <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] bg-slate-700 border-slate-600 text-slate-100"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Comentar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-slate-400">Cargando comentarios...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.avatar_url || ""} />
                  <AvatarFallback>{comment.user?.display_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">
                        {comment.user?.display_name || comment.user?.username || "Usuario"}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                    {session?.user?.email === comment.user?.username && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-slate-400 hover:text-red-400 p-1 h-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-slate-300 mt-1">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400">No hay comentarios aún. ¡Sé el primero en comentar!</p>
        )}
      </div>
    </div>
  )
}
