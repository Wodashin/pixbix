"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, MapPin, Crown, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export function SimpleUserProfile() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Usar useCallback para evitar recrear la función en cada render
  // Modificar el useEffect para evitar recargas innecesarias

  useEffect(() => {
    // Usar una referencia para evitar múltiples solicitudes
    const fetchedRef = { current: false }

    async function fetchUserData() {
      if (status === "loading") return

      if (!session?.user?.email || fetchedRef.current) {
        setLoading(false)
        return
      }

      try {
        console.log("Obteniendo datos del usuario:", session.user.email)
        setLoading(true)
        fetchedRef.current = true

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

    // Solo ejecutar una vez cuando cambie la sesión
    if (status !== "loading") {
      fetchUserData()
    }
  }, [session?.user?.email, status]) // Dependencias más específicas para evitar loops

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Cargando perfil...</span>
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

  // Formatear fecha de manera segura
  let memberSince = "hace poco"
  try {
    if (userData.created_at) {
      memberSince = formatDistanceToNow(new Date(userData.created_at), {
        addSuffix: true,
        locale: es,
      })
    }
  } catch (e) {
    console.error("Error formateando fecha:", e)
  }

  const displayName = userData.real_name || userData.display_name || userData.name || "Usuario"

  return (
    <div className="space-y-6">
      {/* Header del perfil */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar y info básica */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 border-4 border-cyan-400 mb-4">
                <AvatarImage src={userData.avatar_url || "/placeholder.svg"} alt={displayName} />
                <AvatarFallback className="bg-slate-700 text-cyan-400 text-4xl">
                  {displayName[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <Badge className="bg-purple-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Gamer
              </Badge>
            </div>

            {/* Información del usuario */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{displayName}</h1>
              <p className="text-xl text-purple-400 mb-1">@{userData.username || "usuario"}</p>

              <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4 text-slate-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Miembro {memberSince}</span>
                </div>
                {userData.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userData.location}</span>
                  </div>
                )}
              </div>

              {userData.bio && <p className="text-slate-300 mb-4 max-w-md">{userData.bio}</p>}
            </div>

            {/* Botón de editar */}
            <div className="flex flex-col space-y-2">
              <Link href="/editar-perfil">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
              </Link>
              <Link href="/configuracion">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Configuración
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">0</div>
            <div className="text-sm text-slate-400">Posts</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">0</div>
            <div className="text-sm text-slate-400">Likes</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">0</div>
            <div className="text-sm text-slate-400">Seguidores</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">1</div>
            <div className="text-sm text-slate-400">Nivel</div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Información del Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Estado del perfil:</span>
              <Badge variant={userData.profile_completed ? "default" : "secondary"}>
                {userData.profile_completed ? "Completo" : "Incompleto"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cuenta creada:</span>
              <span className="text-slate-300">{new Date(userData.created_at).toLocaleDateString("es-ES")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Última actualización:</span>
              <span className="text-slate-300">{new Date(userData.updated_at).toLocaleDateString("es-ES")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-center py-8">No hay actividad reciente</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
