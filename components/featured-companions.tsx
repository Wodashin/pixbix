import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, Gamepad2, MessageCircle, Video } from "lucide-react"

const companions = [
  {
    id: 1,
    name: "Luna_Gamer",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.9,
    reviews: 234,
    price: "$15/hora",
    games: ["Valorant", "League of Legends", "Apex Legends"],
    languages: ["Español", "Inglés"],
    services: ["Jugar Juntos", "Coaching", "Chat"],
    online: true,
    responseTime: "< 5 min",
    description:
      "Jugadora profesional con 5 años de experiencia en FPS y MOBAs. ¡Mejora tu gameplay mientras te diviertes!",
  },
  {
    id: 2,
    name: "ProGamer_Alex",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.8,
    reviews: 189,
    price: "$12/hora",
    games: ["Fortnite", "Call of Duty", "Rocket League"],
    languages: ["Español"],
    services: ["Jugar Juntos", "Entretenimiento"],
    online: true,
    responseTime: "< 10 min",
    description: "Streamer y jugador competitivo. Especialista en Battle Royale y juegos de deportes virtuales.",
  },
  {
    id: 3,
    name: "Sakura_Chan",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 5.0,
    reviews: 156,
    price: "$18/hora",
    games: ["Genshin Impact", "Final Fantasy XIV", "Minecraft"],
    languages: ["Español", "Japonés"],
    services: ["Jugar Juntos", "Chat", "Streaming"],
    online: false,
    responseTime: "< 30 min",
    description: "Amante de los RPGs y juegos de aventura. Perfecta para relajarse y explorar mundos virtuales juntos.",
  },
  {
    id: 4,
    name: "TechMaster_Pro",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.7,
    reviews: 298,
    price: "$20/hora",
    games: ["CS:GO", "Dota 2", "Overwatch 2"],
    languages: ["Español", "Inglés"],
    services: ["Coaching", "Análisis", "Jugar Juntos"],
    online: true,
    responseTime: "< 15 min",
    description: "Ex-jugador profesional de esports. Especializado en mejorar habilidades tácticas y estratégicas.",
  },
]

export function FeaturedCompanions() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Compañeros Destacados</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Encuentra el compañero gaming perfecto para mejorar tu experiencia de juego
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {companions.map((companion) => (
            <Card
              key={companion.id}
              className="bg-slate-800 border-slate-700 overflow-hidden group hover:border-cyan-500 transition-colors"
            >
              <CardContent className="p-6">
                {/* Header with Avatar and Status */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={companion.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{companion.name[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-800 ${
                        companion.online ? "bg-green-500" : "bg-slate-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{companion.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-slate-300 text-sm">{companion.rating}</span>
                        <span className="text-slate-500 text-sm">({companion.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and Response Time */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-cyan-400 font-bold text-xl">{companion.price}</span>
                  <div className="flex items-center space-x-1 text-slate-400 text-sm">
                    <Clock className="h-3 w-3" />
                    <span>{companion.responseTime}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{companion.description}</p>

                {/* Games */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {companion.games.slice(0, 2).map((game, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                        {game}
                      </Badge>
                    ))}
                    {companion.games.length > 2 && (
                      <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                        +{companion.games.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Services */}
                <div className="flex items-center space-x-2 mb-4 text-slate-400 text-xs">
                  {companion.services.includes("Jugar Juntos") && <Gamepad2 className="h-3 w-3" />}
                  {companion.services.includes("Chat") && <MessageCircle className="h-3 w-3" />}
                  {companion.services.includes("Streaming") && <Video className="h-3 w-3" />}
                </div>

                {/* Languages */}
                <div className="mb-4">
                  <span className="text-slate-500 text-xs">Idiomas: </span>
                  <span className="text-slate-300 text-xs">{companion.languages.join(", ")}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={!companion.online}>
                    {companion.online ? "Contratar Ahora" : "No Disponible"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                  >
                    Ver Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            variant="outline"
            size="lg"
            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            Ver Todos los Compañeros
          </Button>
        </div>
      </div>
    </section>
  )
}
