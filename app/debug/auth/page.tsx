"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"
import { createClient } from "@/utils/supabase/client"

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Verificar sesión actual
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      // Verificar configuración de auth
      const authConfig = {
        hasSession: !!sessionData.session,
        sessionError: sessionError?.message,
        user: sessionData.session?.user
          ? {
              id: sessionData.session.user.id,
              email: sessionData.session.user.email,
              provider: sessionData.session.user.app_metadata?.provider,
            }
          : null,
      }

      // Verificar conexión a la base de datos
      const { data: dbTest, error: dbError } = await supabase.from("users").select("count").limit(1)

      setDebugInfo({
        auth: authConfig,
        database: {
          connected: !dbError,
          error: dbError?.message,
        },
        environment: {
          origin: window.location.origin,
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error al obtener información de debug:", error)
      setDebugInfo({
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  const testGoogleAuth = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Error en test de Google Auth:", error)
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      alert(`Error inesperado: ${error}`)
    }
  }

  const testDiscordAuth = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Error en test de Discord Auth:", error)
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      alert(`Error inesperado: ${error}`)
    }
  }

  const StatusIcon = ({ status }: { status: boolean | undefined }) => {
    if (status === undefined) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Debug de Autenticación</h1>
        <Button onClick={fetchDebugInfo} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Configuración del Entorno */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Configuración del Entorno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Supabase URL configurada:</span>
            <Badge variant={debugInfo.environment?.hasSupabaseUrl ? "default" : "destructive"}>
              {debugInfo.environment?.hasSupabaseUrl ? "✓" : "✗"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Supabase Key configurada:</span>
            <Badge variant={debugInfo.environment?.hasSupabaseKey ? "default" : "destructive"}>
              {debugInfo.environment?.hasSupabaseKey ? "✓" : "✗"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Origin actual:</span>
            <span className="text-white text-sm">{debugInfo.environment?.origin}</span>
          </div>
        </CardContent>
      </Card>

      {/* Base de Datos */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <StatusIcon status={debugInfo.database?.connected} />
            <span className="ml-2">Base de Datos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Conexión:</span>
            <Badge variant={debugInfo.database?.connected ? "default" : "destructive"}>
              {debugInfo.database?.connected ? "Conectada" : "Error"}
            </Badge>
          </div>
          {debugInfo.database?.error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">Error: {debugInfo.database.error}</div>
          )}
        </CardContent>
      </Card>

      {/* Estado de Autenticación */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <StatusIcon status={debugInfo.auth?.hasSession} />
            <span className="ml-2">Estado de Autenticación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Sesión activa:</span>
            <Badge variant={debugInfo.auth?.hasSession ? "default" : "secondary"}>
              {debugInfo.auth?.hasSession ? "Sí" : "No"}
            </Badge>
          </div>
          {debugInfo.auth?.sessionError && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">Error: {debugInfo.auth.sessionError}</div>
          )}
          {debugInfo.auth?.user && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Email:</span>
                <span className="text-white">{debugInfo.auth.user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Proveedor:</span>
                <span className="text-white">{debugInfo.auth.user.provider || "email"}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usuario del Context */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <StatusIcon status={!!user} />
            <span className="ml-2">Usuario del Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {authLoading ? (
            <div className="text-slate-400">Cargando...</div>
          ) : user ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Email:</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">ID:</span>
                <span className="text-white font-mono text-sm">{user.id}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400">No hay usuario autenticado</div>
          )}
        </CardContent>
      </Card>

      {/* Tests de OAuth */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Tests de OAuth</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex space-x-4">
            <Button onClick={testGoogleAuth} className="bg-blue-600 hover:bg-blue-700">
              Test Google OAuth
            </Button>
            <Button onClick={testDiscordAuth} className="bg-indigo-600 hover:bg-indigo-700">
              Test Discord OAuth
            </Button>
          </div>
          <p className="text-slate-400 text-sm">Estos botones probarán la configuración de OAuth directamente</p>
        </CardContent>
      </Card>

      {debugInfo.timestamp && (
        <div className="text-center text-slate-500 text-sm">
          Última actualización: {new Date(debugInfo.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  )
}
