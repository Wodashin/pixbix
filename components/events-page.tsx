"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Trophy, Plus } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  participants: string
  prize: string
  game: string
  status: string
  description?: string
}

export function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events")
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error al cargar eventos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEvent = async (eventId: number) => {
    if (!user) {
      // Redirigir a login
      window.location.href = "/login"
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
      })

      if (response.ok) {
        // Actualizar la lista de eventos
        fetchEvents()
      }
    } catch (error) {
      console.error("Error al unirse al evento:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-slate-400">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Eventos Gaming</h1>
          <p className="text-xl text-slate-400">Únete a los eventos más emocionantes de la comunidad</p>
        </div>
        {user && (
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Crear Evento
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600">
            Próximos
          </TabsTrigger>
          <TabsTrigger value="live" className="data-[state=active]:bg-purple-600">
            En Vivo
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-purple-600">
            Pasados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
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
                  <CardTitle className="text-white text-xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
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
                    onClick={() => handleJoinEvent(event.id)}
                    className={`w-full ${
                      event.status === "Registrándose"
                        ? "bg-cyan-600 hover:bg-cyan-700"
                        : "bg-slate-600 hover:bg-slate-700"
                    }`}
                    disabled={event.status !== "Registrándose"}
                  >
                    {event.status === "Registrándose"
                      ? user
                        ? "Registrarse Ahora"
                        : "Inicia sesión para registrarte"
                      : event.status === "Próximamente"
                        ? "Notificarme"
                        : "Ver Detalles"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No hay eventos en vivo</h3>
            <p className="text-slate-400">Los eventos que estén transmitiendo en vivo aparecerán aquí</p>
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">Eventos Pasados</h3>
            <p className="text-slate-400">Aquí podrás ver los resultados de eventos anteriores</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
