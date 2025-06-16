"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gamepad2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider-supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const { signIn, signInWithEmail } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar si hay errores en la URL
  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      switch (error) {
        case "auth_error":
          setErrorMessage("Error en la autenticación. Inténtalo de nuevo.")
          break
        case "unexpected_error":
          setErrorMessage("Error inesperado. Por favor, inténtalo más tarde.")
          break
        case "no_code":
          setErrorMessage("Error en el proceso de autenticación.")
          break
        default:
          setErrorMessage("Error desconocido.")
      }
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      await signIn("google")
    } catch (error: any) {
      console.error("Error en login con Google:", error)
      setErrorMessage(error.message || "Error al iniciar sesión con Google")
      setIsLoading(false)
    }
  }

  const handleDiscordLogin = async () => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      await signIn("discord")
    } catch (error: any) {
      console.error("Error en login con Discord:", error)
      setErrorMessage(error.message || "Error al iniciar sesión con Discord")
      setIsLoading(false)
    }
  }

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)

    try {
      const { error } = await signInWithEmail(email, password)

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials" ? "Email o contraseña incorrectos" : error.message,
        )
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setErrorMessage("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Gamepad2 className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Bienvenido de vuelta</h1>
            <p className="text-slate-400">Inicia sesión en tu cuenta de Nobux Gaming</p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-center">Iniciar Sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Message */}
              {errorMessage && (
                <Alert className="border-red-800 bg-red-900/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <div className="w-5 h-5 mr-2">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path
                          fill="#4285F4"
                          d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                        />
                        <path
                          fill="#34A853"
                          d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                        />
                      </g>
                    </svg>
                  </div>
                  {isLoading ? "Conectando..." : "Continuar con Google"}
                </Button>

                <Button
                  onClick={handleDiscordLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <div className="w-5 h-5 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="#5865F2">
                      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                    </svg>
                  </div>
                  {isLoading ? "Conectando..." : "Continuar con Discord"}
                </Button>
              </div>

              <Separator className="bg-slate-600" />

              {/* Manual Login */}
              <form onSubmit={handleManualLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-slate-700 border-slate-600 text-slate-100"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              <div className="text-center">
                <span className="text-slate-400">¿No tienes cuenta? </span>
                <Link href="/register" className="text-purple-400 hover:text-purple-300">
                  Regístrate aquí
                </Link>
              </div>

              {/* Debug Info */}
              <div className="text-center">
                <Link href="/debug" className="text-xs text-slate-500 hover:text-slate-400">
                  Ver información de debug
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
