"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, AtSign, Loader2 } from "lucide-react"
import { useUserData } from "@/hooks/use-user-data"

interface CompleteProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userData: {
    email: string
    username: string
    display_name: string
    avatar_url: string
    profile_completed: boolean
  }
}

export function CompleteProfileModal({ isOpen, onClose, userData }: CompleteProfileModalProps) {
  const [realName, setRealName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { refreshUserData } = useUserData()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!realName.trim() || !session?.user?.email) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          real_name: realName.trim(),
        }),
      })

      if (response.ok) {
        // Actualizar los datos del usuario después de completar el perfil
        await refreshUserData()
        onClose()
        router.refresh()
      } else {
        console.error("Error completando perfil")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center">¡Completa tu perfil!</DialogTitle>
          <DialogDescription className="text-slate-400 text-center">
            Para finalizar tu registro, necesitamos tu nombre real
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vista previa del perfil */}
          <div className="flex items-center space-x-4 p-4 bg-slate-700 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{userData.display_name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <AtSign className="h-4 w-4 text-slate-400" />
                <span className="text-purple-400 font-medium">{userData.username}</span>
              </div>
              <p className="text-slate-300">{userData.display_name}</p>
              <p className="text-slate-400 text-sm">{userData.email}</p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realName" className="text-slate-300 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Nombre real</span>
              </Label>
              <Input
                id="realName"
                type="text"
                placeholder="Ej: Kevin Aguilera"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                required
                autoFocus
              />
              <p className="text-xs text-slate-400">Este será tu nombre público en la plataforma</p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={isSubmitting}
              >
                Más tarde
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={!realName.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Completar perfil"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
