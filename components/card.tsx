import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-6 transition-all duration-300",
        hover && "hover:border-primary hover:shadow-lg hover:scale-105",
        className,
      )}
    >
      {children}
    </div>
  )
}

