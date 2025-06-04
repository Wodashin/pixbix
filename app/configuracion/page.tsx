import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Configuración</h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">Personaliza tu experiencia en PixBae</p>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Panel de Configuración</h2>
            <p className="text-slate-400">Aquí podrás ajustar todas las configuraciones de tu cuenta y preferencias.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
