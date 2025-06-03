"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon, Smile, Calendar, X, Trophy, Gamepad2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { GameSelectorModal } from "./game-selector-modal"
import { AchievementSelectorModal } from "./achievement-selector-modal"

export function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showGameModal, setShowGameModal] = useState(false)
  const [showAchievementModal, setShowAchievementModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setMessage({ type: "error", text: "El contenido no puede estar vacío" })
      return
    }

    if (!session?.user?.email) {
      setMessage({ type: "error", text: "Debes estar autenticado para crear un post" })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      console.log("🚀 Sending post request...")
      console.log("👤 Current session:", session?.user?.email)

      const cookies = document.cookie

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
          "X-User-Email": session.user.email,
        },
        credentials: "include",
        body: JSON.stringify({
          content: content.trim(),
          tags,
        }),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Error response:", errorData)
        throw new Error(errorData.error || "Error al crear el post")
      }

      const result = await response.json()
      console.log("✅ Post created:", result)

      setMessage({ type: "success", text: "¡Post creado exitosamente!" })
      setContent("")
      setTags([])
      setCurrentTag("")

      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error("💥 Error creating post:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al crear el post",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addTag()
    }
  }

  const handleGameSelect = (game: any) => {
    const gameTag = `juego-${game.name.toLowerCase().replace(/\s+/g, "-")}`
    if (!tags.includes(gameTag)) {
      setTags([...tags, gameTag])
    }
  }

  const handleAchievementSelect = (achievement: any) => {
    const achievementTag = `logro-${achievement.id}`
    if (!tags.includes(achievementTag)) {
      setTags([...tags, achievementTag])
    }
  }

  if (!session) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">
            <p>Debes iniciar sesión para crear un post</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="¿Qué está pasando en el gaming?"
                  className="min-h-[120px] bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 resize-none"
                  maxLength={500}
                />
                <div className="text-right text-sm text-slate-400 mt-1">{content.length}/500</div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  let displayTag = tag
                  let tagStyle = "inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-600 text-white"

                  if (tag.startsWith("logro-")) {
                    displayTag = `🏆 ${tag.replace("logro-", "").toUpperCase()}`
                    tagStyle =
                      "inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-500 text-black font-semibold"
                  } else if (tag.startsWith("juego-")) {
                    displayTag = `🎮 ${tag.replace("juego-", "").replace(/-/g, " ")}`
                    tagStyle = "inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
                  } else {
                    displayTag = `#${tag}`
                  }

                  return (
                    <span key={tag} className={tagStyle}>
                      {displayTag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-red-300">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Añadir tag..."
                  className="flex-1 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400 text-sm"
                />
                <Button type="button" onClick={addTag} size="sm" variant="outline" className="border-slate-600">
                  Añadir
                </Button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-900/20 text-green-400 border border-green-800"
                    : "bg-red-900/20 text-red-400 border border-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="flex items-center space-x-4">
                <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-300"
                  onClick={() => setShowGameModal(true)}
                >
                  <Gamepad2 className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-300"
                  onClick={() => setShowAchievementModal(true)}
                >
                  <Trophy className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300">
                  <Calendar className="h-5 w-5" />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modales */}
      <GameSelectorModal isOpen={showGameModal} onClose={() => setShowGameModal(false)} onSelect={handleGameSelect} />

      <AchievementSelectorModal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        onSelect={handleAchievementSelect}
      />
    </>
  )
}
