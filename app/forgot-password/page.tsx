"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gamepad2, Mail, ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async (formData: FormData) => {
    setIsLoading(true)
    // Aquí iría la lógica de recuperación de contraseña
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulación
    setEmailSent(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Gamepad2 className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Recuperar Contraseña</h1>
            <p className="text-slate-400">Te enviaremos un enlace para restablecer tu contraseña</p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-center">
                {emailSent ? "Email Enviado" : "Restablecer Contraseña"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {emailSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-slate-300">
                    Hemos enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada y sigue las
                    instrucciones.
                  </p>
                  <p className="text-sm text-slate-400">
                    ¿No recibiste el email? Revisa tu carpeta de spam o intenta de nuevo en unos minutos.
                  </p>
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Enviar de nuevo
                  </Button>
                </div>
              ) : (
                <form action={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                  </Button>
                </form>
              )}

              <div className="text-center">
                <Link href="/login" className="inline-flex items-center text-purple-400 hover:text-purple-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
