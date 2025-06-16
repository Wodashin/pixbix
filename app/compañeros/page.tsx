import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FeaturedCompanions } from "@/components/featured-companions"

export default function CompañerosPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Encuentra tu Compañero Gaming Perfecto</h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
              Conecta con jugadores expertos, mejora tus habilidades y haz nuevos amigos mientras juegas tus títulos
              favoritos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold">
                Buscar Compañeros
              </button>
              <button className="border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg font-semibold">
                Ser Compañero
              </button>
            </div>
          </div>
        </section>

        {/* Featured Companions */}
        <FeaturedCompanions />

        {/* Stats Section */}
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-cyan-400 mb-2">5K+</div>
                <div className="text-slate-400">Compañeros Activos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
                <div className="text-slate-400">Sesiones Completadas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">4.9</div>
                <div className="text-slate-400">Calificación Promedio</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-slate-400">Disponibilidad</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">¿Cómo Funciona?</h2>
              <p className="text-xl text-slate-400">Es muy fácil encontrar tu compañero ideal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Busca</h3>
                <p className="text-slate-400">Explora perfiles de compañeros gaming según tu juego favorito y nivel</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Conecta</h3>
                <p className="text-slate-400">Chatea con tu compañero ideal y programa una sesión de gaming</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Juega</h3>
                <p className="text-slate-400">Disfruta de sesiones épicas y mejora tus habilidades gaming</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
