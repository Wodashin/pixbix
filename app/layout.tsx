import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PixBae - Plataforma Gaming",
  description: "Conecta con gamers, encuentra compañeros y descubre nuevas experiencias",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
