"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Menu, Search, ShoppingCart, Gamepad2, Shield } from "lucide-react"
import { AuthNavReal } from "@/components/auth-nav-real"
import { useAuth } from "@/components/auth-provider-supabase"
import { createClient } from "@/utils/supabase/client"

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Verificar si el usuario es admin o moderador
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user?.email) return

      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("users").select("role").eq("email", user.email).single()

        if (data && !error) {
          setUserRole(data.role)
          setIsAdmin(data.role === "admin" || data.role === "moderator")
        }
      } catch (error) {
        console.error("Error al verificar rol:", error)
      }
    }

    checkUserRole()
  }, [user])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-cyan-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Nobux Gaming
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/compañeros" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Compañeros
            </Link>
            <Link href="/noticias" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Noticias
            </Link>
            <Link href="/eventos" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Eventos
            </Link>
            <Link href="/marketplace" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Marketplace
            </Link>
            <Link href="/comunidad" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Comunidad
            </Link>
            {isAdmin && (
              <Link
                href="/admin/usuarios"
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center"
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden sm:block">
              {isSearchOpen ? (
                <Input
                  type="search"
                  placeholder="Buscar juegos, noticias..."
                  className="w-64 bg-slate-800 border-slate-700 text-slate-100"
                  onBlur={() => setIsSearchOpen(false)}
                  autoFocus
                />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="text-slate-300 hover:text-cyan-400"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-cyan-400">
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {/* Auth Navigation */}
            <div className="hidden md:block">
              <AuthNavReal />
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-300">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-slate-950 border-slate-800">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link href="/compañeros" className="text-slate-300 hover:text-cyan-400 text-lg">
                    Compañeros
                  </Link>
                  <Link href="/noticias" className="text-slate-300 hover:text-cyan-400 text-lg">
                    Noticias
                  </Link>
                  <Link href="/eventos" className="text-slate-300 hover:text-cyan-400 text-lg">
                    Eventos
                  </Link>
                  <Link href="/marketplace" className="text-slate-300 hover:text-cyan-400 text-lg">
                    Marketplace
                  </Link>
                  <Link href="/comunidad" className="text-slate-300 hover:text-cyan-400 text-lg">
                    Comunidad
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin/usuarios"
                      className="text-cyan-400 hover:text-cyan-300 text-lg flex items-center"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Administración
                    </Link>
                  )}

                  {/* Mobile Auth Links */}
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <Link href="/login" className="text-slate-300 hover:text-cyan-400 text-lg block mb-2">
                      Iniciar Sesión
                    </Link>
                    <Link href="/register" className="text-slate-300 hover:text-cyan-400 text-lg block">
                      Registrarse
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
