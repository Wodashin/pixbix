import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageCircle, Trophy, Calendar } from "lucide-react"

export function CommunitySection() {
  return (
    <section className="py-16 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Únete a Nuestra Comunidad</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Conecta con gamers de todo el mundo, participa en eventos y comparte tus logros
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-purple-400 mx-auto mb-2" />
              <CardTitle className="text-white">10K+ Miembros</CardTitle>
              <CardDescription className="text-slate-400">Una comunidad activa y creciente</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <CardTitle className="text-white">Chat Global</CardTitle>
              <CardDescription className="text-slate-400">Conversaciones en tiempo real</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
              <CardTitle className="text-white">Torneos</CardTitle>
              <CardDescription className="text-slate-400">Compite y gana premios</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-white">Eventos</CardTitle>
              <CardDescription className="text-slate-400">Actividades semanales</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            Únete Ahora
          </Button>
        </div>
      </div>
    </section>
  )
}
