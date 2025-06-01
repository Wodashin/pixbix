import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

// Creamos un singleton para el cliente de Supabase en el navegador
let supabaseClient: ReturnType<typeof supabaseCreateClient> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  supabaseClient = supabaseCreateClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  )

  return supabaseClient
}
