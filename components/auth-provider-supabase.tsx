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
        const { data: { user }, error } = await supabase.auth.getUser()
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
      setLoading(false)
    })

    return () => { subscription.unsubscribe() }
  }, [supabase])

  const signIn = async (provider: "google" | "discord") => {
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl },
    })
    if (error) throw error
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    // CORREGIDO: usar variable de entorno en vez de URL hardcodeada
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithEmail, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
