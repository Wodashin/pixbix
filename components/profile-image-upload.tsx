"use client"

import { useState } from "react"
import { SimpleImageUpload } from "@/components/simple-image-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileImageUploadProps {
  currentAvatar?: string
  userName: string
  onUpdate: (newAvatarUrl: string) => void
}

export function ProfileImageUpload({ currentAvatar, userName, onUpdate }: ProfileImageUploadProps) {
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>("")
  const [updating, setUpdating] = useState(false)

  const handleSaveAvatar = async () => {
    if (!newAvatarUrl) return

    setUpdating(true)
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: newAvatarUrl }),
      })

      if (response.ok) {
        onUpdate(newAvatarUrl)
        setNewAvatarUrl("")
      }
    } catch (error) {
      console.error("Error updating avatar:", error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Foto de Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentAvatar || "/placeholder.svg"} />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{userName}</p>
            <p className="text-sm text-gray-500">Avatar actual</p>
          </div>
        </div>

        <SimpleImageUpload onUpload={setNewAvatarUrl} />

        {newAvatarUrl && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={newAvatarUrl || "/placeholder.svg"} />
                <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Vista previa</p>
                <p className="text-sm text-gray-500">Nuevo avatar</p>
              </div>
            </div>
            <Button onClick={handleSaveAvatar} disabled={updating} className="w-full">
              {updating ? "Guardando..." : "Guardar Avatar"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
