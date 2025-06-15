import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EventsPage } from "@/components/events-page"

export default function EventosPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <EventsPage />
      <Footer />
    </div>
  )
}
