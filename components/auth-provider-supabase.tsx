"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User, AuthError } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (provider: "google" | "discord") => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProviderSupabase({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error && error.message !== "Auth session missing!") {
          console.error("Error al obtener usuario:", error)
        }

        setUser(user)
      } catch (error) {
        console.error("Error inesperado:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        // No intentamos crear el usuario aquí, el trigger se encarga
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (provider: "google" | "discord") => {
    console.log(`Iniciando login con ${provider}...`)

    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "/auth/callback"

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error(`Error en login con ${provider}:`, error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    console.log("Iniciando login con email...")
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error en login con email:", error)
    }

    return { error }
  }

  const signUp = async (email: string, password: string) => {
    console.log("Registrando nuevo usuario...")

    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "/auth/callback"

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error("Error en registro:", error)
    }

    return { error }
  }

  const signOut = async () => {
    console.log("Cerrando sesión...")
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error al cerrar sesión:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithEmail, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
