import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserProfile } from "@/components/user-profile"

export default function PerfilPage() {
  console.log("🎯 Página /perfil cargada correctamente")

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">🎮 Página de Perfil Cargada</h1>
          <UserProfile />
        </div>
      </main>
      <Footer />
    </div>
  )
}
