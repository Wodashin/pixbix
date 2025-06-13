"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

export function EditProfileForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || "",
    username: user?.user_metadata?.username || "",
    bio: user?.user_metadata?.bio || "",
    location: user?.user_metadata?.location || "",
    website: user?.user_metadata?.website || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      // Aquí iría la lógica para actualizar el perfil
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Mostrar mensaje de éxito
        console.log("Perfil actualizado correctamente")
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!user) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6 text-center">
          <p className="text-slate-400">Debes iniciar sesión para editar tu perfil</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Editar Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-lg">{user.email?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button type="button" variant="outline" className="border-slate-600 text-slate-300">
              <Camera className="h-4 w-4 mr-2" />
              Cambiar foto
            </Button>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Nombre completo
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Nombre de usuario
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-300">
              Biografía
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              className="bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">
                Ubicación
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-300">
                Sitio web
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
          </div>

          {/* Email (solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <Input
              id="email"
              value={user.email || ""}
              disabled
              className="bg-slate-600 border-slate-500 text-slate-300"
            />
          </div>

          {/* Botón de guardar */}
          <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
