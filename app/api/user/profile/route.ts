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

    // Try to get user from database, but don't fail if it doesn't exist
    let profile = null

    try {
      const { data: dbUser, error: dbError } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (!dbError && dbUser) {
        profile = dbUser
      }
    } catch (dbError) {
      console.log("Database user not found, creating from auth user")
    }

    // If no database profile, create one from auth user
    if (!profile) {
      profile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        username: user.user_metadata?.preferred_username || null,
        image: user.user_metadata?.avatar_url || null,
        role: "user",
        level: 1,
        bio: null,
        location: null,
        website: null,
        created_at: user.created_at,
        updated_at: new Date().toISOString(),
      }

      // Try to insert into database, but don't fail if it doesn't work
      try {
        const { data: insertedUser } = await supabase.from("users").insert([profile]).select().single()

        if (insertedUser) {
          profile = insertedUser
        }
      } catch (insertError) {
        console.log("Could not insert user into database, using fallback profile")
      }
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
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("username", username)
          .neq("id", user.id)
          .single()

        if (existingUser) {
          return NextResponse.json({ error: "Username already taken" }, { status: 400 })
        }
      } catch (e) {
        // Username check failed, but continue
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

    // Try to update user profile
    try {
      const { data: updatedProfile, error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({ user: updatedProfile })
    } catch (updateError) {
      console.error("Update error:", updateError)

      // If update fails, try to insert the user first
      try {
        const newUser = {
          id: user.id,
          email: user.email,
          name: updateData.name || user.user_metadata?.full_name || null,
          username: updateData.username || null,
          bio: updateData.bio || null,
          location: updateData.location || null,
          website: updateData.website || null,
          image: user.user_metadata?.avatar_url || null,
          role: "user",
          level: 1,
          created_at: user.created_at,
          updated_at: updateData.updated_at,
        }

        const { data: insertedUser, error: insertError } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        return NextResponse.json({ user: insertedUser })
      } catch (insertError) {
        console.error("Insert error:", insertError)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
