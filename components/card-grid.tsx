import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: "sm" | "md" | "lg"
}

export function CardGrid({ children, columns = 3, gap = "lg" }: CardGridProps) {
  const gridColsClass = {
    1: "grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  const gapClass = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  }

  return <div className={cn("grid grid-cols-1", gridColsClass[columns], gapClass[gap])}>{children}</div>
}

