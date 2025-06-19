"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, XCircle, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react"

export default function DiscordCompletePage() {
  const [envVars, setEnvVars] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkEnvironmentVars = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/discord-env")
      const data = await response.json()
      setEnvVars(data)
    } catch (error) {
      console.error("Error checking environment variables:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkEnvironmentVars()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Diagnóstico Completo de Discord OAuth</h1>
        <p className="text-slate-400">Vamos a solucionar el problema paso a paso</p>
      </div>

      {/* Problema identificado */}
      <Alert className="border-red-500 bg-red-900/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-red-300">
          <strong>Problema identificado:</strong> El error persiste porque hay problemas en la configuración de Discord.
          Vamos a solucionarlo paso a paso.
        </AlertDescription>
      </Alert>

      {/* Estado actual de variables de entorno */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Variables de Entorno Actuales
            <Button variant="outline" size="sm" onClick={checkEnvironmentVars} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {envVars ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                <span className="text-slate-300">DISCORD_CLIENT_ID:</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={envVars.clientId ? "default" : "destructive"}>
                    {envVars.clientId ? "✅ Configurado" : "❌ Faltante"}
                  </Badge>
                  {envVars.clientId && <code className="text-cyan-400 text-sm">{envVars.clientId}</code>}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                <span className="text-slate-300">DISCORD_CLIENT_SECRET:</span>
                <Badge variant={envVars.clientSecret ? "default" : "destructive"}>
                  {envVars.clientSecret ? "✅ Configurado" : "❌ Faltante"}
                </Badge>
              </div>

              {!envVars.clientSecret && (
                <Alert className="border-yellow-500 bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-300">
                    <strong>Client Secret faltante:</strong> Necesitas resetear el Client Secret en Discord y copiarlo.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <p className="text-slate-400">Cargando...</p>
          )}
        </CardContent>
      </Card>

      {/* Pasos para solucionar */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Pasos para Solucionar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Paso 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-white">Configurar Discord Developer Portal</h3>
            </div>

            <div className="ml-10 space-y-3">
              <Alert className="border-orange-500 bg-orange-900/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-orange-300">
                  <strong>Problema detectado:</strong> Tienes "Public Client" activado. Para OAuth con Supabase, debe
                  estar <strong>DESACTIVADO</strong>.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-slate-300 font-medium">En Discord Developer Portal:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1 ml-4">
                  <li>Ve a tu aplicación → OAuth2 → General</li>
                  <li>
                    <strong className="text-red-400">DESACTIVA "Public Client"</strong>
                  </li>
                  <li>Haz clic en "Reset Secret" para generar un nuevo Client Secret</li>
                  <li>Copia el nuevo Client Secret inmediatamente</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="border-slate-600 text-slate-300"
                onClick={() => window.open("https://discord.com/developers/applications", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Discord Developer Portal
              </Button>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-white">Verificar Redirect URIs</h3>
            </div>

            <div className="ml-10 space-y-3">
              <p className="text-slate-300">Asegúrate de tener SOLO esta URL en Redirects:</p>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-700 px-3 py-2 rounded text-cyan-400 flex-1">
                  https://ztmqoitwefclamzmizms.supabase.co/auth/v1/callback
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard("https://ztmqoitwefclamzmizms.supabase.co/auth/v1/callback")}
                  className="border-slate-600"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Alert className="border-blue-500 bg-blue-900/20">
                <AlertDescription className="text-blue-300">
                  <strong>Importante:</strong> Elimina las otras URLs que tienes configuradas. Solo debe haber una.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-white">Actualizar Variables en Vercel</h3>
            </div>

            <div className="ml-10 space-y-3">
              <div className="space-y-3">
                <div className="bg-slate-700 p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">DISCORD_CLIENT_ID</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard("1377872051016175727")}
                      className="border-slate-600"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="text-cyan-400">1377872051016175727</code>
                </div>

                <div className="bg-slate-700 p-3 rounded">
                  <span className="text-slate-300 font-medium">DISCORD_CLIENT_SECRET</span>
                  <p className="text-slate-400 text-sm mt-1">
                    Copia el nuevo Client Secret que obtuviste al resetearlo
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="border-slate-600 text-slate-300"
                onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Vercel Dashboard
              </Button>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-white">Redeploy y Probar</h3>
            </div>

            <div className="ml-10 space-y-3">
              <p className="text-slate-300">Después de actualizar las variables:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 ml-4">
                <li>Redeploya la aplicación en Vercel</li>
                <li>Espera a que termine el deployment</li>
                <li>Prueba el login con Discord</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen del problema */}
      <Card className="bg-red-900/20 border-red-700">
        <CardHeader>
          <CardTitle className="text-red-300 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            Resumen del Problema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-red-200">
            <p>
              <strong>Problema principal:</strong> "Public Client" está activado en Discord
            </p>
            <p>
              <strong>Problema secundario:</strong> Client Secret probablemente no está configurado
            </p>
            <p>
              <strong>Problema adicional:</strong> Múltiples Redirect URIs configuradas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test después de configuración */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Probar después de la configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">Una vez que hayas completado todos los pasos anteriores:</p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-purple-600 hover:bg-purple-700 w-full"
          >
            Probar Login con Discord
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
