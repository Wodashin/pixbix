import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FeaturedCompanions } from "@/components/featured-companions"

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
        <FeaturedCompanions />
      </main>
      <Footer />
    </div>
  )
}
