import { SimpleImageUpload } from "@/components/simple-image-upload"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TestUploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Prueba de Subida de Imágenes</h1>
        <SimpleImageUpload />
      </main>
      <Footer />
    </div>
  )
}
