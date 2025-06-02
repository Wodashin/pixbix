"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Gamepad2 } from "lucide-react"

interface Game {
  id: number
  name: string
  background_image?: string
  rating?: number
  platforms?: Array<{ platform: { name: string } }>
}

interface GameSelectorModalProps {
  onGameSelect: (game: string) => void
  children: React.ReactNode
}

export function GameSelectorModal({ onGameSelect, children }: GameSelectorModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [customGame, setCustomGame] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Juegos populares por defecto
  const popularGames = [
    { name: "Valorant", image: "/placeholder.svg?height=60&width=60" },
    { name: "League of Legends", image: "/placeholder.svg?height=60&width=60" },
    { name: "Fortnite", image: "/placeholder.svg?height=60&width=60" },
    { name: "Minecraft", image: "/placeholder.svg?height=60&width=60" },
    { name: "Call of Duty", image: "/placeholder.svg?height=60&width=60" },
    { name: "Apex Legends", image: "/placeholder.svg?height=60&width=60" },
    { name: "Counter-Strike 2", image: "/placeholder.svg?height=60&width=60" },
    { name: "Overwatch 2", image: "/placeholder.svg?height=60&width=60" },
  ]

  // Buscar juegos en RAWG API
  useEffect(() => {
    if (searchQuery.length < 2) {
      setGames([])
      return
    }

    const searchGames = async () => {
      setIsLoading(true)
      try {
        // Simulamos la búsqueda por ahora (puedes integrar RAWG API después)
        const mockResults: Game[] = [
          {
            id: 1,
            name: `${searchQuery} - Resultado 1`,
            background_image: "/placeholder.svg?height=60&width=60",
            rating: 4.5,
          },
          {
            id: 2,
            name: `${searchQuery} - Resultado 2`,
            background_image: "/placeholder.svg?height=60&width=60",
            rating: 4.2,
          },
        ]

        setTimeout(() => {
          setGames(mockResults)
          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error("Error searching games:", error)
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchGames, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleGameSelect = (gameName: string) => {
    onGameSelect(gameName)
    setIsOpen(false)
    setSearchQuery("")
    setCustomGame("")
    setShowCustomInput(false)
  }

  const handleCustomGameAdd = () => {
    if (customGame.trim()) {
      handleGameSelect(customGame.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Gamepad2 className="mr-2 h-6 w-6 text-cyan-400" />
            Seleccionar Juego
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar juegos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>

          {/* Contenido scrolleable */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {/* Juegos populares (solo si no hay búsqueda) */}
            {!searchQuery && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-cyan-400">🔥 Juegos Populares</h3>
                <div className="grid grid-cols-2 gap-3">
                  {popularGames.map((game, index) => (
                    <button
                      key={index}
                      onClick={() => handleGameSelect(game.name)}
                      className="flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                    >
                      <img
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium">{game.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resultados de búsqueda */}
            {searchQuery && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-cyan-400">🔍 Resultados para "{searchQuery}"</h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                    <p className="text-slate-400 mt-2">Buscando juegos...</p>
                  </div>
                ) : games.length > 0 ? (
                  <div className="space-y-2">
                    {games.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handleGameSelect(game.name)}
                        className="flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left w-full"
                      >
                        <img
                          src={game.background_image || "/placeholder.svg?height=50&width=50&query=game"}
                          alt={game.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{game.name}</h4>
                          {game.rating && (
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-sm text-slate-400">{game.rating}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No se encontraron juegos</p>
                  </div>
                )}
              </div>
            )}

            {/* Agregar juego personalizado */}
            <div className="border-t border-slate-600 pt-4">
              {!showCustomInput ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar juego manualmente
                </Button>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Nombre del juego..."
                    value={customGame}
                    onChange={(e) => setCustomGame(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    onKeyPress={(e) => e.key === "Enter" && handleCustomGameAdd()}
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCustomGameAdd}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={!customGame.trim()}
                    >
                      Agregar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCustomInput(false)
                        setCustomGame("")
                      }}
                      className="border-slate-600 text-slate-300"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
