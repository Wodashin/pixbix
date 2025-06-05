import type React from "react"
import { Providers } from "@/components/providers"
import { AuthFeedback } from "@/components/auth-feedback"
import { ProfileCompletionHandler } from "@/components/profile-completion-handler"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import { Suspense } from "react"

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
          <Suspense>
            <AuthFeedback />
            <ProfileCompletionHandler />
            {children}
          </Suspense>
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
