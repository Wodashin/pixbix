"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { CompanionCard } from "./companion-card"
import { useCompanions } from "@/hooks/use-companions"
import { Search, Filter, Star, DollarSign, Clock, Users, Loader2 } from "lucide-react"
import type { Companion } from "@/types/companions"

const popularGames = [
  "Valorant",
  "League of Legends",
  "CS:GO",
  "Fortnite",
  "Apex Legends",
  "Overwatch 2",
  "Rocket League",
  "Minecraft",
  "Genshin Impact",
  "Call of Duty",
]

const languages = ["Español", "Inglés", "Portugués", "Francés", "Alemán", "Italiano", "Japonés", "Coreano"]

export function CompanionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGame, setSelectedGame] = useState("all")
  const [selectedService, setSelectedService] = useState("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([5, 100])
  const [minRating, setMinRating] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [sortBy, setSortBy] = useState<"rating" | "price" | "sessions" | "recent">("rating")
  const [showFilters, setShowFilters] = useState(false)

  const { companions, loading, error, totalCount } = useCompanions({
    gameFilter: selectedGame === "all" ? undefined : selectedGame,
    serviceFilter: selectedService === "all" ? undefined : selectedService,
    priceRange: priceRange,
    ratingFilter: minRating,
    languageFilter: selectedLanguage === "all" ? undefined : selectedLanguage,
    sortBy: sortBy,
  })

  const handleBookCompanion = (companion: Companion) => {
    // TODO: Implementar modal de reserva
    console.log("Reservar compañero:", companion)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedGame("all")
    setSelectedService("all")
    setPriceRange([5, 100])
    setMinRating(0)
    setSelectedLanguage("all")
    setSortBy("rating")
  }

  // Filtrar por término de búsqueda localmente
  const filteredCompanions = companions.filter((companion) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      companion.user?.name?.toLowerCase().includes(searchLower) ||
      companion.user?.username?.toLowerCase().includes(searchLower) ||
      companion.bio?.toLowerCase().includes(searchLower) ||
      companion.games?.some((game) => game.game_name.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Encuentra tu Compañero Gaming Perfecto</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Conecta con gamers expertos, mejora tus habilidades y disfruta de sesiones gaming personalizadas
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
            <div className="text-2xl font-bold text-white">{totalCount}</div>
            <div className="text-sm text-slate-400">Compañeros</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold text-white">4.8</div>
            <div className="text-sm text-slate-400">Rating Promedio</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-sm text-slate-400">Disponibilidad</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">$5-100</div>
            <div className="text-sm text-slate-400">Por Hora</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de filtros */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700 sticky top-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filtros
                </span>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-white">
                  Limpiar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Búsqueda */}
              <div className="space-y-2">
                <Label className="text-slate-300">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Nombre, juego, habilidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
              </div>

              {/* Juego */}
              <div className="space-y-2">
                <Label className="text-slate-300">Juego</Label>
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Todos los juegos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">Todos los juegos</SelectItem>
                    {popularGames.map((game) => (
                      <SelectItem key={game} value={game}>
                        {game}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de servicio */}
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de Servicio</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Todos los servicios" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">Todos los servicios</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="coaching">Coaching</SelectItem>
                    <SelectItem value="streaming">Streaming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rango de precio */}
              <div className="space-y-2">
                <Label className="text-slate-300">
                  Precio por hora: ${priceRange[0]} - ${priceRange[1]}
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  max={100}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Rating mínimo */}
              <div className="space-y-2">
                <Label className="text-slate-300">Rating mínimo</Label>
                <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="0">Cualquier rating</SelectItem>
                    <SelectItem value="3">3+ estrellas</SelectItem>
                    <SelectItem value="4">4+ estrellas</SelectItem>
                    <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Idioma */}
              <div className="space-y-2">
                <Label className="text-slate-300">Idioma</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Todos los idiomas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">Todos los idiomas</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de compañeros */}
        <div className="lg:col-span-3">
          {/* Header con ordenamiento */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{filteredCompanions.length} Compañeros Disponibles</h2>
              <p className="text-slate-400">Encuentra el compañero perfecto para tu próxima sesión gaming</p>
            </div>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="price">Precio más bajo</SelectItem>
                <SelectItem value="sessions">Más experiencia</SelectItem>
                <SelectItem value="recent">Más recientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros activos */}
          {(selectedGame !== "all" || selectedService !== "all" || selectedLanguage !== "all" || minRating > 0) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedGame !== "all" && (
                <Badge variant="secondary" className="bg-slate-700">
                  Juego: {selectedGame}
                  <button onClick={() => setSelectedGame("all")} className="ml-2 hover:text-red-400">
                    ×
                  </button>
                </Badge>
              )}
              {selectedService !== "all" && (
                <Badge variant="secondary" className="bg-slate-700">
                  Servicio: {selectedService}
                  <button onClick={() => setSelectedService("all")} className="ml-2 hover:text-red-400">
                    ×
                  </button>
                </Badge>
              )}
              {selectedLanguage !== "all" && (
                <Badge variant="secondary" className="bg-slate-700">
                  Idioma: {selectedLanguage}
                  <button onClick={() => setSelectedLanguage("all")} className="ml-2 hover:text-red-400">
                    ×
                  </button>
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="bg-slate-700">
                  Rating: {minRating}+ ⭐
                  <button onClick={() => setMinRating(0)} className="ml-2 hover:text-red-400">
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Grid de compañeros */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              <span className="ml-2 text-white">Cargando compañeros...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-2">Error al cargar</h3>
              <p className="text-slate-400">{error}</p>
            </div>
          ) : filteredCompanions.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-2">No se encontraron compañeros</h3>
              <p className="text-slate-400 mb-4">Intenta ajustar tus filtros para encontrar más opciones</p>
              <Button onClick={clearFilters} className="bg-purple-600 hover:bg-purple-700">
                Limpiar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCompanions.map((companion) => (
                <CompanionCard key={companion.id} companion={companion} onBook={handleBookCompanion} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
