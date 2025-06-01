"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Companion } from "@/types/companions"

interface UseCompanionsOptions {
  limit?: number
  offset?: number
  gameFilter?: string
  serviceFilter?: string
  priceRange?: [number, number]
  ratingFilter?: number
  languageFilter?: string
  sortBy?: "rating" | "price" | "sessions" | "recent"
}

export function useCompanions(options: UseCompanionsOptions = {}) {
  const [companions, setCompanions] = useState<Companion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const supabase = createClient()

  const {
    limit = 12,
    offset = 0,
    gameFilter,
    serviceFilter,
    priceRange,
    ratingFilter,
    languageFilter,
    sortBy = "rating",
  } = options

  const fetchCompanions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Query base para compañeros activos y verificados
      let query = supabase
        .from("companions")
        .select(`
          *,
          users!companions_user_id_fkey (
            id,
            name,
            real_name,
            username,
            avatar_url
          )
        `)
        .eq("is_active", true)
        .eq("is_verified", true)

      // Aplicar filtros
      if (priceRange) {
        query = query.gte("hourly_rate", priceRange[0]).lte("hourly_rate", priceRange[1])
      }

      if (ratingFilter) {
        query = query.gte("average_rating", ratingFilter)
      }

      if (languageFilter) {
        query = query.contains("languages", [languageFilter])
      }

      // Aplicar ordenamiento
      switch (sortBy) {
        case "rating":
          query = query.order("average_rating", { ascending: false })
          break
        case "price":
          query = query.order("hourly_rate", { ascending: true })
          break
        case "sessions":
          query = query.order("total_sessions", { ascending: false })
          break
        case "recent":
          query = query.order("created_at", { ascending: false })
          break
      }

      // Aplicar paginación
      query = query.range(offset, offset + limit - 1)

      const { data: companionsData, error: companionsError, count } = await query

      if (companionsError) throw companionsError

      // Para cada compañero, obtener sus servicios y juegos
      const companionsWithDetails = await Promise.all(
        companionsData.map(async (companion) => {
          // Obtener servicios
          const { data: services } = await supabase
            .from("companion_services")
            .select("*")
            .eq("companion_id", companion.id)
            .eq("is_active", true)

          // Obtener juegos
          let games: any[] = []
          if (gameFilter) {
            const { data: gameData } = await supabase
              .from("companion_games")
              .select("*")
              .eq("companion_id", companion.id)
              .ilike("game_name", `%${gameFilter}%`)
            games = gameData || []
          } else {
            const { data: gameData } = await supabase
              .from("companion_games")
              .select("*")
              .eq("companion_id", companion.id)
              .limit(5)
            games = gameData || []
          }

          // Obtener algunas reseñas recientes
          const { data: reviews } = await supabase
            .from("reviews")
            .select(`
              *,
              users!reviews_reviewer_id_fkey (
                name,
                username,
                avatar_url
              )
            `)
            .eq("companion_id", companion.id)
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(3)

          return {
            ...companion,
            user: companion.users,
            services: services || [],
            games: games || [],
            reviews:
              reviews?.map((review) => ({
                ...review,
                reviewer: review.users,
              })) || [],
          }
        }),
      )

      // Filtrar por juego si es necesario (después de obtener los datos)
      let filteredCompanions = companionsWithDetails
      if (gameFilter) {
        filteredCompanions = companionsWithDetails.filter((companion) =>
          companion.games.some((game) => game.game_name.toLowerCase().includes(gameFilter.toLowerCase())),
        )
      }

      // Filtrar por tipo de servicio
      if (serviceFilter) {
        filteredCompanions = filteredCompanions.filter((companion) =>
          companion.services.some((service) => service.service_type === serviceFilter),
        )
      }

      setCompanions(filteredCompanions)
      setTotalCount(count || 0)
    } catch (err) {
      console.error("Error fetching companions:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanions()
  }, [limit, offset, gameFilter, serviceFilter, priceRange, ratingFilter, languageFilter, sortBy])

  return {
    companions,
    loading,
    error,
    totalCount,
    refetch: fetchCompanions,
  }
}
