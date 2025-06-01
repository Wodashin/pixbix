"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"

interface UserData {
  id: string
  email: string
  name: string
  real_name: string
  username: string
  display_name: string
  avatar_url: string
  profile_completed: boolean
  created_at: string
  updated_at: string
}

export function useUserData() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false)

  // Usar una referencia para evitar múltiples solicitudes
  const fetchedRef = useRef(false)

  useEffect(() => {
    async function fetchUserData() {
      if (status === "loading") return

      // Si ya obtuvimos los datos o no hay sesión, no hacer nada
      if (fetchedRef.current || !session?.user?.email) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        fetchedRef.current = true

        const supabase = createClient()
        const { data, error } = await supabase.from("users").select("*").eq("email", session.user.email).single()

        if (error) {
          console.error("Error fetching user data:", error)
          setError(error.message)
        } else {
          setUserData(data)
          setNeedsProfileCompletion(!data.profile_completed)
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Error al cargar datos del usuario")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [session, status])

  const refreshUserData = async () => {
    if (!session?.user?.email) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("users").select("*").eq("email", session.user.email).single()

      if (error) {
        console.error("Error refreshing user data:", error)
      } else {
        setUserData(data)
        setNeedsProfileCompletion(!data.profile_completed)
      }
    } catch (err) {
      console.error("Error refreshing:", err)
    }
  }

  return {
    userData,
    loading,
    error,
    isAuthenticated: !!session,
    needsProfileCompletion,
    refreshUserData,
  }
}
