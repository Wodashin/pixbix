"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploadComponent } from "@/components/image-upload-component"
import { Plus, ImageIcon, Trash2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface GalleryImage {
  id: string
  image_url: string
  title: string
  description: string
  uploaded_at: string
  is_public: boolean
  file_size: number
  file_type: string
}

interface UserGalleryProps {
  userId?: string
  isOwnProfile?: boolean
}

export function UserGallery({ userId, isOwnProfile = false }: UserGalleryProps) {
  const { user } = useAuth()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [imageTitle, setImageTitle] = useState("")
  const [imageDescription, setImageDescription] = useState("")

  useEffect(() => {
    fetchGalleryImages()
  }, [userId, user])

  const fetchGalleryImages = async () => {
    try {
      const targetUserId = userId || user?.id
      if (!targetUserId) return

      const response = await fetch(`/api/user/gallery?userId=${targetUserId}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Error al cargar galería:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/user/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          title: imageTitle || "Sin título",
          description: imageDescription || "",
          is_public: false, // Save as draft initially
        }),
      })

      if (response.ok) {
        setImageTitle("")
        setImageDescription("")
        setUploadDialogOpen(false)
        fetchGalleryImages()
        toast({
          title: "¡Imagen subida!",
          description: "La imagen se guardó como borrador. Puedes publicarla cuando quieras.",
        })
      }
    } catch (error) {
      console.error("Error al guardar imagen:", error)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/user/gallery/${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages(images.filter((img) => img.id !== imageId))
      }
    } catch (error) {
      console.error("Error al eliminar imagen:", error)
    }
  }

  const toggleImageVisibility = async (imageId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/user/gallery/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: !isPublic }),
      })

      if (response.ok) {
        setImages(images.map((img) => (img.id === imageId ? { ...img, is_public: !isPublic } : img)))
      }
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400">Cargando galería...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center">
          <ImageIcon className="mr-2 h-5 w-5 text-cyan-400" />
          Galería
        </CardTitle>
        {isOwnProfile && (
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="mr-2 h-4 w-4" />
                Subir Imagen
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Subir Nueva Imagen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título de la imagen"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Textarea
                  placeholder="Descripción (opcional)"
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <ImageUploadComponent
                  onUpload={handleImageUpload}
                  maxSizeMB={10}
                  allowedTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div
                  className="aspect-square bg-slate-700 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                {isOwnProfile && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleImageVisibility(image.id, image.is_public)}
                        className={`${
                          image.is_public ? "bg-green-600/80 border-green-500" : "bg-yellow-600/80 border-yellow-500"
                        } text-white h-8 w-8 p-0`}
                      >
                        {image.is_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteImage(image.id)}
                        className="bg-red-600/80 border-red-500 text-white h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-white truncate flex-1">{image.title}</p>
                  {isOwnProfile && (
                    <Badge
                      variant="outline"
                      className={`ml-2 text-xs ${
                        image.is_public
                          ? "bg-green-600/20 text-green-400 border-green-500"
                          : "bg-yellow-600/20 text-yellow-400 border-yellow-500"
                      }`}
                    >
                      {image.is_public ? "Público" : "Borrador"}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No hay imágenes</h3>
            <p className="text-slate-400">
              {isOwnProfile ? "¡Sube tu primera imagen!" : "Este usuario no ha subido imágenes aún"}
            </p>
          </div>
        )}

        {/* Modal para ver imagen completa */}
        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-white">{selectedImage.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={selectedImage.image_url || "/placeholder.svg"}
                  alt={selectedImage.title}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
                {selectedImage.description && <p className="text-slate-300">{selectedImage.description}</p>}
                <p className="text-sm text-slate-400">
                  Subida {new Date(selectedImage.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
