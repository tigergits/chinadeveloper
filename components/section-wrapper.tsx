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
				<div className="mb-12 md:mb-16">
					<h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
					{description && <p className="text-lg text-muted-foreground max-w-3xl">{description}</p>}
				</div>

				{/* Section Content */}
				{children}
			</div>
		</section>
	)
}
