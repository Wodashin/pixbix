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

          // Solo actualizar avatar y timestamp
          const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({
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

          // Generar username único basado en el proveedor
          let username = ""
          let realName = ""
          let displayName = ""

          if (account?.provider === "google") {
            // Para Google, usar el nombre como real_name
            realName = user.name || ""
            displayName = user.name || ""
            // Generar username desde el email
            username =
              user.email
                ?.split("@")[0]
                ?.toLowerCase()
                .replace(/[^a-z0-9]/g, "") || ""
          } else if (account?.provider === "discord") {
            // Para Discord, el nombre es el username
            username = user.name?.toLowerCase().replace(/[^a-z0-9]/g, "") || ""
            displayName = user.name || ""
            // real_name se solicitará después
            realName = ""
          }

          // Verificar que el username sea único
          let finalUsername = username
          let counter = 1
          while (true) {
            const { data: existingUsername } = await supabaseAdmin
              .from("users")
              .select("username")
              .eq("username", finalUsername)
              .single()

            if (!existingUsername) break
            finalUsername = `${username}${counter}`
            counter++
          }

          const userData = {
            email: user.email,
            name: user.name, // Mantener para compatibilidad
            real_name: realName,
            username: finalUsername,
            display_name: displayName,
            avatar_url: user.image,
            profile_completed: account?.provider === "google", // Google completo, Discord no
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
        maxAge: 60 * 15,
      },
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15,
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
