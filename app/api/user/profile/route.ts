import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 401 })
    }

    // Use direct SQL query to avoid policy recursion
    const { data: profile, error: profileError } = await supabase.rpc("get_user_profile", { user_id: user.id })

    if (profileError) {
      console.error("Profile error:", profileError)

      // Fallback: try direct select with service role if available
      const { data: fallbackProfile, error: fallbackError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (fallbackError) {
        console.error("Fallback error:", fallbackError)

        // Last resort: create basic profile from auth user
        const basicProfile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          username: user.user_metadata?.preferred_username || null,
          image: user.user_metadata?.avatar_url || null,
          role: "user",
          level: 1,
          created_at: user.created_at,
          updated_at: new Date().toISOString(),
        }

        return NextResponse.json({ user: basicProfile })
      }

      return NextResponse.json({ user: fallbackProfile })
    }

    return NextResponse.json({ user: profile })
  } catch (error) {
    console.error("Unexpected error in profile API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, bio, location, website } = body

    // Check if username is already taken (if updating username)
    if (username) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .single()

      if (existingUser) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (website !== undefined) updateData.website = website

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ user: updatedProfile })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
