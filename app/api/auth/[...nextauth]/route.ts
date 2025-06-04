import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Buscar usuario en Supabase
          const { data: user, error } = await supabaseAdmin!
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single()

          if (error || !user || !user.password_hash) {
            console.log("Usuario no encontrado o sin contraseña")
            return null
          }

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isPasswordValid) {
            console.log("Contraseña incorrecta")
            return null
          }

          // Retornar datos del usuario
          return {
            id: user.id,
            email: user.email,
            name: user.display_name || user.username || user.real_name || user.name,
            image: user.avatar_url,
          }
        } catch (error) {
          console.error("Error en autorización:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Asegurarse de que el ID de usuario esté en el token
      if (user) {
        token.id = user.id
        token.provider = account?.provider || "credentials"
      }
      return token
    },
    async session({ session, token }) {
      // Asegurarse de que el ID de usuario esté en la sesión
      if (token) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        // Solo procesar OAuth providers, las credenciales ya se manejan en authorize
        if (account?.provider === "credentials") {
          return true
        }

        console.log("🔄 INICIANDO proceso de guardado en Supabase...")

        // Verificar si el usuario ya existe
        const { data: existingUser, error: fetchError } = await supabaseAdmin!
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

          // IMPORTANTE: Solo actualizar avatar y timestamp, NO el username
          const { error: updateError } = await supabaseAdmin!
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
            realName = user.name || ""
            displayName = user.name || ""
            // Generar username a partir del email pero SIN usar el email completo
            username =
              user.email
                ?.split("@")[0]
                ?.toLowerCase()
                .replace(/[^a-z0-9]/g, "") || ""
          } else if (account?.provider === "discord") {
            // Para Discord, usar el nombre como username pero limpiarlo
            username = user.name?.toLowerCase().replace(/[^a-z0-9]/g, "") || ""
            displayName = user.name || ""
            realName = ""
          }

          // Verificar que el username sea único
          let finalUsername = username
          let counter = 1
          while (true) {
            const { data: existingUsername } = await supabaseAdmin!
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
            name: user.name,
            real_name: realName,
            username: finalUsername,
            display_name: displayName || finalUsername, // Usar username como display_name si no hay otro
            avatar_url: user.image,
            profile_completed: account?.provider === "google",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error: insertError } = await supabaseAdmin!.from("users").insert([userData])

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
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".pixbae-gaming.com" : undefined, // Dominio principal
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".pixbae-gaming.com" : undefined, // Dominio principal
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".pixbae-gaming.com" : undefined, // Dominio principal
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
