"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"
import type { UserProfile } from "@/hooks/use-profile"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  onUpdate: (updates: Partial<UserProfile>) => Promise<boolean>
}

export function EditProfileModal({ isOpen, onClose, profile, onUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    real_name: profile.real_name || "",
    bio: profile.bio || "",
    location: profile.location || "",
    website: profile.website || "",
    favorite_games: profile.favorite_games || [],
    gaming_platforms: profile.gaming_platforms || [],
  })
  const [newGame, setNewGame] = useState("")
  const [newPlatform, setNewPlatform] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const success = await onUpdate(formData)

    if (success) {
      onClose()
    }

    setIsSubmitting(false)
  }

  const addGame = () => {
    if (newGame.trim() && !formData.favorite_games.includes(newGame.trim())) {
      setFormData((prev) => ({
        ...prev,
        favorite_games: [...prev.favorite_games, newGame.trim()],
      }))
      setNewGame("")
    }
  }

  const removeGame = (gameToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      favorite_games: prev.favorite_games.filter((game) => game !== gameToRemove),
    }))
  }

  const addPlatform = () => {
    if (newPlatform.trim() && !formData.gaming_platforms.includes(newPlatform.trim())) {
      setFormData((prev) => ({
        ...prev,
        gaming_platforms: [...prev.gaming_platforms, newPlatform.trim()],
      }))
      setNewPlatform("")
    }
  }

  const removePlatform = (platformToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      gaming_platforms: prev.gaming_platforms.filter((platform) => platform !== platformToRemove),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Perfil</DialogTitle>
          <DialogDescription className="text-slate-400">
            Actualiza tu información personal y preferencias gaming
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vista previa del avatar */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{profile.real_name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">@{profile.username}</h3>
              <p className="text-slate-400 text-sm">{profile.email}</p>
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="real_name" className="text-slate-300">
                Nombre Real
              </Label>
              <Input
                id="real_name"
                value={formData.real_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, real_name: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-slate-100"
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">
                Ubicación
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-slate-100"
                placeholder="Ciudad, País"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-slate-300">
              Sitio Web
            </Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-slate-100"
              placeholder="https://tu-sitio.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-300">
              Biografía
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-slate-100 min-h-[100px]"
              placeholder="Cuéntanos sobre ti y tu pasión por los videojuegos..."
              maxLength={500}
            />
            <p className="text-xs text-slate-400">{formData.bio.length}/500 caracteres</p>
          </div>

          {/* Juegos favoritos */}
          <div className="space-y-3">
            <Label className="text-slate-300">Juegos Favoritos</Label>
            <div className="flex space-x-2">
              <Input
                value={newGame}
                onChange={(e) => setNewGame(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addGame())}
                className="bg-slate-700 border-slate-600 text-slate-100"
                placeholder="Agregar juego favorito"
              />
              <Button type="button" onClick={addGame} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.favorite_games.map((game, index) => (
                <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300">
                  {game}
                  <button type="button" onClick={() => removeGame(game)} className="ml-2 hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Plataformas gaming */}
          <div className="space-y-3">
            <Label className="text-slate-300">Plataformas Gaming</Label>
            <div className="flex space-x-2">
              <Input
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPlatform())}
                className="bg-slate-700 border-slate-600 text-slate-100"
                placeholder="PC, PlayStation, Xbox, etc."
              />
              <Button type="button" onClick={addPlatform} size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.gaming_platforms.map((platform, index) => (
                <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300">
                  {platform}
                  <button type="button" onClick={() => removePlatform(platform)} className="ml-2 hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
