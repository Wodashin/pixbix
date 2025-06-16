import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CompañerosPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Compañeros Gaming</h1>
          <p className="text-xl text-slate-400 max-w-2xl">
            Encuentra el compañero gaming perfecto para mejorar tu experiencia de juego
          </p>
        </div>

        {/* Contenido simple por ahora */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-2">Compañero 1</h3>
            <p className="text-slate-400">Especialista en Valorant</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-2">Compañero 2</h3>
            <p className="text-slate-400">Experto en League of Legends</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-2">Compañero 3</h3>
            <p className="text-slate-400">Pro en Apex Legends</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
