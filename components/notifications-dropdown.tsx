"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, MessageCircle, UserPlus, Trophy } from "lucide-react"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "achievement"
  title: string
  message: string
  read: boolean
  created_at: string
  from_user: {
    id: string
    name: string
    username: string
    display_name: string
    avatar_url: string
  }
}

export function NotificationsDropdown() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (response.ok) {
          const data = await response.json()
          setNotifications(data)
          setUnreadCount(data.filter((n: Notification) => !n.read).length)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Polling cada 30 segundos para nuevas notificaciones
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [session])

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      })

      if (response.ok) {
        setNotifications(notifications.map((n) => (notificationIds.includes(n.id) ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "achievement":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (!session) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold text-white">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead(notifications.filter((n) => !n.read).map((n) => n.id))}
              className="text-cyan-400 hover:text-cyan-300"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-700" />

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-400">Cargando notificaciones...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer ${!notification.read ? "bg-slate-700/50" : ""}`}
                onClick={() => !notification.read && markAsRead([notification.id])}
              >
                <div className="flex items-start space-x-3 w-full">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={notification.from_user?.avatar_url || ""} />
                    <AvatarFallback className="text-xs">
                      {notification.from_user?.display_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {getNotificationIcon(notification.type)}
                      <span className="font-medium text-white text-sm">{notification.title}</span>
                      {!notification.read && <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>}
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-slate-400">No tienes notificaciones</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
