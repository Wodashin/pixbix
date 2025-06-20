"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-white text-xl">¡Oops! Algo salió mal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-slate-300">
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y está trabajando para solucionarlo.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-900/20 border border-red-800 p-3 rounded text-left">
              <p className="text-red-300 text-sm font-mono">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="bg-purple-600 hover:bg-purple-700 flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
