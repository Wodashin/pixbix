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
      setError(null)

      // Si no se proporciona userId, usar el email del usuario actual
      const targetIdentifier = userId || session?.user?.email
      if (!targetIdentifier) {
        setError("No hay usuario para cargar")
        return
      }

      console.log("🔍 Buscando perfil para:", targetIdentifier)

      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq(userId ? "id" : "email", targetIdentifier)
        .single()

      if (userError) {
        console.error("❌ Error obteniendo usuario:", userError)
        throw new Error(`Error obteniendo usuario: ${userError.message}`)
      }

      if (!userData) {
        throw new Error("Usuario no encontrado")
      }

      console.log("✅ Usuario encontrado:", userData)

      // Obtener estadísticas del usuario de forma segura
      try {
        const [postsResult, likesResult, commentsResult] = await Promise.allSettled([
          // Contar posts del usuario
          supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userData.id),

          // Contar likes recibidos en posts del usuario
          supabase
            .from("likes")
            .select(
              `
              *,
              posts!inner(user_id)
            `,
              { count: "exact", head: true },
            )
            .eq("posts.user_id", userData.id),

          // Contar comentarios del usuario
          supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userData.id),
        ])

        const postsCount = postsResult.status === "fulfilled" ? postsResult.value.count || 0 : 0
        const likesCount = likesResult.status === "fulfilled" ? likesResult.value.count || 0 : 0
        const commentsCount = commentsResult.status === "fulfilled" ? commentsResult.value.count || 0 : 0

        const profileData: UserProfile = {
          ...userData,
          // Asegurar que los arrays existen
          gaming_platforms: userData.gaming_platforms || [],
          favorite_games: userData.favorite_games || [],
          stats: {
            posts_count: postsCount,
            likes_received: likesCount,
            comments_count: commentsCount,
            followers_count: 0, // TODO: Implementar sistema de seguidores
            following_count: 0, // TODO: Implementar sistema de seguidores
          },
        }

        console.log("✅ Perfil completo:", profileData)
        setProfile(profileData)
      } catch (statsError) {
        console.warn("⚠️ Error obteniendo estadísticas, usando valores por defecto:", statsError)

        // Si falla obtener estadísticas, crear perfil con stats en 0
        const profileData: UserProfile = {
          ...userData,
          gaming_platforms: userData.gaming_platforms || [],
          favorite_games: userData.favorite_games || [],
          stats: {
            posts_count: 0,
            likes_received: 0,
            comments_count: 0,
            followers_count: 0,
            following_count: 0,
          },
        }

        setProfile(profileData)
      }
    } catch (err) {
      console.error("💥 Error general en fetchProfile:", err)
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
    if (session || userId) {
      fetchProfile()
    }
  }, [session, userId])

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  }
}
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
      setError(null)

      // Si no se proporciona userId, usar el email del usuario actual
      const targetIdentifier = userId || session?.user?.email
      if (!targetIdentifier) {
        setError("No hay usuario para cargar")
        return
      }

      console.log("🔍 Buscando perfil para:", targetIdentifier)

      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq(userId ? "id" : "email", targetIdentifier)
        .single()

      if (userError) {
        console.error("❌ Error obteniendo usuario:", userError)
        throw new Error(`Error obteniendo usuario: ${userError.message}`)
      }

      if (!userData) {
        throw new Error("Usuario no encontrado")
      }

      console.log("✅ Usuario encontrado:", userData)

      // Obtener estadísticas del usuario de forma segura
      try {
        const [postsResult, likesResult, commentsResult] = await Promise.allSettled([
          // Contar posts del usuario
          supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userData.id),

          // Contar likes recibidos en posts del usuario
          supabase
            .from("likes")
            .select(
              `
              *,
              posts!inner(user_id)
            `,
              { count: "exact", head: true },
            )
            .eq("posts.user_id", userData.id),

          // Contar comentarios del usuario
          supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userData.id),
        ])

        const postsCount = postsResult.status === "fulfilled" ? postsResult.value.count || 0 : 0
        const likesCount = likesResult.status === "fulfilled" ? likesResult.value.count || 0 : 0
        const commentsCount = commentsResult.status === "fulfilled" ? commentsResult.value.count || 0 : 0

        const profileData: UserProfile = {
          ...userData,
          // Asegurar que los arrays existen
          gaming_platforms: userData.gaming_platforms || [],
          favorite_games: userData.favorite_games || [],
          stats: {
            posts_count: postsCount,
            likes_received: likesCount,
            comments_count: commentsCount,
            followers_count: 0, // TODO: Implementar sistema de seguidores
            following_count: 0, // TODO: Implementar sistema de seguidores
          },
        }

        console.log("✅ Perfil completo:", profileData)
        setProfile(profileData)
      } catch (statsError) {
        console.warn("⚠️ Error obteniendo estadísticas, usando valores por defecto:", statsError)

        // Si falla obtener estadísticas, crear perfil con stats en 0
        const profileData: UserProfile = {
          ...userData,
          gaming_platforms: userData.gaming_platforms || [],
          favorite_games: userData.favorite_games || [],
          stats: {
            posts_count: 0,
            likes_received: 0,
            comments_count: 0,
            followers_count: 0,
            following_count: 0,
          },
        }

        setProfile(profileData)
      }
    } catch (err) {
      console.error("💥 Error general en fetchProfile:", err)
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
    if (session || userId) {
      fetchProfile()
    }
  }, [session, userId])

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  }
}
