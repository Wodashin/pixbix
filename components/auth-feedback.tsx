"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, UserCheck } from "lucide-react"

export function AuthFeedback() {
  const { data: session, status } = useSession()
  const [showWelcome, setShowWelcome] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Verificar si ya mostramos la notificación en esta sesión del navegador
      const welcomeShown = localStorage.getItem("welcome_shown")

      if (!welcomeShown) {
        // Verificar si es un usuario nuevo basado en la fecha de creación
        const isNew = session.user.isNewUser
        setIsNewUser(isNew || false)
        setShowWelcome(true)

        // Marcar como mostrado para esta sesión
        localStorage.setItem("welcome_shown", "true")

        // Ocultar el mensaje después de 5 segundos
        const timer = setTimeout(() => {
          setShowWelcome(false)
        }, 5000)

        return () => clearTimeout(timer)
      }
    }
  }, [session, status])

  if (!showWelcome || !session?.user) return null

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md">
      <Card className="bg-slate-800 border-slate-700 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {isNewUser ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <UserCheck className="h-6 w-6 text-blue-500" />
            )}
            <div>
              <h3 className="font-semibold text-white">
                {isNewUser ? "¡Bienvenido a PixBae!" : "¡Bienvenido de vuelta!"}
              </h3>
              <p className="text-sm text-slate-400">
                {isNewUser
                  ? `Cuenta creada exitosamente con ${session.user.provider}`
                  : `Sesión iniciada con ${session.user.provider}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
