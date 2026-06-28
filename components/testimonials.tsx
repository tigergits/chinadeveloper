import { Star } from "lucide-react"
import { Card } from "@/components/card"
import { CardGrid } from "@/components/card-grid"
import { SectionWrapper } from "@/components/section-wrapper"

export interface Testimonial {
	quote: string
	name: string
	role: string
	location?: string
}

interface TestimonialsProps {
	title: string
	description?: string
	items: Testimonial[]
	reviewsUrl?: string
	reviewsLabel?: string
}

export function Testimonials({ title, description, items, reviewsUrl, reviewsLabel }: TestimonialsProps) {
	if (!items?.length) return null

	return (
		<SectionWrapper id="testimonials" title={title} description={description} className="bg-muted/20">
			<CardGrid columns={3}>
				{items.map((t, i) => (
					<Card key={i} className="flex h-full flex-col">
						<div className="mb-3 flex gap-1 text-primary">
							{Array.from({ length: 5 }).map((_, s) => (
								<Star key={s} className="h-4 w-4 fill-current" />
							))}
						</div>
						<p className="mb-6 flex-1 leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-semibold text-primary-foreground">
								{t.name.charAt(0)}
							</div>
							<div>
								<div className="text-sm font-semibold">{t.name}</div>
								<div className="text-xs text-muted-foreground">
									{t.role}
									{t.location ? ` · ${t.location}` : ""}
								</div>
							</div>
						</div>
					</Card>
				))}
			</CardGrid>
			{reviewsUrl && reviewsLabel && (
				<div className="mt-8 text-center">
					<a
						href={reviewsUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 font-medium text-primary transition-transform hover:translate-x-1"
					>
						{reviewsLabel}
					</a>
				</div>
			)}
		</SectionWrapper>
	)
}
