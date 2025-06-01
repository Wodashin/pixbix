"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { PostCard } from "./post-card"
import { usePosts } from "@/hooks/use-posts"
import { Loader2, FileText } from "lucide-react"
import type { Post } from "@/hooks/use-posts"

interface UserPostsProps {
  userId: string
}

export function UserPosts({ userId }: UserPostsProps) {
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { toggleLike } = usePosts()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true)

        // Obtener posts del usuario específico
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(`
            *,
            users!posts_user_id_fkey (
              name,
              real_name,
              username,
              avatar_url
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (postsError) throw postsError

        // Para cada post, obtener conteo de likes y comentarios
        const postsWithCounts = await Promise.all(
          postsData.map(async (post) => {
            // Contar likes
            const { count: likesCount } = await supabase
              .from("likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id)

            // Contar comentarios
            const { count: commentsCount } = await supabase
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id)

            return {
              ...post,
              user: {
                name: post.users.real_name || post.users.name,
                image: post.users.avatar_url,
              },
              likes_count: likesCount || 0,
              comments_count: commentsCount || 0,
              user_has_liked: false, // TODO: Verificar si el usuario actual ha dado like
            }
          }),
        )

        setUserPosts(postsWithCounts)
      } catch (error) {
        console.error("Error fetching user posts:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserPosts()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (userPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No hay posts aún</h3>
        <p className="text-slate-400">Este usuario aún no ha publicado nada.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {userPosts.map((post) => (
        <PostCard key={post.id} post={post} onLike={toggleLike} />
      ))}
    </div>
  )
}
