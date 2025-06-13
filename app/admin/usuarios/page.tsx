"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Search, User, Users } from "lucide-react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState(null)
  const router = useRouter()

  // Verificar permisos
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const res = await fetch("/api/admin/check-permissions")
        const data = await res.json()

        if (data.isAuthorized) {
          setIsAuthorized(true)
          setCurrentUserRole(data.role)
          fetchUsers()
        } else {
          setError("No tienes permisos para acceder a esta página")
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error al verificar permisos:", err)
        setError("Error al verificar permisos")
        setIsLoading(false)
      }
    }

    checkPermissions()
  }, [])

  // Obtener usuarios
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      setUsers(data.users || [])
      setIsLoading(false)
    } catch (err) {
      console.error("Error al obtener usuarios:", err)
      setError("Error al cargar la lista de usuarios")
      setIsLoading(false)
    }
  }

  // Cambiar rol de usuario
  const changeUserRole = async (userId, newRole) => {
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newRole }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Error ${res.status}`)
      }

      // Actualizar la lista de usuarios
      fetchUsers()
    } catch (err) {
      console.error("Error al cambiar rol:", err)
      alert(`Error: ${err.message}`)
    }
  }

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Contar usuarios por rol
  const userCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-slate-400">Cargando...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-400">{error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto py-10">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-64">
              <Shield className="h-16 w-16 text-red-400 mb-4" />
              <div className="text-red-400 text-xl font-semibold">Acceso Denegado</div>
              <p className="text-slate-400 mt-2">No tienes permisos para acceder a esta página</p>
              <Button className="mt-4 bg-slate-800 hover:bg-slate-700" onClick={() => router.push("/")}>
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center">
            <Users className="mr-2 h-6 w-6 text-cyan-400" />
            Administración de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-slate-400">Total Usuarios</div>
                <div className="text-2xl font-bold text-white">{users.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-slate-400">Administradores</div>
                <div className="text-2xl font-bold text-cyan-400">{userCounts.admin || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-slate-400">Moderadores</div>
                <div className="text-2xl font-bold text-purple-400">{userCounts.moderator || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-slate-400">Creadores de Eventos</div>
                <div className="text-2xl font-bold text-green-400">{userCounts.event_creator || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === "all" ? "default" : "outline"}
                className={roleFilter === "all" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"}
                onClick={() => setRoleFilter("all")}
              >
                Todos
              </Button>
              <Button
                variant={roleFilter === "admin" ? "default" : "outline"}
                className={roleFilter === "admin" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"}
                onClick={() => setRoleFilter("admin")}
              >
                Admins
              </Button>
              <Button
                variant={roleFilter === "moderator" ? "default" : "outline"}
                className={
                  roleFilter === "moderator" ? "bg-purple-600 hover:bg-purple-700" : "border-slate-700 text-slate-300"
                }
                onClick={() => setRoleFilter("moderator")}
              >
                Mods
              </Button>
              <Button
                variant={roleFilter === "event_creator" ? "default" : "outline"}
                className={
                  roleFilter === "event_creator" ? "bg-green-600 hover:bg-green-700" : "border-slate-700 text-slate-300"
                }
                onClick={() => setRoleFilter("event_creator")}
              >
                Creadores
              </Button>
            </div>
          </div>

          {/* Lista de usuarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card key={user.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                        {user.image ? (
                          <img
                            src={user.image || "/placeholder.svg"}
                            alt={user.name || "Usuario"}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name || "Sin nombre"}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <div className="mt-1">
                          {user.role === "admin" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-900 text-cyan-300">
                              Admin
                            </span>
                          )}
                          {user.role === "moderator" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900 text-purple-300">
                              Moderador
                            </span>
                          )}
                          {user.role === "event_creator" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-300">
                              Creador de Eventos
                            </span>
                          )}
                          {user.role === "user" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                              Usuario
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {/* Botón para hacer admin (solo visible para admins) */}
                      {currentUserRole === "admin" && user.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyan-800 text-cyan-400 hover:bg-cyan-900 hover:text-cyan-300"
                          onClick={() => changeUserRole(user.id, "admin")}
                        >
                          Admin
                        </Button>
                      )}

                      {/* Botón para hacer moderador (solo visible para admins) */}
                      {currentUserRole === "admin" && user.role !== "moderator" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-800 text-purple-400 hover:bg-purple-900 hover:text-purple-300"
                          onClick={() => changeUserRole(user.id, "moderator")}
                        >
                          Moderador
                        </Button>
                      )}

                      {/* Botón para hacer creador de eventos (visible para admins y moderadores) */}
                      {user.role !== "event_creator" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-800 text-green-400 hover:bg-green-900 hover:text-green-300"
                          onClick={() => changeUserRole(user.id, "event_creator")}
                        >
                          Creador de Eventos
                        </Button>
                      )}

                      {/* Botón para hacer usuario normal */}
                      {user.role !== "user" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 text-slate-400 hover:bg-slate-700"
                          onClick={() => changeUserRole(user.id, "user")}
                        >
                          Usuario Normal
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-slate-400">
                No se encontraron usuarios con los filtros actuales
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
