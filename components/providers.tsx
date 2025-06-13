"use client"

import type React from "react"

// Ya no necesitamos SessionProvider de NextAuth
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
