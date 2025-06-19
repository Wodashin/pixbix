"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider-supabase"
import { toast } from "@/hooks/use-toast"
import { Loader2, Edit3, Check, X, User, Mail, Calendar, Crown } from "lucide-react"

interface BasicProfile {
  id: string
  email: string
  name: string | null
  username: string | null
  image: string | null
  role: string
  level: number
  created_at: string
  updated_at: string
}

export function SimpleProfileFallback() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<BasicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user/profile")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setProfile(data.user)
      setNewName(data.user.name || "")
    } catch (error) {
      console.error("Error loading profile:", error)
      setError(error instanceof Error ? error.message : "Unknown error")

      // Create fallback profile from auth user
      if (user) {
        const fallbackProfile: BasicProfile = {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          username: user.user_metadata?.preferred_username || null,
          image: user.user_metadata?.avatar_url || null,
          role: "user",
          level: 1,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setProfile(fallbackProfile)
        setNewName(fallbackProfile.name || "")
      }
    } finally {
      setLoading(false)
    }
  }

  const updateName = async () => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setEditingName(false)
        toast({
          title: "Success!",
          description: "Name updated successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update name",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating name:", error)
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[400px] flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8">
          <CardContent>
            <h1 className="text-2xl font-bold text-white mb-4">Unable to load profile</h1>
            {error && <p className="text-red-400 mb-4">Error: {error}</p>}
            <Button onClick={fetchProfile} className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar and basic info */}
            <div className="flex items-center space-x-6">
              <Avatar className="h-32 w-32 border-4 border-cyan-400">
                <AvatarImage src={profile.image || ""} alt={profile.name || "User"} />
                <AvatarFallback className="bg-slate-700 text-cyan-400 text-4xl">
                  {(profile.name || profile.email)?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
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
                        onClick={updateName}
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

                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-yellow-400">Level {profile.level}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-yellow-900/20 border-yellow-600 mb-6">
          <CardContent className="p-4">
            <p className="text-yellow-400">
              <strong>Note:</strong> Some features may be limited due to database connectivity issues. Error: {error}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm">Full Name</label>
            <p className="text-white font-medium">{profile.name || "Not specified"}</p>
          </div>

          <div>
            <label className="text-slate-400 text-sm">Email</label>
            <p className="text-white font-medium">{profile.email}</p>
          </div>

          <div>
            <label className="text-slate-400 text-sm">Username</label>
            <p className="text-white font-medium">@{profile.username || "no-username"}</p>
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
    </div>
  )
}
