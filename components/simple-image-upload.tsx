"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2, X } from "lucide-react"

interface SimpleImageUploadProps {
  onUpload: (url: string) => void
  className?: string
}

export function SimpleImageUpload({ onUpload, className }: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      // Preview local
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)

      // Subir archivo
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/simple", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onUpload(result.url)
      } else {
        throw new Error(result.error || "Error al subir imagen")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    setError(null)
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

        {error && <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      </CardContent>
    </Card>
  )
}
