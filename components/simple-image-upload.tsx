"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2, X, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"

interface SimpleImageUploadProps {
  onUpload: (url: string) => void
  className?: string
}

export function SimpleImageUpload({ onUpload, className }: SimpleImageUploadProps) {
  const { data: session, status } = useSession()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Verificar autenticación
  if (status === "loading") {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Verificando sesión...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!session?.user?.email) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-red-600">
            <p>Debes iniciar sesión para subir imágenes</p>
            <Button className="mt-2" onClick={() => (window.location.href = "/login")}>
              Iniciar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)
    setUploading(true)

    try {
      // Preview local
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)

      // Subir archivo con header personalizado
      const formData = new FormData()
      formData.append("file", file)

      console.log("📤 Uploading file:", file.name)
      console.log("👤 Current session:", session.user.email)

      const response = await fetch("/api/upload/simple", {
        method: "POST",
        body: formData,
        headers: {
          "x-user-email": session.user.email, // Enviar email en header personalizado
        },
        credentials: "include",
      })

      console.log("📡 Response status:", response.status)

      const result = await response.json()
      console.log("📋 Response data:", result)

      if (result.success) {
        onUpload(result.url)
        setSuccess(result.message || "¡Imagen subida exitosamente!")
      } else {
        throw new Error(result.error || "Error al subir imagen")
      }
    } catch (err) {
      console.error("💥 Upload error:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    setError(null)
    setSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

        {!preview ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Haz clic para subir imagen</p>
            <p className="text-sm text-gray-400">JPG, PNG, WebP (máx. 10MB)</p>
            <p className="text-xs text-green-600 mt-1">✅ Sesión activa: {session.user.email}</p>
          </div>
        ) : (
          <div className="relative">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={clearPreview}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {uploading && (
          <div className="mt-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Subiendo imagen...</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {error && <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      </CardContent>
    </Card>
  )
}
