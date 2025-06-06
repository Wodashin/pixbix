"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface SimpleImageUploadProps {
  onUpload: (url: string) => void
  currentImage?: string
}

export function SimpleImageUpload({ onUpload, currentImage }: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(currentImage || "")
  const [error, setError] = useState<string>("")

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB")
      return
    }

    setError("")
    setUploading(true)

    try {
      console.log("🖼️ Subiendo imagen:", file.name, "Tamaño:", file.size)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/simple", {
        method: "POST",
        body: formData,
      })

      console.log("📡 Respuesta del servidor:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al subir imagen")
      }

      const data = await response.json()
      console.log("✅ Imagen subida exitosamente:", data.url)

      setImageUrl(data.url)
      onUpload(data.url)
    } catch (error) {
      console.error("❌ Error subiendo imagen:", error)
      setError(error instanceof Error ? error.message : "Error al subir imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setImageUrl("")
    onUpload("")
    setError("")
  }

  return (
    <div className="space-y-4">
      {/* Vista previa de la imagen */}
      {imageUrl && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image src={imageUrl || "/placeholder.svg"} alt="Vista previa" fill className="object-cover" unoptimized />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Botón de subida */}
      {!imageUrl && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
              <div className="text-sm text-gray-600">
                {uploading ? "Subiendo imagen..." : "Haz clic para subir una imagen"}
              </div>
              <div className="text-xs text-gray-400">PNG, JPG, GIF hasta 5MB</div>
            </div>
          </label>
        </div>
      )}

      {/* Mensaje de error */}
      {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

      {/* Información de debug */}
      {process.env.NODE_ENV === "development" && imageUrl && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>URL generada:</strong> {imageUrl}
        </div>
      )}
    </div>
  )
}
