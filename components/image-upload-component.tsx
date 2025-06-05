"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"

interface ImageUploadComponentProps {
  onImageUpload: (imageUrl: string) => void
  onImageRemove: () => void
  currentImage?: string
}

export function ImageUploadComponent({ onImageUpload, onImageRemove, currentImage }: ImageUploadComponentProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: session } = useSession()

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar 5MB")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Importante: Enviar el email del usuario en el header
      const headers: Record<string, string> = {}
      if (session?.user?.email) {
        headers["x-user-email"] = session.user.email
      }

      const response = await fetch("/api/upload/simple", {
        method: "POST",
        headers,
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        onImageUpload(url)
      } else {
        const errorData = await response.json()
        console.error("Error uploading:", errorData)
        alert("Error al subir imagen: " + (errorData.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error uploading image:", error)
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

  if (currentImage) {
    return (
      <div className="relative">
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-800">
          <Image src={currentImage || "/placeholder.svg"} alt="Imagen subida" fill className="object-cover" />
          <Button
            variant="destructive"
            size="sm"
            onClick={onImageRemove}
            className="absolute top-2 right-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      <Button
        variant="outline"
        size="sm"
        className="border-slate-600 text-slate-300 flex items-center"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <ImageIcon className="mr-2 h-4 w-4" />
            Imagen
          </>
        )}
      </Button>

      {dragActive && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <div className="bg-slate-800 border-2 border-dashed border-purple-500 rounded-lg p-12 text-center">
            <Upload className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <p className="text-xl font-medium text-white">Suelta la imagen aquí</p>
          </div>
        </div>
      )}
    </div>
  )
}
