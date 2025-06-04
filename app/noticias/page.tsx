import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Noticias Gaming</h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Mantente al día con las últimas noticias del mundo gaming en PixBae
          </p>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Próximamente</h2>
            <p className="text-slate-400">
              Estamos trabajando en traerte las mejores noticias y actualizaciones del mundo gaming.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
