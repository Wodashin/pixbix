import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageCircle, Eye } from "lucide-react"
import Image from "next/image"

const news = [
  {
    id: 1,
    title: "Nobux Gaming alcanza 50,000 usuarios registrados",
    excerpt: "Nuestra plataforma de compañía gaming sigue creciendo con miles de nuevos usuarios cada mes.",
    image: "/placeholder.svg?height=200&width=350",
    category: "Nobux",
    date: "2024-01-15",
    views: "15.2K",
    comments: 245,
  },
  {
    id: 2,
    title: "Nuevas funciones de seguridad para proteger a nuestra comunidad",
    excerpt: "Implementamos verificación de identidad y sistema de reportes mejorado para mayor seguridad.",
    image: "/placeholder.svg?height=200&width=350",
    category: "Seguridad",
    date: "2024-01-14",
    views: "22.1K",
    comments: 312,
  },
  {
    id: 3,
    title: "Los juegos más populares en Nobux Gaming este mes",
    excerpt: "Valorant, League of Legends y Genshin Impact lideran las preferencias de nuestros compañeros.",
    image: "/placeholder.svg?height=200&width=350",
    category: "Tendencias",
    date: "2024-01-13",
    views: "8.7K",
    comments: 156,
  },
]

export function LatestNews() {
  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Últimas Noticias</h2>
            <p className="text-xl text-slate-400">Mantente al día con lo último del mundo gaming</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Ver Todas</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article) => (
            <Card
              key={article.id}
              className="bg-slate-800 border-slate-700 overflow-hidden group hover:border-cyan-500 transition-colors"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    width={350}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-purple-600">{article.category}</Badge>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-white text-lg mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors cursor-pointer">
                    {article.title}
                  </h3>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-3">{article.excerpt}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(article.date).toLocaleDateString("es-ES")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{article.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{article.comments}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
