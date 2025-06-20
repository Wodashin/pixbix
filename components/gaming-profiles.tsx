"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const { user, isLoaded } = useUser()
  const [gamingProfile, setGamingProfile] = useState<GamingProfile | null>(null)
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [favoriteGames, setFavoriteGames] = useState<string[]>([])
  const [lookingForGroup, setLookingForGroup] = useState(false)
  const [skillLevel, setSkillLevel] = useState(50)
  const [platform, setPlatform] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
        toast.success("Gaming profile saved successfully!")
      } else {
        toast.error("Failed to save gaming profile.")
      }
    } catch (error) {
      console.error("Error saving gaming profile:", error)
      toast.error("Error saving gaming profile.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              <Skeleton className="h-4 w-20" />
            </Label>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">
              <Skeleton className="h-4 w-20" />
            </Label>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gaming Profile</CardTitle>
        <CardDescription>Manage your gaming profile and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Favorite Games</Label>
          <Input
            id="favoriteGames"
            value={favoriteGames.join(", ")}
            onChange={(e) => setFavoriteGames(e.target.value.split(",").map((s) => s.trim()))}
            placeholder="Enter your favorite games, separated by commas"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="lookingForGroup">Looking for Group?</Label>
          <Switch
            id="lookingForGroup"
            checked={lookingForGroup}
            onCheckedChange={(checked) => setLookingForGroup(checked)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="skillLevel">Skill Level</Label>
          <Slider
            id="skillLevel"
            defaultValue={[skillLevel]}
            max={100}
            step={1}
            onValueChange={(value) => setSkillLevel(value[0])}
          />
          <Badge variant="secondary">Level: {skillLevel}</Badge>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="platform">Platform</Label>
          <Select value={platform} onValueChange={(value) => setPlatform(value)}>
            <SelectTrigger id="platform">
              <SelectValue placeholder="Select a platform" />
            </SelectTrigger>
            <SelectContent>
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
        <Button onClick={handleSaveProfile} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default GamingProfiles
