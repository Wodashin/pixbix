"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export interface ProfilePost {
  id: string
  user_id: string
  content: string
  image_url?: string
  tags?: string[]
  created_at: string
  updated_at: string
  user?: {
    name: string
    image: string
  }
  likes_count?: number
  comments_count?: number
  user_has_liked?: boolean
}

interface ProfilePostCardProps {
  post: ProfilePost
  onLike: (postId: string) => void
}

export function ProfilePostCard({ post, onLike }: ProfilePostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: es,
  })

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header del post */}
        <div className="flex items-start space-x-3 mb-4">
          <Avatar>
            <AvatarImage src={post.user?.image || ""} />
            <AvatarFallback>{post.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{post.user?.name || "Usuario"}</h3>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Contenido del post */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Imagen si existe */}
        {post.image_url && (
          <div className="mb-4">
            <img
              src={post.image_url || "/placeholder.svg"}
              alt="Post image"
              className="rounded-lg max-w-full h-auto max-h-96 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center space-x-6 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-2 ${post.user_has_liked ? "text-red-500" : "text-muted-foreground"}`}
          >
            <Heart className={`h-4 w-4 ${post.user_has_liked ? "fill-current" : ""}`} />
            <span>{post.likes_count || 0}</span>
          </Button>

          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments_count || 0}</span>
          </Button>

          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-muted-foreground">
            <Share2 className="h-4 w-4" />
            <span>Compartir</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
