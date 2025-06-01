"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import Image from "next/image"

const featuredContent = [
  {
    id: 1,
    title: "Encuentra tu Compañero Gaming Perfecto",
    description:
      "Conecta con jugadores expertos, haz nuevos amigos y mejora tu experiencia gaming con compañía personalizada.",
    image: "/placeholder.svg?height=600&width=1200",
    badge: "Nuevo",
    buttonText: "Explorar Compañeros",
    buttonLink: "/compañeros",
  },
  {
    id: 2,
    title: "Gana Dinero Jugando",
    description: "Únete como compañero gaming y monetiza tu pasión por los videojuegos ayudando a otros jugadores.",
    image: "/placeholder.svg?height=600&width=1200",
    badge: "Únete Ahora",
    buttonText: "Ser Compañero",
    buttonLink: "/register",
  },
  {
    id: 3,
    title: "Torneo Nobux Championship",
    description: "Participa en nuestro torneo mensual con premios increíbles y reconocimiento en la comunidad.",
    image: "/placeholder.svg?height=600&width=1200",
    badge: "Evento Live",
    buttonText: "Registrarse",
    buttonLink: "/eventos",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredContent.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredContent.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredContent.length) % featuredContent.length)
  }

  return (
    <section className="relative h-[80vh] overflow-hidden">
      {featuredContent.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.title || "Hero Image"}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />

          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-purple-600 hover:bg-purple-700 text-white">{item.badge}</Badge>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {item.title || "Welcome"}
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                {item.description || "Discover amazing gaming experiences"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={item.buttonLink}>
                  <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Play className="mr-2 h-5 w-5" />
                    {item.buttonText}
                  </Button>
                </Link>
                <Link href="/comunidad">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                  >
                    Más Información
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-slate-800/50"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-slate-800/50"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {featuredContent.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-purple-500" : "bg-slate-600"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
