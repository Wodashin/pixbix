"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

export default function DiscordOAuthUrlPage() {
  const [oauthUrl, setOauthUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const testDiscordOAuth = async () => {
    setLoading(true)
    try {
      // Intentar iniciar el proceso de OAuth para ver la URL generada
      console.log("Iniciando proceso de OAuth con Discord...")
      await signIn("discord")
    } catch (error: any) {
      console.error("Error en OAuth:", error)
      // Capturar la URL que se está generando
      if (error.message && error.message.includes("redirect")) {
        setOauthUrl(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Diagnóstico URL de Discord OAuth</h1>
        <p className="text-slate-400">Vamos a verificar qué URL se está generando</p>
      </div>

      {/* Problema identificado */}
      <Alert className="border-red-500 bg-red-900/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-red-300">
          <strong>Problema detectado:</strong> El redirect_to en la URL de Discord sigue apuntando a pixbae-gaming.com
          en lugar de la URL de Supabase.
        </AlertDescription>
      </Alert>

      {/* Información del problema */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Análisis del Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="bg-red-900/20 border border-red-700 p-4 rounded">
              <h3 className="text-red-300 font-semibold mb-2">URL problemática detectada:</h3>
              <code className="text-red-200 text-sm break-all">redirect_to=https%3A%2F%2Fwww.pixbae-gaming.com...</code>
            </div>

            <div className="bg-green-900/20 border border-green-700 p-4 rounded">
              <h3 className="text-green-300 font-semibold mb-2">URL correcta debería ser:</h3>
              <code className="text-green-200 text-sm break-all">
                redirect_to=https%3A%2F%2Fztmqoitwefclamzmizms.supabase.co%2Fauth%2Fv1%2Fcallback
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test de OAuth */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Probar Generación de URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDiscordOAuth} disabled={loading} className="w-full">
            {loading ? "Probando..." : "Probar OAuth con Discord"}
          </Button>

          {oauthUrl && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold">URL generada:</h3>
              <div className="bg-slate-700 p-3 rounded">
                <code className="text-cyan-400 text-sm break-all">{oauthUrl}</code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posibles soluciones */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Posibles Soluciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-blue-300 font-semibold">1. Verificar configuración de Supabase</h3>
              <p className="text-slate-300 text-sm">
                El problema podría estar en la configuración de Site URL en Supabase
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-yellow-300 font-semibold">2. Verificar variables de entorno</h3>
              <p className="text-slate-300 text-sm">Asegurar que NEXT_PUBLIC_SITE_URL esté configurada correctamente</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-green-300 font-semibold">3. Forzar URL de callback</h3>
              <p className="text-slate-300 text-sm">Especificar manualmente la URL de callback en el código</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enlaces útiles */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Enlaces Útiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-slate-600 text-slate-300"
            onClick={() =>
              window.open("https://supabase.com/dashboard/project/ztmqoitwefclamzmizms/auth/settings", "_blank")
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Configuración de Auth en Supabase
          </Button>

          <Button
            variant="outline"
            className="w-full border-slate-600 text-slate-300"
            onClick={() => window.open("/debug/complete", "_blank")}
          >
            Ver Diagnóstico Completo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
