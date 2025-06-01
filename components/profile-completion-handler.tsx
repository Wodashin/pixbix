"use client"

import { useEffect, useState } from "react"
import { useUserData } from "@/hooks/use-user-data"
import { CompleteProfileModal } from "./complete-profile-modal"

export function ProfileCompletionHandler() {
  const { userData, needsProfileCompletion, isAuthenticated } = useUserData()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated && needsProfileCompletion && userData) {
      // Mostrar modal después de 2 segundos para mejor UX
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, needsProfileCompletion, userData])

  if (!userData || !needsProfileCompletion) return null

  return <CompleteProfileModal isOpen={showModal} onClose={() => setShowModal(false)} userData={userData} />
}
