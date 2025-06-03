import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface Stat {
  icon: LucideIcon
  value: number | string
  label: string
  color: "cyan" | "green" | "yellow" | "purple" | "blue" | "pink" | "red"
}

interface StatsCardsProps {
  stats: Stat[]
}

export function StatsCards({ stats }: StatsCardsProps) {
  const getColorClass = (color: string) => {
    switch (color) {
      case "cyan":
        return "text-cyan-400"
      case "green":
        return "text-green-400"
      case "yellow":
        return "text-yellow-400"
      case "purple":
        return "text-purple-400"
      case "blue":
        return "text-blue-400"
      case "pink":
        return "text-pink-400"
      case "red":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getHoverBorderClass = (color: string) => {
    switch (color) {
      case "cyan":
        return "hover:border-cyan-500"
      case "green":
        return "hover:border-green-500"
      case "yellow":
        return "hover:border-yellow-500"
      case "purple":
        return "hover:border-purple-500"
      case "blue":
        return "hover:border-blue-500"
      case "pink":
        return "hover:border-pink-500"
      case "red":
        return "hover:border-red-500"
      default:
        return "hover:border-gray-500"
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className={`bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 ${getHoverBorderClass(stat.color)} transition-colors`}
          >
            <CardContent className="p-6 text-center">
              <Icon className={`h-8 w-8 mx-auto mb-3 ${getColorClass(stat.color)}`} />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
