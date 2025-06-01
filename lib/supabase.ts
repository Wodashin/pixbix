import { createClient } from "@supabase/supabase-js"

console.log("🔧 Configurando Supabase...")
console.log("🌐 URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("🔑 Anon Key existe:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log("🔑 Service Role Key existe:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Verificar variables críticas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Faltan variables críticas de Supabase")
  throw new Error("Variables de entorno de Supabase no configuradas")
}

// Cliente para el cliente (solo lectura) - SIEMPRE disponible
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Cliente para el servidor (con permisos completos) - OPCIONAL
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: "public",
      },
    })
  : null

// Función helper para verificar si el admin está disponible
export const isAdminAvailable = () => !!supabaseAdmin

console.log("✅ Supabase configurado correctamente")
console.log("🔧 Admin disponible:", isAdminAvailable())
