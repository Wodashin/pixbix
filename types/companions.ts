export interface Companion {
  id: string
  user_id: string
  is_active: boolean
  is_verified: boolean
  hourly_rate: number
  bio?: string
  experience_years: number
  languages: string[]
  availability_schedule: Record<string, any>
  total_sessions: number
  total_earnings: number
  average_rating: number
  response_time_minutes: number
  created_at: string
  updated_at: string
  // Datos del usuario relacionado
  user?: {
    id: string
    name: string
    real_name: string
    username: string
    avatar_url: string
  }
  // Servicios y juegos
  services?: CompanionService[]
  games?: CompanionGame[]
  reviews?: Review[]
}

export interface CompanionService {
  id: string
  companion_id: string
  service_type: "gaming" | "chat" | "coaching" | "streaming"
  name: string
  description?: string
  price_per_hour: number
  min_duration_minutes: number
  max_duration_minutes: number
  is_active: boolean
  created_at: string
}

export interface CompanionGame {
  id: string
  companion_id: string
  game_name: string
  skill_level: "beginner" | "intermediate" | "advanced" | "professional"
  rank_info?: string
  hours_played: number
  can_coach: boolean
  created_at: string
}

export interface Booking {
  id: string
  client_id: string
  companion_id: string
  service_id: string
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  scheduled_start: string
  scheduled_end: string
  duration_minutes: number
  total_price: number
  payment_status: "pending" | "paid" | "refunded"
  special_requests?: string
  companion_notes?: string
  created_at: string
  updated_at: string
  // Datos relacionados
  companion?: Companion
  service?: CompanionService
  client?: {
    id: string
    name: string
    username: string
    avatar_url: string
  }
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  companion_id: string
  rating: number
  comment?: string
  is_public: boolean
  created_at: string
  // Datos del reviewer
  reviewer?: {
    name: string
    username: string
    avatar_url: string
  }
}
