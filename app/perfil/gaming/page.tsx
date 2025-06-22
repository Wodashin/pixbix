import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {GamingProfiles} from "@/components/gaming-profiles"

export default function GamingProfilePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Perfil Gaming</h1>
            <p className="text-xl text-slate-400">Personaliza tu perfil gaming y conecta con otros jugadores</p>
          </div>
          <GamingProfiles />
        </div>
      </main>
      <Footer />
    </div>
  )
}
