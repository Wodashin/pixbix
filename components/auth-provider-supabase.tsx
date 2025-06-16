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

        if (error) {
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

        // Crear o actualizar usuario en la tabla users
        try {
          const { error } = await supabase.from("users").upsert(
            {
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
              image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
              role: "user", // Default role
            },
            {
              onConflict: "id",
            },
          )

          if (error) {
            console.error("Error al crear/actualizar usuario:", error)
          }
        } catch (error) {
          console.error("Error al procesar usuario:", error)
        }
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

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Configuración de Supabase incompleta")
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
