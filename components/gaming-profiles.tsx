"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider-supabase"

interface GamingProfile {
  id: string
  userId: string
  username: string
  bio: string
  favoriteGames: string[]
  lookingForGroup: boolean
  skillLevel: number
  platform: string
}

const GamingProfiles = () => {
  const { user, loading } = useAuth()
  const [gamingProfile, setGamingProfile] = useState<GamingProfile | null>(null)
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [favoriteGames, setFavoriteGames] = useState<string[]>([])
  const [lookingForGroup, setLookingForGroup] = useState(false)
  const [skillLevel, setSkillLevel] = useState(50)
  const [platform, setPlatform] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!user) return

    const fetchGamingProfile = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/gaming-profiles?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setGamingProfile(data)
          setUsername(data.username)
          setBio(data.bio)
          setFavoriteGames(data.favoriteGames)
          setLookingForGroup(data.lookingForGroup)
          setSkillLevel(data.skillLevel)
          setPlatform(data.platform)
        } else {
          setGamingProfile(null)
          setUsername("")
          setBio("")
          setFavoriteGames([])
          setLookingForGroup(false)
          setSkillLevel(50)
          setPlatform("")
          console.error("Failed to fetch gaming profile")
        }
      } catch (error) {
        console.error("Error fetching gaming profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGamingProfile()
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return

    setIsLoading(true)
    setMessage("")
    try {
      const response = await fetch("/api/gaming-profiles", {
        method: gamingProfile ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: gamingProfile?.id,
          userId: user.id,
          username,
          bio,
          favoriteGames,
          lookingForGroup,
          skillLevel,
          platform,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGamingProfile(data)
        setMessage("Gaming profile saved successfully!")
      } else {
        setMessage("Failed to save gaming profile.")
      }
    } catch (error) {
      console.error("Error saving gaming profile:", error)
      setMessage("Error saving gaming profile.")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            <Skeleton className="h-6 w-32 bg-slate-600" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64 bg-slate-600" />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-300">
              <Skeleton className="h-4 w-20 bg-slate-600" />
            </Label>
            <Skeleton className="h-10 w-full bg-slate-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-slate-300">
              <Skeleton className="h-4 w-20 bg-slate-600" />
            </Label>
            <Skeleton className="h-10 w-full bg-slate-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Gaming Profile</CardTitle>
          <CardDescription className="text-slate-400">Please log in to manage your gaming profile.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Gaming Profile</CardTitle>
        <CardDescription className="text-slate-400">Manage your gaming profile and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.includes("successfully")
                ? "bg-green-900/50 text-green-300 border border-green-800"
                : "bg-red-900/50 text-red-300 border border-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="username" className="text-slate-300">
            Username
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio" className="text-slate-300">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>

        <div className="grid gap-2">
          <Label className="text-slate-300">Favorite Games</Label>
          <Input
            id="favoriteGames"
            value={favoriteGames.join(", ")}
            onChange={(e) => setFavoriteGames(e.target.value.split(",").map((s) => s.trim()))}
            placeholder="Enter your favorite games, separated by commas"
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="lookingForGroup" className="text-slate-300">
            Looking for Group?
          </Label>
          <Switch
            id="lookingForGroup"
            checked={lookingForGroup}
            onCheckedChange={(checked) => setLookingForGroup(checked)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="skillLevel" className="text-slate-300">
            Skill Level
          </Label>
          <Slider
            id="skillLevel"
            defaultValue={[skillLevel]}
            max={100}
            step={1}
            onValueChange={(value) => setSkillLevel(value[0])}
            className="w-full"
          />
          <Badge variant="secondary" className="w-fit">
            Level: {skillLevel}
          </Badge>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="platform" className="text-slate-300">
            Platform
          </Label>
          <Select value={platform} onValueChange={(value) => setPlatform(value)}>
            <SelectTrigger id="platform" className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="Select a platform" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="PC">PC</SelectItem>
              <SelectItem value="PlayStation">PlayStation</SelectItem>
              <SelectItem value="Xbox">Xbox</SelectItem>
              <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveProfile} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default GamingProfiles
