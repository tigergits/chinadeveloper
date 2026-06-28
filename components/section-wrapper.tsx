import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionWrapperProps {
	id: string
	title: string
	description?: string
	children: ReactNode
	className?: string
}

export function SectionWrapper({ id, title, description, children, className }: SectionWrapperProps) {
	return (
		<section id={id} className={cn("py-20 md:py-24 ", className)}>
			<div className="max-w-7xl mx-auto px-8">
				{/* Section Header */}
				<div className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
					<h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{title}</h2>
					<div className="mx-auto mb-5 h-1 w-16 rounded-full bg-gradient-to-r from-[var(--grad-start)] to-[var(--grad-end)]" />
					{description && <p className="text-lg text-muted-foreground">{description}</p>}
				</div>

				{/* Section Content */}
				{children}
			</div>
		</section>
	)
}
