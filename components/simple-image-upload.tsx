"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"

interface SimpleImageUploadProps {
  onUpload: (imageUrl: string) => void
  currentImage?: string
}

export function SimpleImageUpload({ onUpload, currentImage }: SimpleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(currentImage || null)
  const [dragActive, setDragActive] = useState(false)
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: session } = useSession()

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen no puede superar 10MB")
      return
    }

    setIsUploading(true)
    setImageError(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("📤 Uploading image to R2...")

      const response = await fetch("/api/upload/simple", {
        method: "POST",
        headers: {
          "x-user-email": session?.user?.email || "",
        },
        body: formData,
      })

      const result = await response.json()
      console.log("📥 Upload response:", result)

      if (result.success && result.url) {
        console.log("✅ Image uploaded successfully:", result.url)
        setUploadedImageUrl(result.url)
        onUpload(result.url) // Llamar la función del padre
      } else {
        console.error("❌ Upload failed:", result.error)
        alert("Error al subir imagen: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("💥 Upload error:", error)
      alert("Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleRemoveImage = () => {
    setUploadedImageUrl(null)
    setImageError(false)
    onUpload("") // Notificar al padre que se removió la imagen
    // Limpiar el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 🖼️ MOSTRAR IMAGEN SUBIDA
  if ((uploadedImageUrl || currentImage) && !imageError) {
    const imageUrl = uploadedImageUrl || currentImage
    return (
      <div className="relative w-full">
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-700 border border-slate-600">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt="Imagen subida"
            fill
            className="object-cover"
            onError={() => {
              console.error("❌ Error loading image:", imageUrl)
              setImageError(true)
            }}
            onLoad={() => {
              console.log("✅ Image loaded successfully:", imageUrl)
            }}
            unoptimized // Importante para URLs externas de R2
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-1 truncate">{imageUrl}</p>
      </div>
    )
  }

  // 🔄 MOSTRAR ESTADO DE CARGA
  if (isUploading) {
    return (
      <div className="w-full h-48 rounded-lg border-2 border-dashed border-slate-600 flex flex-col items-center justify-center bg-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-2" />
        <p className="text-sm text-slate-300">Subiendo a Cloudflare R2...</p>
        <p className="text-xs text-slate-400">Por favor espera...</p>
      </div>
    )
  }

  // 📁 MOSTRAR ÁREA DE SUBIDA
  return (
    <div className="w-full">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      <div
        className={`w-full h-48 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
          dragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-slate-600 hover:border-slate-500 bg-slate-800 hover:bg-slate-700"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          <div className="p-3 rounded-full bg-slate-700">
            <ImageIcon className="h-8 w-8 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">Haz clic o arrastra una imagen aquí</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF hasta 10MB</p>
          </div>
        </div>
      </div>

      {/* Overlay de drag & drop */}
      {dragActive && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-800 border-2 border-dashed border-purple-500 rounded-lg p-12 text-center">
            <Upload className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <p className="text-xl font-medium text-white">Suelta la imagen aquí</p>
          </div>
        </div>
      )}
    </div>
  )
}
