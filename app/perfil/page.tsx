import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserProfile } from "@/components/user-profile"

export default function PerfilPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main>
        <UserProfile />
      </main>
      <Footer />
    </div>
  )
}
