import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SimpleUserProfile } from "@/components/simple-user-profile"

export default function PerfilPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SimpleUserProfile />
      </main>
      <Footer />
    </div>
  )
}
