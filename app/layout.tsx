import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProviderSupabase } from "@/components/auth-provider-supabase"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PixBae",
  description: "Plataforma de gaming y comunidad",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProviderSupabase>{children}</AuthProviderSupabase>
      </body>
    </html>
  )
}
