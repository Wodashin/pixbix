import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Users, Zap, Heart } from "lucide-react"

const communityStats = [
  {
    icon: Users,
    label: "Compañeros Activos",
    value: "5K+",
    color: "text-cyan-400",
  },
  {
    icon: MessageSquare,
    label: "Sesiones Diarias",
    value: "1.2K+",
    color: "text-green-400",
  },
  {
    icon: Zap,
    label: "Horas Jugadas",
    value: "50K+",
    color: "text-yellow-400",
  },
  {
    icon: Heart,
    label: "Satisfacción",
    value: "98%",
    color: "text-pink-400",
  },
]

const topMembers = [
  {
    name: "GameMaster_Pro",
    avatar: "/placeholder.svg?height=40&width=40",
    points: "15,250",
    badge: "Leyenda",
  },
  {
    name: "PixelHunter",
    avatar: "/placeholder.svg?height=40&width=40",
    points: "12,890",
    badge: "Experto",
  },
  {
    name: "RetroGamer95",
    avatar: "/placeholder.svg?height=40&width=40",
    points: "11,450",
    badge: "Veterano",
  },
]

export function CommunitySection() {
  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Únete a la Comunidad</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Conecta con millones de gamers, comparte experiencias y forma parte de la familia Nobux Gaming
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {communityStats.map((stat, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 text-center">
              <CardContent className="p-6">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Community Features */}
          <div>
            <h3 className="text-3xl font-bold text-white mb-6">¿Por qué elegir Nobux Gaming?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Compañeros Verificados</h4>
                  <p className="text-slate-400">
                    Todos nuestros compañeros pasan por un proceso de verificación para garantizar calidad y seguridad
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Pagos Seguros</h4>
                  <p className="text-slate-400">
                    Sistema de pagos protegido con garantía de reembolso si no estás satisfecho
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Disponibilidad 24/7</h4>
                  <p className="text-slate-400">Encuentra compañeros gaming disponibles en cualquier momento del día</p>
                </div>
              </div>
            </div>
            <Button size="lg" className="mt-8 bg-cyan-600 hover:bg-cyan-700">
              Unirse Gratis
            </Button>
          </div>

          {/* Right side - Top Members */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold text-white mb-6">Top Miembros del Mes</h4>
              <div className="space-y-4">
                {topMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{member.name}</div>
                        <div className="text-purple-400 text-sm">{member.badge}</div>
                      </div>
                    </div>
                    <div className="text-slate-300 font-semibold">{member.points} pts</div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-6 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                Ver Ranking Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
