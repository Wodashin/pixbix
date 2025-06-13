"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Check } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

interface ImageUploadProps {
  onUpload?: (url: string) => void
  maxSizeMB?: number
  allowedTypes?: string[]
  className?: string
}

export function ImageUploadComponent({
  onUpload,
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  className,
}: ImageUploadProps) {
  const { user } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length) {
      handleFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Reset states
    setError(null)
    setSuccess(false)

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(", ")}`)
      return
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload file
    setIsUploading(true)
    try {
      if (!user) {
        throw new Error("Debes iniciar sesión para subir imágenes")
      }

      // Aquí iría la lógica para subir la imagen a tu servidor o servicio de almacenamiento
      // Por ejemplo, usando Supabase Storage
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = await response.json()
      setSuccess(true)

      // Call onUpload callback with the URL
      if (onUpload && data.url) {
        onUpload(data.url)
      }
    } catch (err) {
      console.error("Error al subir imagen:", err)
      setError(err instanceof Error ? err.message : "Error al subir la imagen")
      // Clean up preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card
      className={`bg-slate-800 border-slate-700 ${className || ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-4">
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-auto rounded-md" />
            <div className="absolute top-2 right-2 flex space-x-2">
              {success && (
                <div className="bg-green-600 p-1 rounded-full">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}
              <button onClick={handleCancelPreview} className="bg-slate-800/80 hover:bg-slate-700 p-1 rounded-full">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md ${
              isDragging ? "border-purple-500 bg-purple-500/10" : "border-slate-600"
            } transition-colors`}
          >
            <Upload className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-slate-300 text-center mb-2">
              Arrastra y suelta una imagen aquí, o haz clic para seleccionar
            </p>
            <p className="text-slate-500 text-sm text-center">
              Formatos permitidos: {allowedTypes.map((type) => type.split("/")[1]).join(", ")}. Tamaño máximo:{" "}
              {maxSizeMB}
              MB
            </p>
            <Button
              onClick={handleButtonClick}
              disabled={isUploading}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              {isUploading ? "Subiendo..." : "Seleccionar archivo"}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={allowedTypes.join(",")}
              className="hidden"
            />
          </div>
        )}

        {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        {success && <p className="mt-2 text-green-400 text-sm">¡Imagen subida correctamente!</p>}
      </CardContent>
    </Card>
  )
}
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Check } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

interface ImageUploadProps {
  onUpload?: (url: string) => void
  maxSizeMB?: number
  allowedTypes?: string[]
  className?: string
}

export function ImageUploadComponent({
  onUpload,
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  className,
}: ImageUploadProps) {
  const { user } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length) {
      handleFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Reset states
    setError(null)
    setSuccess(false)

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(", ")}`)
      return
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload file
    setIsUploading(true)
    try {
      if (!user) {
        throw new Error("Debes iniciar sesión para subir imágenes")
      }

      // Aquí iría la lógica para subir la imagen a tu servidor o servicio de almacenamiento
      // Por ejemplo, usando Supabase Storage
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = await response.json()
      setSuccess(true)

      // Call onUpload callback with the URL
      if (onUpload && data.url) {
        onUpload(data.url)
      }
    } catch (err) {
      console.error("Error al subir imagen:", err)
      setError(err instanceof Error ? err.message : "Error al subir la imagen")
      // Clean up preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card
      className={`bg-slate-800 border-slate-700 ${className || ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-4">
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-auto rounded-md" />
            <div className="absolute top-2 right-2 flex space-x-2">
              {success && (
                <div className="bg-green-600 p-1 rounded-full">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}
              <button onClick={handleCancelPreview} className="bg-slate-800/80 hover:bg-slate-700 p-1 rounded-full">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md ${
              isDragging ? "border-purple-500 bg-purple-500/10" : "border-slate-600"
            } transition-colors`}
          >
            <Upload className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-slate-300 text-center mb-2">
              Arrastra y suelta una imagen aquí, o haz clic para seleccionar
            </p>
            <p className="text-slate-500 text-sm text-center">
              Formatos permitidos: {allowedTypes.map((type) => type.split("/")[1]).join(", ")}. Tamaño máximo:{" "}
              {maxSizeMB}
              MB
            </p>
            <Button
              onClick={handleButtonClick}
              disabled={isUploading}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              {isUploading ? "Subiendo..." : "Seleccionar archivo"}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={allowedTypes.join(",")}
              className="hidden"
            />
          </div>
        )}

        {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        {success && <p className="mt-2 text-green-400 text-sm">¡Imagen subida correctamente!</p>}
      </CardContent>
    </Card>
  )
}
