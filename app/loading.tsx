import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Gamepad2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header Skeleton */}
      <div className="border-b border-slate-800 bg-slate-950/95">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-cyan-500 animate-pulse" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Nobux Gaming
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-20 bg-slate-700" />
              <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-96 bg-slate-700" />
            <Skeleton className="h-6 w-64 bg-slate-700" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full bg-slate-700 mb-4" />
                  <Skeleton className="h-6 w-3/4 bg-slate-700 mb-2" />
                  <Skeleton className="h-4 w-1/2 bg-slate-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
