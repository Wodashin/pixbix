"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Send, MessageCircle, Users } from "lucide-react"

interface ChatMessage {
  id: string
  message: string
  created_at: string
  user: {
    id: string
    name: string
    username: string
    display_name: string
    avatar_url: string
  }
}

export function GlobalChat() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(42) // Simulado por ahora
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/chat/messages?limit=50")
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Polling cada 3 segundos para nuevos mensajes
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session || isSending) return

    setIsSending(true)
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages([...messages, message])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-cyan-500" />
            <span>Chat Global</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-slate-400">
            <Users className="h-4 w-4" />
            <span>{onlineUsers} online</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400">Cargando chat...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.user?.avatar_url || ""} />
                  <AvatarFallback className="text-xs">{message.user?.display_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-sm">
                      {message.user?.display_name || message.user?.username || "Usuario"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm break-words">{message.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400">No hay mensajes aún. ¡Sé el primero en escribir!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de envío */}
        {session ? (
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              maxLength={500}
              className="flex-1 bg-slate-700 border-slate-600 text-slate-100"
              disabled={isSending}
            />
            <Button type="submit" disabled={!newMessage.trim() || isSending} className="bg-cyan-600 hover:bg-cyan-700">
              {isSending ? "..." : <Send className="h-4 w-4" />}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm">Inicia sesión para participar en el chat</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
