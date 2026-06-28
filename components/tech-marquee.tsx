const TECHS = [
	"TypeScript",
	"React",
	"Next.js",
	"Node.js",
	"Python",
	"Go",
	"React Native",
	"Flutter",
	"PostgreSQL",
	"Redis",
	"Docker",
	"AWS",
	"Claude Code",
	"Cursor",
	"Codex",
	"Tailwind CSS",
	"Java",
	"C++",
]

export function TechMarquee() {
	// Duplicate the list so the -50% translate loops seamlessly
	const items = [...TECHS, ...TECHS]
	return (
		<section className="border-y border-border/50 bg-muted/20 py-8" aria-label="Technologies I work with">
			<div className="marquee-mask overflow-hidden">
				<div className="flex w-max animate-marquee gap-3">
					{items.map((tech, i) => (
						<span
							key={i}
							className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 font-mono text-sm font-medium text-foreground/80"
						>
							{tech}
						</span>
					))}
				</div>
			</div>
		</section>
	)
}
