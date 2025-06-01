import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Mapa del Sitio</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            <p>Esta página está en desarrollo. El mapa del sitio se publicará próximamente.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
