"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Menu, Search, ShoppingCart, Gamepad2 } from "lucide-react"
import { AuthNavEnhanced } from "@/components/auth-nav-enhanced"

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-cyan-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              PixBae
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

            {/* Auth Navigation - Usando el componente mejorado */}
            <div className="hidden md:block">
              <AuthNavEnhanced />
            </div>

            {/* Mobile Menu */}
            <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-300">
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 border-slate-800 w-full max-w-sm">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link
                    href="/compañeros"
                    className="text-slate-300 hover:text-cyan-400 text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Compañeros
                  </Link>
                  <Link
                    href="/noticias"
                    className="text-slate-300 hover:text-cyan-400 text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Noticias
                  </Link>
                  <Link
                    href="/eventos"
                    className="text-slate-300 hover:text-cyan-400 text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Eventos
                  </Link>
                  <Link
                    href="/marketplace"
                    className="text-slate-300 hover:text-cyan-400 text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Marketplace
                  </Link>
                  <Link
                    href="/comunidad"
                    className="text-slate-300 hover:text-cyan-400 text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Comunidad
                  </Link>

                  {/* Mobile Auth Links */}
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <AuthNavEnhanced />
                  </div>
                </nav>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  )
}
