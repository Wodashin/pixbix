"use client"

import { useState } from "react"
import { SimpleImageUpload } from "@/components/simple-image-upload"

export default function TestUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleUpload = (url: string) => {
    setUploadedImages((prev) => [...prev, url])
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Prueba de Subida de Imágenes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Subir Nueva Imagen</h2>
          <SimpleImageUpload onUpload={handleUpload} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Imágenes Subidas</h2>
          <div className="space-y-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="border rounded-lg p-4">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-sm text-gray-600 break-all">{url}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
