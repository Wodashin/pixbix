"use client"

import { signOut } from "next-auth/react"
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
import { Badge } from "@/components/ui/badge"
import { User, LogIn, UserPlus, Settings, LogOut, Calendar, Crown } from "lucide-react"
import { useUserData } from "@/hooks/use-user-data"
import { useRouter } from "next/navigation"

export function AuthNavEnhanced() {
  const { userData, loading, isAuthenticated } = useUserData()
  const router = useRouter()

  if (loading) {
    return <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
  }

  if (isAuthenticated && userData) {
    // Calcular días desde registro
    const daysSinceJoined = Math.floor(
      (new Date().getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24),
    )

    // Usar real_name si existe, sino display_name, sino name
    const displayName = userData.real_name || userData.display_name || userData.name

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-cyan-500">
              <AvatarImage src={userData.avatar_url || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="bg-slate-700 text-cyan-400">{displayName?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            {/* Indicador de usuario online */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-950" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 bg-slate-800 border-slate-700" align="end" forceMount>
          {/* Header del usuario */}
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-t-lg">
            <Avatar className="h-16 w-16 border-2 border-cyan-400">
              <AvatarImage src={userData.avatar_url || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="bg-slate-700 text-cyan-400 text-xl">
                {displayName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-lg">{displayName}</h3>
                <Badge className="bg-purple-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Gamer
                </Badge>
              </div>
              <p className="text-sm text-purple-400">@{userData.username}</p>
              <p className="text-sm text-slate-400 truncate">{userData.email}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {daysSinceJoined === 0 ? "Nuevo hoy" : `${daysSinceJoined} días en Nobux`}
                </span>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-750">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">0</div>
              <div className="text-xs text-slate-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">0</div>
              <div className="text-xs text-slate-400">Amigos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">1</div>
              <div className="text-xs text-slate-400">Nivel</div>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-slate-700" />

          {/* Opciones del menú */}
          <DropdownMenuItem
            className="text-slate-300 hover:bg-slate-700 cursor-pointer"
            onClick={() => router.push("/perfil")}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-slate-300 hover:bg-slate-700 cursor-pointer"
            onClick={() => router.push("/configuracion")}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-700" />

          <DropdownMenuItem
            className="text-red-400 hover:bg-slate-700 cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

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
