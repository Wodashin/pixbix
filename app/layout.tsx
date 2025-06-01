import type React from "react"
import { Providers } from "@/components/providers"
import { AuthFeedback } from "@/components/auth-feedback"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <AuthFeedback />
          {children}
        </Providers>
      </body>
    </html>
  )
}
