import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import { supabaseAdmin } from "@/lib/supabase"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.provider = account?.provider
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        console.log("🔄 INICIANDO proceso de guardado en Supabase...")
        console.log("📋 Datos del usuario:", {
          provider: account?.provider,
          email: user.email,
          name: user.name,
          image: user.image,
        })

        // Verificar si el usuario ya existe
        const { data: existingUser, error: fetchError } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("❌ ERROR buscando usuario:", fetchError)
          return true
        }

        if (existingUser) {
          console.log("👤 Usuario existente encontrado:", existingUser.email)

          // Actualizar información del usuario existente
          const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({
              name: user.name,
              avatar_url: user.image,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingUser.id)

          if (updateError) {
            console.error("❌ ERROR actualizando usuario:", updateError)
          } else {
            console.log("✅ Usuario actualizado exitosamente")
          }
        } else {
          console.log("🆕 Creando nuevo usuario...")

          const userData = {
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error: insertError } = await supabaseAdmin.from("users").insert([userData])

          if (insertError) {
            console.error("❌ ERROR creando usuario:", insertError)
          } else {
            console.log("🎉 ¡USUARIO CREADO EXITOSAMENTE!")
          }
        }

        return true
      } catch (error) {
        console.error("💥 ERROR GENERAL en signIn:", error)
        return true
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  // Configuración mejorada de cookies para producción
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },
  // Configuración adicional para debugging
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
