"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Search, Trophy, Star, Target, Award, Plus, Sparkles } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: "gaming" | "social" | "milestone" | "special" | "custom"
  rarity: "common" | "rare" | "epic" | "legendary"
  isCustom?: boolean
}

const achievements: Achievement[] = [
  {
    id: "first-post",
    name: "Primera Publicación",
    description: "Creaste tu primer post",
    icon: "✍️",
    category: "milestone",
    rarity: "common",
  },
  {
    id: "ace",
    name: "ACE",
    description: "Conseguiste un ACE en una partida",
    icon: "🎯",
    category: "gaming",
    rarity: "epic",
  },
  {
    id: "clutch-master",
    name: "Clutch Master",
    description: "Ganaste una ronda 1v5",
    icon: "⚡",
    category: "gaming",
    rarity: "legendary",
  },
  {
    id: "team-player",
    name: "Team Player",
    description: "Jugaste 100 partidas en equipo",
    icon: "🤝",
    category: "social",
    rarity: "rare",
  },
  {
    id: "headshot-king",
    name: "Headshot King",
    description: "Conseguiste 1000 headshots",
    icon: "🎯",
    category: "gaming",
    rarity: "epic",
  },
  {
    id: "mvp",
    name: "MVP",
    description: "Fuiste MVP de la partida",
    icon: "👑",
    category: "gaming",
    rarity: "rare",
  },
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Tienes 50+ seguidores",
    icon: "🦋",
    category: "social",
    rarity: "rare",
  },
  {
    id: "content-creator",
    name: "Content Creator",
    description: "Creaste 100+ posts",
    icon: "📝",
    category: "milestone",
    rarity: "epic",
  },
]

const categoryColors = {
  gaming: "bg-blue-600",
  social: "bg-green-600",
  milestone: "bg-purple-600",
  special: "bg-orange-600",
  custom: "bg-pink-600",
}

const rarityColors = {
  common: "border-gray-500",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-yellow-500",
}

interface AchievementSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (achievement: Achievement) => void
}

export function AchievementSelectorModal({ isOpen, onClose, onSelect }: AchievementSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [customAchievements, setCustomAchievements] = useState<Achievement[]>([])

  // Form para crear logro personalizado
  const [customName, setCustomName] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customIcon, setCustomIcon] = useState("🏆")
  const [customRarity, setCustomRarity] = useState<"common" | "rare" | "epic" | "legendary">("common")

  const allAchievements = [...achievements, ...customAchievements]

  const filteredAchievements = allAchievements.filter((achievement) => {
    const matchesSearch =
      achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || achievement.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelect = (achievement: Achievement) => {
    onSelect(achievement)
    onClose()
  }

  const handleCreateCustom = () => {
    if (!customName.trim() || !customDescription.trim()) return

    const newAchievement: Achievement = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      description: customDescription.trim(),
      icon: customIcon,
      category: "custom",
      rarity: customRarity,
      isCustom: true,
    }

    setCustomAchievements([...customAchievements, newAchievement])

    // Limpiar form
    setCustomName("")
    setCustomDescription("")
    setCustomIcon("🏆")
    setCustomRarity("common")
    setShowCreateForm(false)

    // Seleccionar automáticamente el logro creado
    handleSelect(newAchievement)
  }

  const commonIcons = ["🏆", "🎯", "⚡", "🔥", "💎", "⭐", "🚀", "💪", "🎮", "👑", "🌟", "🎊"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Seleccionar o Crear Logro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showCreateForm ? (
            <>
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar logros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
                />
              </div>

              {/* Filtros por categoría */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs"
                >
                  Todos
                </Button>
                <Button
                  variant={selectedCategory === "gaming" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("gaming")}
                  className="text-xs"
                >
                  <Target className="h-3 w-3 mr-1" />
                  Gaming
                </Button>
                <Button
                  variant={selectedCategory === "social" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("social")}
                  className="text-xs"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Social
                </Button>
                <Button
                  variant={selectedCategory === "milestone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("milestone")}
                  className="text-xs"
                >
                  <Award className="h-3 w-3 mr-1" />
                  Hitos
                </Button>
                <Button
                  variant={selectedCategory === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("custom")}
                  className="text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Personalizados
                </Button>
              </div>

              {/* Botón crear logro personalizado */}
              <div className="flex justify-center">
                <Button onClick={() => setShowCreateForm(true)} className="bg-pink-600 hover:bg-pink-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Logro Personalizado
                </Button>
              </div>

              {/* Grid de logros */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    onClick={() => handleSelect(achievement)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 bg-slate-800 hover:bg-slate-700 ${rarityColors[achievement.rarity]} ${achievement.isCustom ? "ring-2 ring-pink-500" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-slate-100 truncate">{achievement.name}</h3>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${categoryColors[achievement.category]} text-white`}
                          >
                            {achievement.isCustom ? "Personalizado" : achievement.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{achievement.description}</p>
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${rarityColors[achievement.rarity]} border-current`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Formulario crear logro personalizado */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Crear Logro Personalizado</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Volver
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Logro</label>
                    <Input
                      placeholder="Ej: Maestro del Clutch"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
                    <Textarea
                      placeholder="Describe tu logro..."
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-slate-100 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Rareza</label>
                    <div className="flex gap-2">
                      {(["common", "rare", "epic", "legendary"] as const).map((rarity) => (
                        <Button
                          key={rarity}
                          variant={customRarity === rarity ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCustomRarity(rarity)}
                          className="text-xs"
                        >
                          {rarity}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Icono</label>
                    <Input
                      placeholder="🏆"
                      value={customIcon}
                      onChange={(e) => setCustomIcon(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-slate-100 text-center text-2xl"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Iconos Populares</label>
                    <div className="grid grid-cols-6 gap-2">
                      {commonIcons.map((icon) => (
                        <Button
                          key={icon}
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomIcon(icon)}
                          className="text-xl p-2 h-10 w-10"
                        >
                          {icon}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="border border-slate-600 rounded-lg p-3 bg-slate-800">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Vista Previa</h4>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{customIcon}</div>
                      <div>
                        <h5 className="font-semibold text-white text-sm">{customName || "Nombre del logro"}</h5>
                        <p className="text-xs text-slate-400">{customDescription || "Descripción del logro"}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {customRarity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCustom}
                  disabled={!customName.trim() || !customDescription.trim()}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Crear Logro
                </Button>
              </div>
            </div>
          )}

          {!showCreateForm && filteredAchievements.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron logros</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
