import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CompanionsPage } from "@/components/companions-page"

export default function CompañerosPageRoute() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main>
        <CompanionsPage />
      </main>
      <Footer />
    </div>
  )
}
