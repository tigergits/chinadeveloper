import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Download } from "lucide-react"
import type { ShowcaseCard as ShowcaseCardData } from "@/lib/showcase"

export interface ShowcaseCardLabels {
	install: string
	comingSoon: string
	details: string
}

interface ShowcaseCardProps {
	card: ShowcaseCardData
	locale: string
	labels: ShowcaseCardLabels
}

function LogoTile({ card, size = "md" }: { card: ShowcaseCardData; size?: "md" | "sm" }) {
	const dim = size === "md" ? "h-14 w-14" : "h-10 w-10"
	const bg = card.gradient
		? { background: `linear-gradient(135deg, ${card.gradient.join(", ")})` }
		: undefined
	if (card.logo) {
		return (
			<div
				className={`${dim} flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center border border-border/50 shadow-sm`}
				style={bg}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={card.logo}
					alt={`${card.name} logo`}
					className={card.gradient ? "h-2/3 w-2/3 object-contain" : "h-full w-full object-cover"}
				/>
			</div>
		)
	}
	// 无 logo：品牌色渐变 + 首字母
	return (
		<div
			className={`${dim} flex-shrink-0 rounded-2xl flex items-center justify-center border border-border/50 shadow-sm bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg`}
		>
			{card.name.charAt(0).toUpperCase()}
		</div>
	)
}

export function ShowcaseCard({ card, locale, labels }: ShowcaseCardProps) {
	const detailHref = `/${locale}/portfolios/showcase/${card.slug}`
	const cover = card.screenshots[0]

	return (
		<div className="group card-hover relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300">
			<Link href={detailHref} className="block">
				{cover ? (
					<div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
						<Image
							src={cover.src}
							alt={cover.caption || card.name}
							fill
							sizes="(max-width: 768px) 100vw, 33vw"
							className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent" />
					</div>
				) : (
					<div className="relative aspect-[16/10] w-full bg-gradient-to-br from-muted to-card" />
				)}
			</Link>

			<div className="flex flex-1 flex-col gap-3 p-5">
				<div className="flex items-start gap-3">
					<LogoTile card={card} />
					<div className="min-w-0 flex-1">
						<Link href={detailHref}>
							<h3 className="truncate text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary">
								{card.name}
							</h3>
						</Link>
						<p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
							{card.categoryLabel}
						</p>
					</div>
				</div>

				<p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{card.short}</p>

				<div className="mt-auto flex items-center gap-3 pt-2">
					{card.installUrl ? (
						<a
							href={card.installUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							<Download className="h-4 w-4" />
							<span>{labels.install}</span>
						</a>
					) : (
						<span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
							{labels.comingSoon}
						</span>
					)}
					<Link
						href={detailHref}
						className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-all hover:gap-2"
					>
						<span>{labels.details}</span>
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</div>
	)
}
