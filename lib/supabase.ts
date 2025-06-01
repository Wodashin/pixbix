import { createClient } from "@supabase/supabase-js"

console.log("🔧 Configurando Supabase...")
console.log("🌐 URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("🔑 Anon Key existe:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log("🔑 Service Role Key existe:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("❌ Faltan variables de entorno de Supabase")
}

// Cliente para el servidor (con permisos completos) - CONFIGURACIÓN CORREGIDA
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
  // Removemos la configuración de fetch personalizada que causaba problemas
})

// Cliente para el cliente (solo lectura)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)

console.log("✅ Supabase configurado correctamente")
