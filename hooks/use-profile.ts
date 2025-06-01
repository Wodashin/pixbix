"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useSession } from "next-auth/react"

export interface UserProfile {
  id: string
  email: string
  name: string
  real_name: string
  username: string
  display_name: string
  avatar_url: string
  bio?: string
  location?: string
  website?: string
  gaming_platforms?: string[]
  favorite_games?: string[]
  profile_completed: boolean
  created_at: string
  updated_at: string
  stats: {
    posts_count: number
    likes_received: number
    comments_count: number
    followers_count: number
    following_count: number
  }
}

export function useProfile(userId?: string) {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchProfile = async () => {
    try {
      setLoading(true)

      // Si no se proporciona userId, usar el del usuario actual
      const targetUserId = userId || session?.user?.email
      if (!targetUserId) return

      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq(userId ? "id" : "email", targetUserId)
        .single()

      if (userError) throw userError

      // Obtener estadísticas del usuario
      const [postsCount, likesReceived, commentsCount] = await Promise.all([
        // Contar posts del usuario
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userData.id),

        // Contar likes recibidos en sus posts
        supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .in("post_id", supabase.from("posts").select("id").eq("user_id", userData.id)),

        // Contar comentarios del usuario
        supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userData.id),
      ])

      const profileData: UserProfile = {
        ...userData,
        stats: {
          posts_count: postsCount.count || 0,
          likes_received: likesReceived.count || 0,
          comments_count: commentsCount.count || 0,
          followers_count: 0, // TODO: Implementar sistema de seguidores
          following_count: 0, // TODO: Implementar sistema de seguidores
        },
      }

      setProfile(profileData)
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!session?.user?.email) return false

    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("email", session.user.email)

      if (error) throw error

      await fetchProfile() // Refrescar datos
      return true
    } catch (err) {
      console.error("Error updating profile:", err)
      return false
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [session, userId])

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  }
}
