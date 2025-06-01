"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

export function SimpleUserProfile() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      if (status === "loading") return

      if (!session?.user?.email) {
        setLoading(false)
        setError("No hay sesión activa")
        return
      }

      try {
        console.log("Obteniendo datos del usuario:", session.user.email)
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
          console.log("Datos obtenidos:", data)
          setUserData(data)
        }
      } catch (err) {
        console.error("Error general:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [session, status])

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Cargando...</span>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acceso no autorizado</h1>
          <p className="text-slate-400 mb-4">Debes iniciar sesión para ver tu perfil</p>
          <Button onClick={() => (window.location.href = "/login")} className="bg-purple-600 hover:bg-purple-700">
            Iniciar sesión
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!userData) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Usuario no encontrado</h1>
          <p className="text-slate-400 mb-4">No se encontró información para tu perfil</p>
          <Button onClick={() => (window.location.href = "/")} className="bg-purple-600 hover:bg-purple-700">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={userData.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{userData.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>

          <h1 className="text-2xl font-bold text-white mb-2">{userData.real_name || userData.name}</h1>
          <p className="text-purple-400 mb-1">@{userData.username}</p>
          <p className="text-slate-400 mb-4">{userData.email}</p>

          {userData.bio && <p className="text-slate-300 mb-4 max-w-md">{userData.bio}</p>}

          <pre className="bg-slate-900 p-4 rounded-md text-xs text-slate-300 mt-4 overflow-auto max-w-full">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
