"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, Save, ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export function EditProfileForm() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  // Campos del formulario
  const [formData, setFormData] = useState({
    real_name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
  })

  useEffect(() => {
    async function fetchUserData() {
      if (status === "loading") return

      if (!session?.user?.email) {
        setLoading(false)
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const supabase = createClient()
        const { data, error: supabaseError } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single()

        if (supabaseError) {
          console.error("Error al obtener datos:", supabaseError)
          setError(supabaseError.message)
        } else {
          setUserData(data)
          setFormData({
            real_name: data.real_name || "",
            username: data.username || "",
            bio: data.bio || "",
            location: data.location || "",
            website: data.website || "",
          })
        }
      } catch (err) {
        console.error("Error general:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [session?.user?.email, status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("users")
        .update({
          real_name: formData.real_name,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          updated_at: new Date().toISOString(),
        })
        .eq("email", session?.user?.email)

      if (error) {
        console.error("Error al actualizar:", error)
        setError(error.message)
      } else {
        setSuccess("Perfil actualizado correctamente")
        setTimeout(() => {
          router.push("/perfil")
        }, 2000)
      }
    } catch (err) {
      console.error("Error general:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Cargando datos del perfil...</span>
      </div>
    )
  }

  if (!userData) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Usuario no encontrado</h1>
          <p className="text-slate-400 mb-4">No se encontró información para tu perfil</p>
          <Button onClick={() => router.push("/")} className="bg-purple-600 hover:bg-purple-700">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Editar tu perfil</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-center space-x-2 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-6">
            <span className="text-green-400 text-sm">{success}</span>
          </div>
        )}

        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userData.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-slate-700 text-cyan-400">
              {userData.real_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-slate-300">{userData.email}</p>
            <Badge className="mt-1 bg-purple-600">Gamer</Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="real_name" className="text-slate-300">
              Nombre real
            </Label>
            <Input
              id="real_name"
              name="real_name"
              value={formData.real_name}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-slate-100"
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Nombre de usuario
            </Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-slate-100"
              placeholder="tu_nombre_usuario"
            />
            <p className="text-xs text-slate-400">Este nombre será visible para todos los usuarios</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-300">
              Biografía
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-slate-100 min-h-[100px]"
              placeholder="Cuéntanos sobre ti..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-300">
              Ubicación
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-slate-100"
              placeholder="Ciudad, País"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-slate-300">
              Sitio web
            </Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-slate-100"
              placeholder="https://tusitio.com"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/perfil")}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={saving}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
