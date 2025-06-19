"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider-supabase"
import { toast } from "@/hooks/use-toast"
import {
  Loader2,
  Edit3,
  Check,
  X,
  Mail,
  Calendar,
  Crown,
  Settings,
  MessageSquare,
  Trophy,
  Camera,
  Plus,
  ExternalLink,
  Gamepad2,
} from "lucide-react"

interface UserProfile {
  id: string
  email: string
  name: string | null
  username: string | null
  image: string | null
  role: string
  level: number
  bio: string | null
  location: string | null
  website: string | null
  created_at: string
  updated_at: string
}

interface UserStats {
  posts: number
  likes: number
  matches: number
  achievements: number
  rating: number
  level: number
}

interface GalleryImage {
  id: string
  title: string
  description: string | null
  image_url: string
  is_public: boolean
  created_at: string
}

interface GamingProfile {
  id: string
  game: string
  username: string
  rank: string
  level: number
  tracker_url: string | null
  created_at: string
}

export function EnhancedUserProfileFixed() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    posts: 2,
    likes: 20,
    matches: 42,
    achievements: 15,
    rating: 4.8,
    level: 12,
  })
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [gamingProfiles, setGamingProfiles] = useState<GamingProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("information")

  // Editing states
  const [editingName, setEditingName] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [newName, setNewName] = useState("")
  const [newBio, setNewBio] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to load profile
      const profileResponse = await fetch("/api/user/profile")

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.user)
        setNewName(profileData.user.name || "")
        setNewBio(profileData.user.bio || "")

        // Update stats with real level
        setStats((prev) => ({
          ...prev,
          level: profileData.user.level || 1,
        }))
      } else {
        // Create fallback profile from auth user
        if (user) {
          const fallbackProfile: UserProfile = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            username: user.user_metadata?.preferred_username || null,
            image: user.user_metadata?.avatar_url || null,
            role: "user",
            level: 1,
            bio: null,
            location: null,
            website: null,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setProfile(fallbackProfile)
          setNewName(fallbackProfile.name || "")
          setNewBio("")
        }
      }

      // Try to load gallery (optional)
      try {
        const galleryResponse = await fetch("/api/user/gallery")
        if (galleryResponse.ok) {
          const galleryData = await galleryResponse.json()
          setGallery(galleryData.images || [])
        }
      } catch (e) {
        console.log("Gallery not available")
      }

      // Try to load gaming profiles (optional)
      try {
        const gamingResponse = await fetch("/api/user/gaming-profiles")
        if (gamingResponse.ok) {
          const gamingData = await gamingResponse.json()
          setGamingProfiles(gamingData.profiles || [])
        }
      } catch (e) {
        console.log("Gaming profiles not available")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setUpdating(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        toast({
          title: "Success!",
          description: "Profile updated successfully",
        })
        return true
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update profile",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
      return false
    } finally {
      setUpdating(false)
    }
  }

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      })
      return
    }

    const success = await updateProfile({ name: newName.trim() })
    if (success) {
      setEditingName(false)
    }
  }

  const handleBioUpdate = async () => {
    const success = await updateProfile({ bio: newBio.trim() || null })
    if (success) {
      setEditingBio(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRankColor = (rank: string) => {
    const rankColors: { [key: string]: string } = {
      Iron: "bg-gray-600",
      Bronze: "bg-amber-700",
      Silver: "bg-gray-400",
      Gold: "bg-yellow-500",
      Platinum: "bg-cyan-400",
      Diamond: "bg-blue-500",
      Ascendant: "bg-green-500",
      Immortal: "bg-red-500",
      Radiant: "bg-purple-500",
    }
    return rankColors[rank] || "bg-gray-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8">
          <CardContent>
            <h1 className="text-2xl font-bold text-white mb-4">Unable to load profile</h1>
            {error && <p className="text-red-400 mb-4">Error: {error}</p>}
            <Button onClick={loadProfileData} className="bg-purple-600 hover:bg-purple-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-slate-700 mb-8 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
              {/* Left side - Avatar and Info */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-32 w-32 border-4 border-cyan-400">
                  <AvatarImage src={profile.image || ""} alt={profile.name || "User"} />
                  <AvatarFallback className="bg-slate-700 text-cyan-400 text-4xl">
                    {(profile.name || profile.email)?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white text-2xl font-bold"
                          placeholder="Full name"
                        />
                        <Button
                          size="sm"
                          onClick={handleNameUpdate}
                          disabled={updating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewName(profile.name || "")
                            setEditingName(false)
                          }}
                          className="border-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-white">{profile.name || "Unnamed User"}</h1>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingName(true)}
                          className="text-slate-400 hover:text-white p-1 h-auto"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <Badge className="bg-purple-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      {profile.role === "admin" ? "Admin" : "Gamer"}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-1 text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {formatDate(profile.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Right side - Configuration button */}
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Settings className="w-4 h-4 mr-2" />
                Configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.posts}</div>
              <div className="text-slate-400 text-sm">Posts</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.likes}</div>
              <div className="text-slate-400 text-sm">Likes</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.matches}</div>
              <div className="text-slate-400 text-sm">Partidas</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.achievements}</div>
              <div className="text-slate-400 text-sm">Logros</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.rating}</div>
              <div className="text-slate-400 text-sm">Valoración</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.level}</div>
              <div className="text-slate-400 text-sm">Nivel</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/90 backdrop-blur-sm">
            <TabsTrigger value="information" className="data-[state=active]:bg-purple-600">
              Información
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-purple-600">
              Mis Posts
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">
              Actividad
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-purple-600">
              Galería
            </TabsTrigger>
            <TabsTrigger value="gaming" className="data-[state=active]:bg-purple-600">
              Gaming
            </TabsTrigger>
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="information">
            <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-slate-400 text-sm">Full Name</label>
                  <p className="text-white font-medium">{profile.name || "Not specified"}</p>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Username</label>
                  <p className="text-white font-medium">@{profile.username || "no-username"}</p>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Bio</label>
                  {editingBio ? (
                    <div className="space-y-2">
                      <Textarea
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleBioUpdate}
                          disabled={updating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewBio(profile.bio || "")
                            setEditingBio(false)
                          }}
                          className="border-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-white font-medium flex-1">{profile.bio || "No bio available"}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingBio(true)}
                        className="text-slate-400 hover:text-white p-1 h-auto"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Email</label>
                  <p className="text-white font-medium">{profile.email}</p>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Level</label>
                  <p className="text-white font-medium">Level {profile.level}</p>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Role</label>
                  <p className="text-white font-medium">{profile.role === "admin" ? "Administrator" : "User"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">My Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No posts yet</p>
                  <p className="text-slate-500 text-sm">Share your gaming experiences!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No recent activity</p>
                  <p className="text-slate-500 text-sm">Start gaming to see your activity!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Gallery
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gallery.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <p className="text-white font-medium">{image.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No images in gallery</p>
                    <p className="text-slate-500 text-sm">Upload your gaming screenshots!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gaming Tab */}
          <TabsContent value="gaming">
            <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Gaming Profiles
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Profile
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gamingProfiles.length > 0 ? (
                  <div className="grid gap-4">
                    {gamingProfiles.map((profile) => (
                      <Card key={profile.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">🎮</div>
                              <div>
                                <h3 className="text-white font-bold">{profile.game}</h3>
                                <p className="text-slate-400">@{profile.username}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={`${getRankColor(profile.rank)} text-white`}>{profile.rank}</Badge>
                              <span className="text-yellow-400 font-bold">Lvl {profile.level}</span>
                              {profile.tracker_url && (
                                <Button size="sm" variant="outline" className="border-slate-600">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Tracker
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gamepad2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No gaming profiles</p>
                    <p className="text-slate-500 text-sm">Add your gaming profiles!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
