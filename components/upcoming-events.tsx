import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Trophy } from "lucide-react"

const events = [
  {
    id: 1,
    title: "Nobux Gaming Championship 2024",
    date: "2024-02-15",
    time: "19:00",
    location: "Online",
    participants: "500+",
    prize: "$50,000",
    game: "Valorant",
    status: "Registrándose",
  },
  {
    id: 2,
    title: "Encuentro de Compañeros Gaming",
    date: "2024-02-20",
    time: "14:00",
    location: "Discord",
    participants: "200",
    prize: "Networking",
    game: "Evento Social",
    status: "Próximamente",
  },
  {
    id: 3,
    title: "Workshop: Cómo ser un Mejor Compañero",
    date: "2024-02-25",
    time: "20:00",
    location: "YouTube Live",
    participants: "Ilimitado",
    prize: "Certificación",
    game: "Educativo",
    status: "Confirmado",
  },
]

export function UpcomingEvents() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Próximos Eventos</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Únete a los eventos más emocionantes de la comunidad gaming
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge
                    className={`${
                      event.status === "Registrándose"
                        ? "bg-green-600"
                        : event.status === "Próximamente"
                          ? "bg-yellow-600"
                          : "bg-blue-600"
                    }`}
                  >
                    {event.status}
                  </Badge>
                  <span className="text-slate-400 text-sm">{event.game}</span>
                </div>

                <h3 className="font-bold text-white text-xl mb-3">{event.title}</h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-slate-300 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString("es-ES")} a las {event.time}
                  </div>
                  <div className="flex items-center text-slate-300 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-slate-300 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    {event.participants} participantes
                  </div>
                  <div className="flex items-center text-slate-300 text-sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    Premio: {event.prize}
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    event.status === "Registrándose"
                      ? "bg-cyan-600 hover:bg-cyan-700"
                      : "bg-slate-600 hover:bg-slate-700"
                  }`}
                  disabled={event.status !== "Registrándose"}
                >
                  {event.status === "Registrándose"
                    ? "Registrarse Ahora"
                    : event.status === "Próximamente"
                      ? "Notificarme"
                      : "Ver Detalles"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
            Ver Calendario Completo
          </Button>
        </div>
      </div>
    </section>
  )
}
