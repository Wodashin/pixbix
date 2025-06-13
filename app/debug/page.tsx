"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

interface DebugInfo {
  database?: {
    connected: boolean
    error?: string
    usersTableExists: boolean
  }
  auth?: {
    configured: boolean
    error?: string
    hasSession: boolean
  }
  timestamp?: string
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/supabase-test")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Error al obtener información de debug:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  const StatusIcon = ({ status }: { status: boolean | undefined }) => {
    if (status === undefined) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Panel de Depuración</h1>
        <Button onClick={fetchDebugInfo} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Estado de la Base de Datos */}
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
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Tabla users:</span>
            <Badge variant={debugInfo.database?.usersTableExists ? "default" : "destructive"}>
              {debugInfo.database?.usersTableExists ? "Existe" : "No existe"}
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
            <StatusIcon status={debugInfo.auth?.configured} />
            <span className="ml-2">Autenticación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Configuración:</span>
            <Badge variant={debugInfo.auth?.configured ? "default" : "destructive"}>
              {debugInfo.auth?.configured ? "OK" : "Error"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Sesión activa:</span>
            <Badge variant={debugInfo.auth?.hasSession ? "default" : "secondary"}>
              {debugInfo.auth?.hasSession ? "Sí" : "No"}
            </Badge>
          </div>
          {debugInfo.auth?.error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">Error: {debugInfo.auth.error}</div>
          )}
        </CardContent>
      </Card>

      {/* Usuario Actual */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <StatusIcon status={!!user} />
            <span className="ml-2">Usuario Actual</span>
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
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Proveedor:</span>
                <span className="text-white">{user.app_metadata?.provider || "email"}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400">No hay usuario autenticado</div>
          )}
        </CardContent>
      </Card>

      {/* Variables de Entorno */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Variables de Entorno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">SUPABASE_URL:</span>
            <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurada" : "Faltante"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">SUPABASE_ANON_KEY:</span>
            <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "default" : "destructive"}>
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurada" : "Faltante"}
            </Badge>
          </div>
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
