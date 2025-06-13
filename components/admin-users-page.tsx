"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Search, UserCheck, UserX, Shield, User, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Tipos
type UserType = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  username: string | null
}

type Role = "user" | "event_creator" | "moderator" | "admin"

export function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTab, setCurrentTab] = useState("all")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  // Verificar si el usuario tiene permisos
  useEffect(() => {
    const checkPermissions = async () => {
      if (status === "loading") return

      if (status === "unauthenticated") {
        toast({
          title: "Acceso denegado",
          description: "Debe iniciar sesión para acceder a esta página",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      try {
        const response = await fetch("/api/admin/check-permissions")
        const data = await response.json()

        if (!data.isAuthorized) {
          toast({
            title: "Acceso denegado",
            description: "No tiene permisos para acceder a esta página",
            variant: "destructive",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error al verificar permisos:", error)
        toast({
          title: "Error",
          description: "No se pudieron verificar los permisos",
          variant: "destructive",
        })
      }
    }

    checkPermissions()
  }, [status, router])

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        const data = await response.json()

        if (data.users) {
          setUsers(data.users)
          setFilteredUsers(data.users)
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchUsers()
    }
  }, [status])

  // Filtrar usuarios
  useEffect(() => {
    let result = [...users]

    // Filtrar por pestaña (rol)
    if (currentTab !== "all") {
      result = result.filter((user) => user.role === currentTab)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (user) =>
          user.email?.toLowerCase().includes(term) ||
          user.name?.toLowerCase().includes(term) ||
          user.username?.toLowerCase().includes(term),
      )
    }

    setFilteredUsers(result)
  }, [users, currentTab, searchTerm])

  // Actualizar rol de usuario
  const updateUserRole = async (userId: string, newRole: Role) => {
    setUpdatingUserId(userId)

    try {
      const response = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newRole }),
      })

      const data = await response.json()

      if (response.ok) {
        // Actualizar la lista de usuarios localmente
        setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

        toast({
          title: "Rol actualizado",
          description: `El rol del usuario ha sido actualizado a ${newRole}`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar el rol",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al actualizar rol:", error)
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Renderizar icono según el rol
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "moderator":
        return <UserCheck className="h-4 w-4" />
      case "event_creator":
        return <User className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  // Renderizar color de badge según el rol
  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "admin":
        return "destructive"
      case "moderator":
        return "secondary"
      case "event_creator":
        return "default"
      default:
        return "outline"
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <span className="ml-2 text-xl">Cargando...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Administración de Usuarios</h1>
        <p className="text-slate-400">Gestiona los roles de los usuarios de la plataforma</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, email o username..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={currentTab} onValueChange={setCurrentTab}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="user">Usuarios</SelectItem>
            <SelectItem value="event_creator">Creadores de eventos</SelectItem>
            <SelectItem value="moderator">Moderadores</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-2xl font-bold">{users.filter((u) => u.role === "user").length}</p>
              <p className="text-sm text-slate-400">Usuarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
              <p className="text-2xl font-bold">{users.filter((u) => u.role === "event_creator").length}</p>
              <p className="text-sm text-slate-400">Creadores de eventos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{users.filter((u) => u.role === "moderator").length}</p>
              <p className="text-sm text-slate-400">Moderadores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
              <p className="text-sm text-slate-400">Administradores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || ""} alt={user.name || user.email} />
                    <AvatarFallback>
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : user.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{user.name || "Sin nombre"}</CardTitle>
                    <CardDescription className="text-xs truncate max-w-[200px]">{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </Badge>
                    {user.username && <span className="text-xs text-slate-400">@{user.username}</span>}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                {/* Botones para cambiar rol */}
                {user.role !== "event_creator" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateUserRole(user.id, "event_creator")}
                    disabled={updatingUserId === user.id}
                  >
                    {updatingUserId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <User className="h-4 w-4 mr-1" />
                    )}
                    Creador de eventos
                  </Button>
                )}
                {user.role !== "user" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateUserRole(user.id, "user")}
                    disabled={updatingUserId === user.id}
                  >
                    {updatingUserId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Users className="h-4 w-4 mr-1" />
                    )}
                    Usuario
                  </Button>
                )}
                {/* Solo los admins pueden crear moderadores y admins */}
                {session?.user?.email && users.find((u) => u.email === session.user.email)?.role === "admin" && (
                  <>
                    {user.role !== "moderator" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => updateUserRole(user.id, "moderator")}
                        disabled={updatingUserId === user.id}
                      >
                        {updatingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <UserCheck className="h-4 w-4 mr-1" />
                        )}
                        Moderador
                      </Button>
                    )}
                    {user.role !== "admin" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => updateUserRole(user.id, "admin")}
                        disabled={updatingUserId === user.id}
                      >
                        {updatingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Shield className="h-4 w-4 mr-1" />
                        )}
                        Admin
                      </Button>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <UserX className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No se encontraron usuarios</h3>
            <p className="text-slate-400">
              {searchTerm ? "No hay usuarios que coincidan con tu búsqueda" : "No hay usuarios con el rol seleccionado"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
