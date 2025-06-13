import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/database.types"

export async function updateSession(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })

  // Esto actualiza la sesión si existe y está por expirar
  await supabase.auth.getSession()

  return res
}
