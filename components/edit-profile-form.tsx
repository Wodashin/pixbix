"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"
import { toast } from "sonner"

export function EditProfileForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
  })

  // CORREGIDO: cargar los datos del perfil desde la API (no desde user_metadata)
  useEffect(() => {
    if (!user) return
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const data = await res.json()
          setFormData({
            display_name: data.user?.display_name || "",
            username: data.user?.username || "",
            bio: data.user?.bio || "",
            location: data.user?.location || "",
            website: data.user?.website || "",
          })
        }
      } catch (e) {
        console.error("Error cargando perfil:", e)
      } finally {
        setIsFetching(false)
      }
    }
    loadProfile()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("¡Perfil actualizado correctamente!")
      } else {
        const data = await response.json()
        toast.error(data.error || "No se pudo actualizar el perfil.")
      }
    } catch (error) {
      toast.error("Error de conexión al guardar.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-slate-300">Nombre para mostrar</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange("display_name", e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                disabled={isFetching}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Nombre de usuario <span className="text-xs text-slate-500">(máx. 2 cambios)</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                disabled={isFetching}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-300">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              className="bg-slate-700 border-slate-600 text-slate-100"
              disabled={isFetching}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                disabled={isFetching}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-300">Sitio web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                disabled={isFetching}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input
              id="email"
              value={user.email || ""}
              disabled
              className="bg-slate-600 border-slate-500 text-slate-300"
            />
          </div>

          <Button type="submit" disabled={isLoading || isFetching} className="w-full bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
