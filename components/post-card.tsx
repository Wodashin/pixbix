"use client"

import type React from "react"
import { useState } from "react"
import { Heart, MessageCircle, Share2, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import Image from "next/image"

interface Post {
  id: number
  title?: string
  content: string
  image_url?: string
  user_id?: string
  likes_count?: number
  comments_count?: number
  shares_count?: number
  views_count?: number
  created_at?: string
  tags?: string[]
  user?: {
    id: string
    username?: string
    display_name?: string
    avatar_url?: string
  }
  achievement_id?: string
}

interface PostCardProps {
  post: Post
  onLike?: (postId: number) => void
  onComment?: (postId: number) => void
  onDelete?: (postId: number) => void
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onDelete }) => {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [imageError, setImageError] = useState(false)

  const handleLike = async () => {
    if (!session?.user?.email) return

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": session.user.email,
        },
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
        onLike?.(post.id)
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = () => {
    onComment?.(post.id)
  }

  const handleDelete = async () => {
    if (!session?.user?.email) return
    if (!confirm("¿Estás seguro de que quieres eliminar este post?")) return

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          "x-user-email": session.user.email,
        },
      })

      if (response.ok) {
        onDelete?.(post.id)
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Hace un momento"

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) return "Hace un momento"
      if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`
      if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`
      return `Hace ${Math.floor(diffInSeconds / 86400)} días`
    } catch {
      return "Hace un momento"
    }
  }

  const isOwner = session?.user?.email && post.user?.id === session.user.id

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-4">
      {/* Header del post */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {post.user?.avatar_url ? (
              <Image
                src={post.user.avatar_url || "/placeholder.svg"}
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

        {/* 🖼️ IMAGEN CON FILL - OPCIÓN 2: IMAGEN COMPLETA */}
        {post.image_url && !imageError && (
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-slate-800">
            <Image
              src={post.image_url || "/placeholder.svg"}
              alt="Imagen del post"
              fill
              className="object-cover rounded-lg"
              onError={() => {
                console.error("❌ Error cargando imagen:", post.image_url)
                setImageError(true)
              }}
              onLoad={() => console.log("✅ Imagen cargada correctamente:", post.image_url)}
              unoptimized
              priority={false}
            />
          </div>
        )}

        {/* Mostrar error si la imagen no carga */}
        {imageError && (
          <div className="w-full h-64 bg-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-sm">❌ Error cargando imagen</p>
              <p className="text-xs mt-1 opacity-75">{post.image_url}</p>
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => {
              const isAchievement = tag.startsWith("logro-")
              return (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${
                    isAchievement ? "bg-yellow-600 text-yellow-100" : "bg-blue-600 text-blue-100"
                  }`}
                >
                  #{tag}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Acciones del post */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{likesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center space-x-2 text-slate-400 hover:text-blue-400"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments_count || 0}</span>
          </Button>

          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-slate-400 hover:text-green-400">
            <Share2 className="h-5 w-5" />
            <span>Compartir</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <Eye className="h-4 w-4" />
          <span>{post.views_count || 0} vistas</span>
        </div>
      </div>
    </div>
  )
}

export default PostCard
