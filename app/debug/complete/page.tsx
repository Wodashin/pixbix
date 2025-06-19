"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Shield, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"
import { createClient } from "@/utils/supabase/client"

export default function CompleteDebugPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()

  const testDatabaseSetup = async () => {
    setLoading("database")
    try {
      const supabase = createClient()

      // Verificar que la tabla users existe
      const { data: tableData, error: tableError } = await supabase.from("users").select("count").limit(1)

      // Verificar que el trigger existe
      const { data: triggerData, error: triggerError } = await supabase
        .rpc("check_trigger_exists", { trigger_name: "on_auth_user_created" })
        .single()

      setResults((prev) => ({
        ...prev,
        database: {
          tableExists: !tableError,
          triggerExists: !triggerError,
          tableError: tableError?.message,
          triggerError: triggerError?.message,
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        database: {
          error: error instanceof Error ? error.message : "Error desconocido",
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const testAuthConfig = async () => {
    setLoading("auth")
    try {
      const supabase = createClient()

      // Verificar sesión actual
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      // Verificar configuración de providers
      const response = await fetch("/api/debug/auth-providers")
      const providersData = await response.json()

      setResults((prev) => ({
        ...prev,
        auth: {
          hasSession: !!sessionData.session,
          sessionError: sessionError?.message,
          user: sessionData.session?.user,
          providers: providersData,
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        auth: {
          error: error instanceof Error ? error.message : "Error desconocido",
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const testOAuthFlow = async (provider: "google" | "discord") => {
    setLoading(provider)
    try {
      const supabase = createClient()

      console.log(`Iniciando test de ${provider} OAuth...`)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/debug/complete`,
        },
      })

      if (error) {
        setResults((prev) => ({
          ...prev,
          [provider]: {
            success: false,
            error: error.message,
          },
        }))
      } else {
        console.log(`${provider} OAuth iniciado correctamente`)
        // El navegador debería redirigir, así que no llegamos aquí normalmente
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [provider]: {
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const StatusIcon = ({ status }: { status: boolean | undefined }) => {
    if (status === undefined) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Diagnóstico Completo del Sistema</h1>
        <p className="text-slate-400">Verifica que todo esté configurado correctamente</p>
      </div>

      {/* Estado del Usuario Actual */}
      {user && (
        <Card className="bg-green-900/20 border-green-800">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Usuario Autenticado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-white">Email: {user.email}</p>
              <p className="text-slate-300">ID: {user.id}</p>
              <p className="text-slate-300">Proveedor: {user.app_metadata?.provider || "email"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test de Base de Datos */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-cyan-400" />
              <span>Configuración de Base de Datos</span>
            </div>
            <Button
              onClick={testDatabaseSetup}
              disabled={loading === "database"}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {loading === "database" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verificar"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.database && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Tabla users:</span>
                <Badge variant={results.database.tableExists ? "default" : "destructive"}>
                  {results.database.tableExists ? "✓ Existe" : "✗ No existe"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Trigger automático:</span>
                <Badge variant={results.database.triggerExists ? "default" : "destructive"}>
                  {results.database.triggerExists ? "✓ Configurado" : "✗ Falta"}
                </Badge>
              </div>
              {(results.database.tableError || results.database.triggerError) && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                  {results.database.tableError || results.database.triggerError}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test de Autenticación */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-400" />
              <span>Sistema de Autenticación</span>
            </div>
            <Button
              onClick={testAuthConfig}
              disabled={loading === "auth"}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading === "auth" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verificar"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.auth && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Sesión activa:</span>
                <Badge variant={results.auth.hasSession ? "default" : "secondary"}>
                  {results.auth.hasSession ? "Sí" : "No"}
                </Badge>
              </div>
              {results.auth.error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">Error: {results.auth.error}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tests de OAuth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google OAuth */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-2">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <span>Google OAuth</span>
              </div>
              <Button
                onClick={() => testOAuthFlow("google")}
                disabled={loading === "google"}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading === "google" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Probar"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.google && (
              <div className="space-y-2">
                <Badge variant={results.google.success ? "default" : "destructive"}>
                  {results.google.success ? "✓ Funcionando" : "✗ Error"}
                </Badge>
                {results.google.error && (
                  <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{results.google.error}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discord OAuth */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-2">
                  <svg viewBox="0 0 127.14 96.36" className="w-full h-full" fill="#5865F2">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                  </svg>
                </div>
                <span>Discord OAuth</span>
              </div>
              <Button
                onClick={() => testOAuthFlow("discord")}
                disabled={loading === "discord"}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading === "discord" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Probar"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.discord && (
              <div className="space-y-2">
                <Badge variant={results.discord.success ? "default" : "destructive"}>
                  {results.discord.success ? "✓ Funcionando" : "✗ Error"}
                </Badge>
                {results.discord.error && (
                  <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{results.discord.error}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información de Configuración */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="h-5 w-5 mr-2 text-yellow-400" />
            URLs de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-slate-300 text-sm mb-2">URL de callback para Supabase:</p>
            <code className="bg-slate-700 px-2 py-1 rounded text-cyan-400 text-sm">
              {typeof window !== "undefined" ? window.location.origin : ""}/auth/callback
            </code>
          </div>
          <div>
            <p className="text-slate-300 text-sm mb-2">Site URL para Supabase:</p>
            <code className="bg-slate-700 px-2 py-1 rounded text-cyan-400 text-sm">
              {typeof window !== "undefined" ? window.location.origin : ""}
            </code>
          </div>
        </CardContent>
      </Card>

      {!user && (
        <div className="text-center">
          <p className="text-slate-400 mb-4">
            Una vez que todo esté configurado correctamente, prueba el login desde la página principal.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <a href="/login">Ir a Login</a>
          </Button>
        </div>
      )}
    </div>
  )
}
