import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Download, Globe, Chrome, Monitor, Smartphone, MessageSquare } from "lucide-react"
import type { ExplorerItem, ShowcasePlatform } from "@/lib/showcase"

export interface ShowcaseCardLabels {
	install: string
	comingSoon: string
	details: string
	status: Record<string, string>
	platforms: Record<string, string>
}

interface ShowcaseCardProps {
	card: ExplorerItem
	labels: ShowcaseCardLabels
}

const platformIcons: Record<ShowcasePlatform, typeof Globe> = {
	web: Globe,
	extension: Chrome,
	desktop: Monitor,
	mobile: Smartphone,
	wechat: MessageSquare,
}

function LogoTile({ card }: { card: ExplorerItem }) {
	const bg = card.gradient
		? { background: `linear-gradient(135deg, ${card.gradient.join(", ")})` }
		: undefined
	if (card.logo) {
		return (
			<div
				className="h-12 w-12 flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center border border-border/50 shadow-sm"
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
		<div className="h-12 w-12 flex-shrink-0 rounded-2xl flex items-center justify-center border border-border/50 shadow-sm bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg">
			{card.name.charAt(0).toUpperCase()}
		</div>
	)
}

export function ShowcaseCard({ card, labels }: ShowcaseCardProps) {
	const statusLabel = card.status !== "live" ? labels.status[card.status] : null

	return (
		<div className="group card-hover relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300">
			<Link href={card.href} className="block">
				{card.cover ? (
					<div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
						<Image
							src={card.cover}
							alt={card.name}
							fill
							sizes="(max-width: 768px) 100vw, 33vw"
							className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent" />
					</div>
				) : (
					<div className="relative aspect-[16/10] w-full bg-gradient-to-br from-muted to-card flex items-center justify-center">
						<span className="text-5xl font-bold text-muted-foreground/20">{card.name.charAt(0).toUpperCase()}</span>
					</div>
				)}
				{statusLabel && (
					<span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
						{statusLabel}
					</span>
				)}
			</Link>

			<div className="flex flex-1 flex-col gap-3 p-5">
				<div className="flex items-start gap-3">
					<LogoTile card={card} />
					<div className="min-w-0 flex-1">
						<Link href={card.href}>
							<h3 className="truncate text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary">
								{card.name}
							</h3>
						</Link>
						<div className="mt-0.5 flex items-center gap-2">
							<p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{card.categoryLabel}
							</p>
							<span className="flex items-center gap-1 text-muted-foreground">
								{card.platforms.map((p) => {
									const Icon = platformIcons[p]
									return Icon ? <Icon key={p} className="h-3.5 w-3.5" aria-label={labels.platforms[p] || p} /> : null
								})}
							</span>
						</div>
					</div>
				</div>

				<p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{card.short}</p>

				{card.techStack.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{card.techStack.slice(0, 4).map((tech) => (
							<span key={tech} className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground">
								{tech}
							</span>
						))}
					</div>
				)}

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
							{statusLabel || labels.comingSoon}
						</span>
					)}
					<Link
						href={card.href}
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
