"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, MessageCircle, Gamepad2, Video, Users, Verified } from "lucide-react"
import type { Companion } from "@/types/companions"
import Link from "next/link"

interface CompanionCardProps {
  companion: Companion
  onBook?: (companion: Companion) => void
}

export function CompanionCard({ companion, onBook }: CompanionCardProps) {
  const displayName = companion.user?.real_name || companion.user?.name || companion.user?.username || "Usuario"
  const minPrice = Math.min(...(companion.services?.map((s) => s.price_per_hour) || [companion.hourly_rate]))

  // Obtener los juegos principales (máximo 3)
  const mainGames = companion.games?.slice(0, 3) || []

  // Obtener tipos de servicios únicos
  const serviceTypes = [...new Set(companion.services?.map((s) => s.service_type) || [])]

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "gaming":
        return <Gamepad2 className="h-3 w-3" />
      case "chat":
        return <MessageCircle className="h-3 w-3" />
      case "coaching":
        return <Users className="h-3 w-3" />
      case "streaming":
        return <Video className="h-3 w-3" />
      default:
        return <Gamepad2 className="h-3 w-3" />
    }
  }

  const getServiceLabel = (type: string) => {
    switch (type) {
      case "gaming":
        return "Gaming"
      case "chat":
        return "Chat"
      case "coaching":
        return "Coaching"
      case "streaming":
        return "Stream"
      default:
        return type
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden group hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
      <CardContent className="p-0">
        {/* Header con avatar y estado */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-cyan-400">
                <AvatarImage src={companion.user?.avatar_url || "/placeholder.svg"} alt={displayName} />
                <AvatarFallback className="bg-slate-700 text-cyan-400 text-xl">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Indicador online */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800" />
              {/* Badge de verificado */}
              {companion.is_verified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Verified className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-white text-lg truncate">{displayName}</h3>
              </div>
              <p className="text-purple-400 text-sm mb-2">@{companion.user?.username}</p>

              {/* Rating y estadísticas */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-slate-300">{companion.average_rating.toFixed(1)}</span>
                  <span className="text-slate-500">({companion.total_sessions})</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>~{companion.response_time_minutes}min</span>
                </div>
              </div>
            </div>

            {/* Precio */}
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400">${minPrice}</div>
              <div className="text-xs text-slate-400">por hora</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {companion.bio && (
          <div className="px-6 pb-4">
            <p className="text-slate-400 text-sm line-clamp-2">{companion.bio}</p>
          </div>
        )}

        {/* Juegos principales */}
        {mainGames.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {mainGames.map((game, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                  {game.game_name}
                </Badge>
              ))}
              {companion.games && companion.games.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                  +{companion.games.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Servicios disponibles */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-3 text-slate-400 text-xs">
            {serviceTypes.map((type, index) => (
              <div key={index} className="flex items-center space-x-1">
                {getServiceIcon(type)}
                <span>{getServiceLabel(type)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Idiomas */}
        {companion.languages && companion.languages.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 text-xs">Idiomas:</span>
              <div className="flex space-x-1">
                {companion.languages.slice(0, 3).map((lang, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-400">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reseñas recientes */}
        {companion.reviews && companion.reviews.length > 0 && (
          <div className="px-6 pb-4">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-slate-400">Reseña reciente:</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">"{companion.reviews[0].comment}"</p>
              <p className="text-xs text-slate-500 mt-1">- {companion.reviews[0].reviewer?.username}</p>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="p-6 pt-0 space-y-2">
          <Button onClick={() => onBook?.(companion)} className="w-full bg-cyan-600 hover:bg-cyan-700">
            Contratar Ahora
          </Button>
          <Link href={`/compañeros/${companion.id}`}>
            <Button
              variant="outline"
              className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
            >
              Ver Perfil Completo
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
