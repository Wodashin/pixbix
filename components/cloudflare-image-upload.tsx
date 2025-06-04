"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Loader2, Upload } from "lucide-react"

interface CloudflareImageUploadProps {
  onUpload: (urls: any) => void
  maxSize?: number // en MB
  acceptedTypes?: string[]
  preview?: boolean
  variant?: "avatar" | "post" | "banner"
}

export function CloudflareImageUpload({
  onUpload,
  maxSize = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  preview = true,
  variant = "post",
}: CloudflareImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getVariantConfig = () => {
    switch (variant) {
      case "avatar":
        return { width: 400, height: 400, title: "Foto de perfil" }
      case "banner":
        return { width: 1920, height: 1080, title: "Banner" }
      default:
        return { width: 1200, height: 800, title: "Imagen" }
    }
  }

  const config = getVariantConfig()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      // Validaciones
      if (!acceptedTypes.includes(file.type)) {
        throw new Error("Formato de imagen no válido")
      }

      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`La imagen no puede superar ${maxSize}MB`)
      }

      // Preview local
      if (preview) {
        const reader = new FileReader()
        reader.onload = (e) => setPreviewUrl(e.target?.result as string)
        reader.readAsDataURL(file)
      }

      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Subir a Cloudflare
      const result = await uploadToCloudflare(file, variant)

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        onUpload(result.urls)
        setTimeout(() => setProgress(0), 1000)
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen")
      setPreviewUrl(null)
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const clearPreview = () => {
    setPreviewUrl(null)
    setError(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        {!previewUrl ? (
          <div
            className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-slate-300 font-medium mb-2">Subir {config.title}</h3>
              <p className="text-slate-500 text-sm mb-2">
                Recomendado: {config.width}x{config.height}px
              </p>
              <p className="text-slate-500 text-xs">
                Máximo {maxSize}MB • JPG, PNG, WebP{variant === "post" ? ", GIF" : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className={`w-full object-cover rounded-lg ${
                variant === "avatar" ? "h-48" : variant === "banner" ? "h-32" : "h-48"
              }`}
            />
            <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={clearPreview}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-center mb-2">
              <Loader2 className="h-5 w-5 animate-spin text-purple-400 mr-2" />
              <span className="text-slate-300">Subiendo a Cloudflare...</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-slate-400 text-sm mt-1">{progress}%</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Función para subir a Cloudflare
async function uploadToCloudflare(file: File, variant: string) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("variant", variant)

  const response = await fetch("/api/upload/cloudflare", {
    method: "POST",
    body: formData,
  })

  return await response.json()
}
