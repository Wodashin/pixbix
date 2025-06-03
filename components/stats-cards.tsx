import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCard {
  icon: LucideIcon
  value: string | number
  label: string
  color: string
}

interface StatsCardsProps {
  stats: StatCard[]
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-${stat.color}-500 transition-colors`}
        >
          <CardContent className="p-6 text-center">
            <stat.icon className={`h-8 w-8 mx-auto mb-3 text-${stat.color}-400`} />
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
