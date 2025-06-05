import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import { createClient } from "@/utils/supabase/server"

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
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        const supabase = createClient()

        const { data: existingUser } = await supabase.from("users").select("*").eq("email", user.email).single()

        if (!existingUser) {
          const { error } = await supabase.from("users").insert({
            email: user.email,
            name: user.name || "",
            avatar_url: user.image || "",
            provider: account?.provider || "unknown",
          })

          if (error) {
            console.error("Error creating user:", error)
            return false
          }
        }

        return true
      } catch (error) {
        console.error("SignIn error:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const supabase = createClient()
          const { data: user } = await supabase
            .from("users")
            .select("id, name, email, avatar_url")
            .eq("email", session.user.email)
            .single()

          if (user) {
            session.user.id = user.id
            session.user.name = user.name
            session.user.image = user.avatar_url
          }
        } catch (error) {
          console.error("Session callback error:", error)
        }
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".pixbae-gaming.com" : undefined,
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import { createClient } from "@/utils/supabase/server"

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
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        const supabase = createClient()

        const { data: existingUser } = await supabase.from("users").select("*").eq("email", user.email).single()

        if (!existingUser) {
          const { error } = await supabase.from("users").insert({
            email: user.email,
            name: user.name || "",
            avatar_url: user.image || "",
            provider: account?.provider || "unknown",
          })

          if (error) {
            console.error("Error creating user:", error)
            return false
          }
        }

        return true
      } catch (error) {
        console.error("SignIn error:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const supabase = createClient()
          const { data: user } = await supabase
            .from("users")
            .select("id, name, email, avatar_url")
            .eq("email", session.user.email)
            .single()

          if (user) {
            session.user.id = user.id
            session.user.name = user.name
            session.user.image = user.avatar_url
          }
        } catch (error) {
          console.error("Session callback error:", error)
        }
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".pixbae-gaming.com" : undefined,
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
