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
        token.isNewUser = account?.isNewUser || false
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
        session.user.isNewUser = token.isNewUser as boolean
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        console.log("🔄 INICIANDO proceso de autenticación...")

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
              last_provider: account?.provider,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingUser.id)

          if (updateError) {
            console.error("❌ ERROR actualizando usuario:", updateError)
          } else {
            console.log("✅ Usuario actualizado exitosamente")
          }

          // Marcar como usuario existente
          if (account) {
            account.isNewUser = false
          }
        } else {
          console.log("🆕 Creando nuevo usuario...")

          const userData = {
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            provider: account?.provider,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error: insertError } = await supabaseAdmin.from("users").insert([userData])

          if (insertError) {
            console.error("❌ ERROR creando usuario:", insertError)
          } else {
            console.log("🎉 ¡USUARIO CREADO EXITOSAMENTE!")
            // Marcar como usuario nuevo
            if (account) {
              account.isNewUser = true
            }
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
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`🎯 Usuario ${isNewUser ? "nuevo" : "existente"} logueado:`, {
        email: user.email,
        provider: account?.provider,
        isNewUser,
      })
    },
  },
})

export { handler as GET, handler as POST }
