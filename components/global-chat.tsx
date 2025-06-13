"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider-supabase"

interface ChatMessage {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  timestamp: string
}

export function GlobalChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState(42)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Simular mensajes iniciales
    const initialMessages: ChatMessage[] = [
      {
        id: "1",
        content: "¡Hola a todos! ¿Alguien quiere jugar Valorant?",
        author: { name: "GamerPro", avatar: "/placeholder.svg?height=32&width=32" },
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "2",
        content: "¡Yo me apunto! ¿Qué rango eres?",
        author: { name: "PixelHunter", avatar: "/placeholder.svg?height=32&width=32" },
        timestamp: new Date(Date.now() - 240000).toISOString(),
      },
      {
        id: "3",
        content: "Diamante 2, ¿y tú?",
        author: { name: "GamerPro", avatar: "/placeholder.svg?height=32&width=32" },
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
    ]
    setMessages(initialMessages)
  }, [])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      author: {
        name: user.user_metadata?.name || user.email || "Usuario",
        avatar: user.user_metadata?.avatar_url,
      },
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Aquí iría la lógica para enviar el mensaje al servidor
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      })
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <span>Chat Global</span>
          <div className="flex items-center text-sm text-slate-400">
            <Users className="h-4 w-4 mr-1" />
            {onlineUsers} en línea
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.author.avatar || "/placeholder.svg"} />
                <AvatarFallback>{message.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-white text-sm">{message.author.name}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(message.timestamp).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Área de entrada */}
        <div className="border-t border-slate-700 p-4">
          {user ? (
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-400 text-sm">Inicia sesión para participar en el chat</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
