"use client"

import { useEffect, useState } from "react"
import { useUserData } from "@/hooks/use-user-data"
import { CompleteProfileModal } from "./complete-profile-modal"

export function ProfileCompletionHandler() {
  const { userData, needsProfileCompletion, isAuthenticated, loading } = useUserData()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Solo mostrar el modal cuando tengamos los datos y sepamos que necesita completar el perfil
    if (isAuthenticated && !loading && needsProfileCompletion && userData) {
      // Verificar si ya mostramos el modal en esta sesión del navegador
      const profileModalShown = localStorage.getItem("profile_modal_shown")

      if (!profileModalShown) {
        // Mostrar modal después de 2 segundos para mejor UX
        const timer = setTimeout(() => {
          setShowModal(true)
          // Marcar como mostrado para esta sesión
          localStorage.setItem("profile_modal_shown", "true")
        }, 2000)

        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated, needsProfileCompletion, userData, loading])

  // No renderizar nada si no hay datos o no necesita completar el perfil
  if (!userData || !needsProfileCompletion || loading) return null

  return <CompleteProfileModal isOpen={showModal} onClose={() => setShowModal(false)} userData={userData} />
}
