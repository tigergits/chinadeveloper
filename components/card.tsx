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
        "bg-card border border-border rounded-lg p-6 transition-all duration-300 will-change-transform",
        hover && "hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </div>
  )
}

