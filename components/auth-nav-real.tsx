"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

export function AuthNavReal() {
  const { user, loading, signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-slate-400">
        Cargando...
      </Button>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400">
            <LogIn className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Iniciar Sesión</span>
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Registrarse</span>
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || ""} />
            <AvatarFallback>{user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-white">{user.user_metadata?.name || user.email}</p>
            <p className="w-[200px] truncate text-sm text-slate-400">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-slate-700" />
        <Link href="/perfil">
          <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
            <User className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          className="text-red-400 hover:bg-slate-700 cursor-pointer"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
