"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Trophy, Gamepad2, Plus, MapPin, Search, TrendingUp } from "lucide-react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Event {
  id: string
  title: string
  description: string
  game: string
  start_date: string
  end_date: string
  max_participants: number | null
  event_type: "tournament" | "casual" | "training" | "meetup"
  creator_id: string
  created_at: string
  creator: {
    id: string
    username: string
    display_name: string
    avatar_url: string
  }
  participants: Array<{
    user_id: string
    user: {
      id: string
      username: string
      display_name: string
      avatar_url: string
    }
  }>
}

export function EventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    game: "",
    start_date: "",
    end_date: "",
    max_participants: "",
    event_type: "tournament" as const,
  })

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/events?type=${filter}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createEvent = async () => {
    if (!formData.title || !formData.description || !formData.start_date) return

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : null,
        }),
      })

      if (response.ok) {
        setIsCreateModalOpen(false)
        setFormData({
          title: "",
          description: "",
          game: "",
          start_date: "",
          end_date: "",
          max_participants: "",
          event_type: "tournament",
        })
        fetchEvents()
      }
    } catch (error) {
      console.error("Error creating event:", error)
    }
  }

  const joinEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
      })

      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error("Error joining event:", error)
    }
  }

  const leaveEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error("Error leaving event:", error)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "tournament":
        return <Trophy className="h-4 w-4" />
      case "casual":
        return <Gamepad2 className="h-4 w-4" />
      case "training":
        return <Users className="h-4 w-4" />
      case "meetup":
        return <MapPin className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "tournament":
        return "bg-yellow-500"
      case "casual":
        return "bg-green-500"
      case "training":
        return "bg-blue-500"
      case "meetup":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const isUserJoined = (event: Event) => {
    if (!session?.user?.email) return false
    return event.participants.some((p) => p.user.id === session.user.id)
  }

  const isEventFull = (event: Event) => {
    if (!event.max_participants) return false
    return event.participants.length >= event.max_participants
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Eventos Gaming</h1>
          <p className="text-xl text-slate-400 max-w-2xl">
            Únete a torneos, entrenamientos y meetups con la comunidad gaming
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-sm text-slate-400">Eventos Activos</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">
                {events.reduce((acc, event) => acc + event.participants.length, 0)}
              </div>
              <div className="text-sm text-slate-400">Participantes</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">
                {events.filter((e) => e.event_type === "tournament").length}
              </div>
              <div className="text-sm text-slate-400">Torneos</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="h-6 w-6 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-white">
                {events.filter((e) => e.event_type === "casual").length}
              </div>
              <div className="text-sm text-slate-400">Casual</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex space-x-4 mb-4 md:mb-0">
                <Button
                  variant={filter === "upcoming" ? "default" : "secondary"}
                  onClick={() => setFilter("upcoming")}
                  className={
                    filter === "upcoming"
                      ? "bg-cyan-600 hover:bg-cyan-700"
                      : "bg-slate-600 hover:bg-slate-700 text-white"
                  }
                >
                  Próximos
                </Button>
                <Button
                  variant={filter === "all" ? "default" : "secondary"}
                  onClick={() => setFilter("all")}
                  className={
                    filter === "all" ? "bg-cyan-600 hover:bg-cyan-700" : "bg-slate-600 hover:bg-slate-700 text-white"
                  }
                >
                  Todos
                </Button>
                <Button
                  variant={filter === "past" ? "default" : "secondary"}
                  onClick={() => setFilter("past")}
                  className={
                    filter === "past" ? "bg-cyan-600 hover:bg-cyan-700" : "bg-slate-600 hover:bg-slate-700 text-white"
                  }
                >
                  Pasados
                </Button>
              </div>

              {session && (
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Evento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Título del evento"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-slate-700 border-slate-600"
                      />
                      <Textarea
                        placeholder="Descripción del evento"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-slate-700 border-slate-600"
                      />
                      <Input
                        placeholder="Juego (ej: Valorant, League of Legends)"
                        value={formData.game}
                        onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                        className="bg-slate-700 border-slate-600"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400">Fecha de inicio</label>
                          <Input
                            type="datetime-local"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Fecha de fin (opcional)</label>
                          <Input
                            type="datetime-local"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400">Tipo de evento</label>
                          <Select
                            value={formData.event_type}
                            onValueChange={(value: any) => setFormData({ ...formData, event_type: value })}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="tournament">Torneo</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="training">Entrenamiento</SelectItem>
                              <SelectItem value="meetup">Meetup</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Máx. participantes (opcional)</label>
                          <Input
                            type="number"
                            placeholder="Sin límite"
                            value={formData.max_participants}
                            onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                      </div>
                      <Button onClick={createEvent} className="w-full bg-purple-600 hover:bg-purple-700">
                        Crear Evento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-slate-400">Cargando eventos...</div>
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-2">{event.title}</CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`${getEventTypeColor(event.event_type)} text-white`}>
                              {getEventTypeIcon(event.event_type)}
                              <span className="ml-1 capitalize">{event.event_type}</span>
                            </Badge>
                            {event.game && (
                              <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                                {event.game}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm mb-4 line-clamp-2">{event.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-slate-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(event.start_date), "PPP", { locale: es })}
                        </div>
                        <div className="flex items-center text-sm text-slate-400">
                          <Clock className="h-4 w-4 mr-2" />
                          {format(new Date(event.start_date), "p", { locale: es })}
                        </div>
                        <div className="flex items-center text-sm text-slate-400">
                          <Users className="h-4 w-4 mr-2" />
                          {event.participants.length}
                          {event.max_participants && ` / ${event.max_participants}`} participantes
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={event.creator.avatar_url || ""} />
                            <AvatarFallback className="text-xs bg-slate-700">
                              {event.creator.display_name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-slate-400">{event.creator.display_name}</span>
                        </div>

                        {session && (
                          <div>
                            {isUserJoined(event) ? (
                              <Button
                                size="sm"
                                onClick={() => leaveEvent(event.id)}
                                className="bg-red-600 hover:bg-red-700 text-white border-0"
                              >
                                Salir
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => joinEvent(event.id)}
                                disabled={isEventFull(event)}
                                className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
                              >
                                {isEventFull(event) ? "Lleno" : "Unirse"}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">No hay eventos</h3>
                <p className="text-slate-500">
                  {filter === "upcoming" ? "No hay eventos próximos" : "No se encontraron eventos"}
                </p>
                {session && (
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear el primer evento
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar eventos..."
                    className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Event Types */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />
                  Tipos de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className="text-white">Torneos</span>
                  </div>
                  <Badge className="bg-yellow-500 text-white">
                    {events.filter((e) => e.event_type === "tournament").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gamepad2 className="h-4 w-4 text-green-400" />
                    <span className="text-white">Casual</span>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    {events.filter((e) => e.event_type === "casual").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-white">Entrenamiento</span>
                  </div>
                  <Badge className="bg-blue-500 text-white">
                    {events.filter((e) => e.event_type === "training").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <span className="text-white">Meetups</span>
                  </div>
                  <Badge className="bg-purple-500 text-white">
                    {events.filter((e) => e.event_type === "meetup").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <Users className="mr-2 h-4 w-4" />
                  Encontrar Compañeros
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Mis Eventos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
