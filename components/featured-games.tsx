import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Download, Users } from "lucide-react"
import Image from "next/image"

const games = [
  {
    id: 1,
    title: "Elden Ring",
    genre: "RPG",
    rating: 4.9,
    price: "$59.99",
    image: "/placeholder.svg?height=300&width=400",
    downloads: "10M+",
    players: "500K",
  },
  {
    id: 2,
    title: "God of War Ragnarök",
    genre: "Acción",
    rating: 4.8,
    price: "$69.99",
    image: "/placeholder.svg?height=300&width=400",
    downloads: "8M+",
    players: "300K",
  },
  {
    id: 3,
    title: "Hades II",
    genre: "Roguelike",
    rating: 4.7,
    price: "$29.99",
    image: "/placeholder.svg?height=300&width=400",
    downloads: "5M+",
    players: "200K",
  },
  {
    id: 4,
    title: "Baldur's Gate 3",
    genre: "RPG",
    rating: 4.9,
    price: "$59.99",
    image: "/placeholder.svg?height=300&width=400",
    downloads: "15M+",
    players: "800K",
  },
]

export function FeaturedGames() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Juegos Destacados</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Descubre los títulos más populares y mejor valorados por nuestra comunidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className="bg-slate-800 border-slate-700 overflow-hidden group hover:border-purple-500 transition-colors"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <Image
                    src={game.image || "/placeholder.svg"}
                    alt={game.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-purple-600">{game.genre}</Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-white text-lg mb-2 line-clamp-1">{game.title || "Untitled Game"}</h3>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-slate-300 text-sm">{game.rating}</span>
                    </div>
                    <span className="text-purple-400 font-bold">{game.price}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{game.downloads}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{game.players}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Ver Detalles</Button>
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
            Ver Todos los Juegos
          </Button>
        </div>
      </div>
    </section>
  )
}
