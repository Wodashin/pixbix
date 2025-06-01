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

        // Verificar conexión a Supabase
        console.log("🔗 Verificando conexión a Supabase...")
        const { data: testConnection, error: connectionError } = await supabaseAdmin
          .from("users")
          .select("count")
          .limit(1)

        if (connectionError) {
          console.error("❌ ERROR DE CONEXIÓN a Supabase:", connectionError)
          return true // Permitir login aunque falle
        }
        console.log("✅ Conexión a Supabase exitosa")

        // Verificar si el usuario ya existe
        console.log("🔍 Buscando usuario existente...")
        const { data: existingUser, error: fetchError } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("❌ ERROR buscando usuario:", fetchError)
          console.error("❌ Código de error:", fetchError.code)
          console.error("❌ Mensaje:", fetchError.message)
          return true
        }

        if (existingUser) {
          console.log("👤 Usuario ya existe:", existingUser.email)

          // Actualizar información
          const { data: updatedUser, error: updateError } = await supabaseAdmin
            .from("users")
            .update({
              name: user.name,
              avatar_url: user.image,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingUser.id)
            .select()

          if (updateError) {
            console.error("❌ ERROR actualizando usuario:", updateError)
            console.error("❌ Detalles:", updateError.details)
            console.error("❌ Hint:", updateError.hint)
          } else {
            console.log("✅ Usuario actualizado exitosamente:", updatedUser)
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

          console.log("📝 Datos a insertar:", userData)

          const { data: newUser, error: insertError } = await supabaseAdmin.from("users").insert([userData]).select()

          if (insertError) {
            console.error("❌ ERROR CRÍTICO creando usuario:", insertError)
            console.error("❌ Código:", insertError.code)
            console.error("❌ Mensaje:", insertError.message)
            console.error("❌ Detalles:", insertError.details)
            console.error("❌ Hint:", insertError.hint)
          } else {
            console.log("🎉 ¡USUARIO CREADO EXITOSAMENTE!", newUser)
          }
        }

        return true
      } catch (error) {
        console.error("💥 ERROR GENERAL en signIn:", error)
        console.error("💥 Stack trace:", error instanceof Error ? error.stack : "No stack trace")
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
})

export { handler as GET, handler as POST }
