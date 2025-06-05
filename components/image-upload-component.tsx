"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadComponentProps {
  onImageUpload: (imageUrl: string) => void
  onImageRemove: () => void
  currentImage?: string
}

export function ImageUploadComponent({ onImageUpload, onImageRemove, currentImage }: ImageUploadComponentProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      const response = await fetch("/api/upload/simple", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        onImageUpload(url)
      } else {
        const errorData = await response.json()
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
    <div className="space-y-2">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive ? "border-purple-500 bg-purple-500/10" : "border-slate-600 hover:border-slate-500"}
          ${isUploading ? "pointer-events-none opacity-50" : ""}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="text-sm text-slate-400">Subiendo imagen...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-slate-400" />
              <Upload className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Haz clic o arrastra una imagen aquí</p>
              <p className="text-xs text-slate-500">PNG, JPG, GIF hasta 5MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
