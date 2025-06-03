"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Gamepad2 } from "lucide-react"

interface GameSelectorModalProps {
  onGameSelect: (game: string) => void
  children: React.ReactNode
}

const popularGames = [
  "Valorant",
  "League of Legends",
  "Counter-Strike 2",
  "Fortnite",
  "Apex Legends",
  "Call of Duty",
  "Overwatch 2",
  "Rocket League",
  "FIFA 24",
  "Minecraft",
  "Among Us",
  "Fall Guys",
  "Genshin Impact",
  "World of Warcraft",
  "Destiny 2",
  "Rainbow Six Siege",
  "Dota 2",
  "PUBG",
  "Grand Theft Auto V",
  "Red Dead Redemption 2",
  "Cyberpunk 2077",
  "The Witcher 3",
  "Elden Ring",
  "God of War",
  "Spider-Man",
  "Horizon Zero Dawn",
  "Assassin's Creed",
  "Far Cry 6",
  "Battlefield 2042",
  "Halo Infinite",
]

export function GameSelectorModal({ onGameSelect, children }: GameSelectorModalProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredGames = popularGames.filter((game) => game.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleGameSelect = (game: string) => {
    onGameSelect(game)
    setOpen(false)
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 text-white max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <Gamepad2 className="mr-2 h-5 w-5 text-cyan-400" />
            Seleccionar Juego
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar juego..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Lista de juegos */}
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            <div className="grid grid-cols-2 gap-2">
              {filteredGames.map((game) => (
                <Button
                  key={game}
                  variant="outline"
                  className="justify-start h-auto p-3 border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white transition-colors"
                  onClick={() => handleGameSelect(game)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded flex items-center justify-center text-xs font-bold">
                      {game.charAt(0)}
                    </div>
                    <span className="text-sm">{game}</span>
                  </div>
                </Button>
              ))}
            </div>

            {filteredGames.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Gamepad2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No se encontraron juegos</p>
                <p className="text-sm">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </div>

          {/* Opción personalizada */}
          <div className="border-t border-slate-700 pt-4">
            <Button
              variant="outline"
              className="w-full border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white"
              onClick={() => {
                const customGame = prompt("Escribe el nombre del juego:")
                if (customGame && customGame.trim()) {
                  handleGameSelect(customGame.trim())
                }
              }}
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              Otro juego...
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
