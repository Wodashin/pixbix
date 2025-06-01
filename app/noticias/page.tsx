import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Noticias Gaming</h1>
        <p className="text-slate-400">Esta página está en desarrollo...</p>
      </main>
      <Footer />
    </div>
  )
}
