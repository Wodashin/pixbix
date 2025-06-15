import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FeaturedGames } from "@/components/featured-games"

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Marketplace Gaming</h1>
          <p className="text-xl text-slate-400 max-w-2xl">Descubre los mejores juegos y productos gaming</p>
        </div>
        <FeaturedGames />
      </main>
      <Footer />
    </div>
  )
}
