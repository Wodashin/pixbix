"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPost } from "@/lib/api/posts"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Game } from "@/types"
import type { Achievement } from "@/types/achievement"
import { SimpleImageUpload } from "@/components/simple-image-upload"

interface CreatePostProps {
  games: Game[]
  achievements: Achievement[]
}

export function CreatePost({ games, achievements }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      setContent("")
      setSelectedGame(null)
      setSelectedAchievement(null)
      setImageUrl("")
      toast({
        title: "Post created!",
        description: "Your post has been successfully created.",
      })
    },
    onError: () => {
      toast({
        title: "Something went wrong.",
        description: "There was an error creating your post.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const postData = {
      content,
      game_id: selectedGame?.id || null,
      achievement_id: selectedAchievement?.id || null,
      image_url: imageUrl || null, // Agregar esta línea
    }

    mutation.mutate(postData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium">
          Content
        </label>
        <textarea
          id="content"
          className="w-full border rounded-md p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Imagen (opcional)</label>
        <SimpleImageUpload onUpload={setImageUrl} />
      </div>

      <div>
        <Select onValueChange={(value) => setSelectedGame(games.find((game) => game.id === value) || null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a game" defaultValue={selectedGame?.id} />
          </SelectTrigger>
          <SelectContent>
            {games.map((game) => (
              <SelectItem key={game.id} value={game.id}>
                {game.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select
          onValueChange={(value) =>
            setSelectedAchievement(achievements.find((achievement) => achievement.id === value) || null)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an achievement" defaultValue={selectedAchievement?.id} />
          </SelectTrigger>
          <SelectContent>
            {achievements.map((achievement) => (
              <SelectItem key={achievement.id} value={achievement.id}>
                {achievement.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? "Creating..." : "Create Post"}
      </button>
    </form>
  )
}
