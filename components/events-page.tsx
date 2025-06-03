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
import { Calendar, Clock, Users, Trophy, Gamepad2, Plus, MapPin, TrendingUp, Star, Search, Filter } from "lucide-react"
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
  const [isCreating, setIsCreating] = useState(false)

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
    if (!formData.title || !formData.description || !formData.start_date) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    if (!session?.user?.email) {
      alert("Debes estar logueado para crear eventos")
      return
    }

    try {
      setIsCreating(true)
      console.log("Creating event with session:", session.user.email)

      // Preparar headers con información de sesión
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      // Agregar información de usuario en headers personalizados
      if (session.user.email) {
        headers["X-User-Email"] = session.user.email
      }
      if (session.user.id) {
        headers["X-User-ID"] = session.user.id
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...formData,
          max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : null,
        }),
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const newEvent = await response.json()
        console.log("Event created successfully:", newEvent)

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
        alert("¡Evento creado exitosamente!")
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        alert(`Error al crear evento: ${errorData.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Error al crear evento. Por favor intenta de nuevo.")
    } finally {
      setIsCreating(false)
    }
  }

  const joinEvent = async (eventId: string) => {
    if (!session?.user?.email) {
      alert("Debes estar logueado para unirte a eventos")
      return
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (session.user.email) {
        headers["X-User-Email"] = session.user.email
      }
      if (session.user.id) {
        headers["X-User-ID"] = session.user.id
      }

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
        headers,
      })

      if (response.ok) {
        fetchEvents()
        alert("¡Te has unido al evento!")
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || "No se pudo unir al evento"}`)
      }
    } catch (error) {
      console.error("Error joining event:", error)
      alert("Error al unirse al evento")
    }
  }

  const leaveEvent = async (eventId: string) => {
    if (!session?.user?.email) return

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (session.user.email) {
        headers["X-User-Email"] = session.user.email
      }
      if (session.user.id) {
        headers["X-User-ID"] = session.user.id
      }

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "DELETE",
        headers,
      })

      if (response.ok) {
        fetchEvents()
        alert("Has salido del evento")
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || "No se pudo salir del evento"}`)
      }
    } catch (error) {
      console.error("Error leaving event:", error)
      alert("Error al salir del evento")
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
        {/* Header moderno */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Eventos Gaming</h1>
              <p className="text-xl text-slate-400">
                Conecta con gamers de todo el mundo, únete a torneos y descubre nuevas experiencias
              </p>
            </div>
            {session && (
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Crear Nuevo Evento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <Input
                      placeholder="Título del evento"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-slate-800 border-slate-600 h-12"
                    />
                    <Textarea
                      placeholder="Descripción del evento"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-800 border-slate-600 min-h-[100px]"
                    />
                    <Input
                      placeholder="Juego (ej: Valorant, League of Legends)"
                      value={formData.game}
                      onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                      className="bg-slate-800 border-slate-600 h-12"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Fecha de inicio</label>
                        <Input
                          type="datetime-local"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="bg-slate-800 border-slate-600 h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Fecha de fin (opcional)</label>
                        <Input
                          type="datetime-local"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="bg-slate-800 border-slate-600 h-12"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Tipo de evento</label>
                        <Select
                          value={formData.event_type}
                          onValueChange={(value: any) => setFormData({ ...formData, event_type: value })}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="tournament">🏆 Torneo</SelectItem>
                            <SelectItem value="casual">🎮 Casual</SelectItem>
                            <SelectItem value="training">👥 Entrenamiento</SelectItem>
                            <SelectItem value="meetup">📍 Meetup</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Máx. participantes (opcional)</label>
                        <Input
                          type="number"
                          placeholder="Sin límite"
                          value={formData.max_participants}
                          onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                          className="bg-slate-800 border-slate-600 h-12"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={createEvent}
                      disabled={isCreating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg disabled:opacity-50"
                    >
                      {isCreating ? "Creando..." : "Crear Evento"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Stats Cards modernas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-cyan-500 transition-colors">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-cyan-400" />
                <div className="text-3xl font-bold text-white mb-1">{events.length}</div>
                <div className="text-sm text-slate-400">Eventos Activos</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-green-500 transition-colors">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-green-400" />
                <div className="text-3xl font-bold text-white mb-1">
                  {events.reduce((acc, event) => acc + event.participants.length, 0)}
                </div>
                <div className="text-sm text-slate-400">Participantes</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-yellow-500 transition-colors">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
                <div className="text-3xl font-bold text-white mb-1">
                  {events.filter((e) => e.event_type === "tournament").length}
                </div>
                <div className="text-sm text-slate-400">Torneos</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-purple-500 transition-colors">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-3 text-purple-400" />
                <div className="text-3xl font-bold text-white mb-1">
                  {events.filter((e) => e.event_type === "casual").length}
                </div>
                <div className="text-sm text-slate-400">Eventos</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filtros modernos */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div className="flex flex-wrap gap-3 mb-4 md:mb-0">
                <Button
                  variant={filter === "upcoming" ? "default" : "secondary"}
                  onClick={() => setFilter("upcoming")}
                  className={
                    filter === "upcoming"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }
                >
                  🔥 Próximos
                </Button>
                <Button
                  variant={filter === "all" ? "default" : "secondary"}
                  onClick={() => setFilter("all")}
                  className={
                    filter === "all"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }
                >
                  📅 Todos
                </Button>
                <Button
                  variant={filter === "past" ? "default" : "secondary"}
                  onClick={() => setFilter("past")}
                  className={
                    filter === "past"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }
                >
                  📚 Pasados
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar eventos..."
                    className="pl-10 bg-slate-800 border-slate-600 text-slate-100 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Lista de eventos moderna */}
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <div className="text-slate-400">Cargando eventos...</div>
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-xl mb-3 line-clamp-1">{event.title}</CardTitle>
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge className={`${getEventTypeColor(event.event_type)} text-white px-3 py-1`}>
                              {getEventTypeIcon(event.event_type)}
                              <span className="ml-1 capitalize">{event.event_type}</span>
                            </Badge>
                            {event.game && (
                              <Badge variant="outline" className="text-cyan-400 border-cyan-400 px-3 py-1">
                                🎮 {event.game}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm mb-6 line-clamp-2">{event.description}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-slate-400">
                          <Calendar className="h-4 w-4 mr-3 text-cyan-400" />
                          {format(new Date(event.start_date), "PPP", { locale: es })}
                        </div>
                        <div className="flex items-center text-sm text-slate-400">
                          <Clock className="h-4 w-4 mr-3 text-green-400" />
                          {format(new Date(event.start_date), "p", { locale: es })}
                        </div>
                        <div className="flex items-center text-sm text-slate-400">
                          <Users className="h-4 w-4 mr-3 text-purple-400" />
                          {event.participants.length}
                          {event.max_participants && ` / ${event.max_participants}`} participantes
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 border-2 border-slate-600">
                            <AvatarImage src={event.creator.avatar_url || ""} />
                            <AvatarFallback className="text-xs bg-slate-700">
                              {event.creator.display_name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-slate-300 font-medium">{event.creator.display_name}</span>
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
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50"
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
              <div className="text-center py-16">
                <Calendar className="h-20 w-20 text-slate-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-slate-400 mb-3">No hay eventos</h3>
                <p className="text-slate-500 mb-6">
                  {filter === "upcoming" ? "No hay eventos próximos" : "No se encontraron eventos"}
                </p>
                {session && (
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear el primer evento
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar moderna */}
          <div className="space-y-6">
            {/* Trending */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />🔥 Trending
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-medium">#Valorant Champions</span>
                  </div>
                  <Badge className="bg-yellow-500 text-white">Hot</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Gamepad2 className="h-5 w-5 text-green-400" />
                    <span className="text-white font-medium">#League Worlds</span>
                  </div>
                  <Badge className="bg-green-500 text-white">Live</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-medium">#CS2 Training</span>
                  </div>
                  <Badge className="bg-blue-500 text-white">New</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">⚡ Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
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
