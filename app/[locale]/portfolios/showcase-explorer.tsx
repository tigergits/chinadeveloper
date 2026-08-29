"use client"

import { useMemo, useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search, X } from "lucide-react"
import type { ExplorerItem, ShowcasePlatform } from "@/lib/showcase"
import { ShowcaseCard, type ShowcaseCardLabels } from "@/components/showcase-card"
import { CardGrid } from "@/components/card-grid"
import { cn } from "@/lib/utils"

interface ShowcaseExplorerProps {
	items: ExplorerItem[]
	categories: string[]
}

const ALL_PLATFORMS: ShowcasePlatform[] = ["web", "extension", "desktop", "mobile", "wechat"]

function ExplorerInner({ items, categories }: ShowcaseExplorerProps) {
	const t = useTranslations("portfolios")
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const [query, setQuery] = useState(searchParams.get("q") || "")
	const [category, setCategory] = useState(searchParams.get("cat") || "all")
	const [platforms, setPlatforms] = useState<string[]>(
		(searchParams.get("platform") || "").split(",").filter(Boolean)
	)
	const [techs, setTechs] = useState<string[]>((searchParams.get("tech") || "").split(",").filter(Boolean))

	// 筛选状态同步到 URL（可分享/前进后退）
	useEffect(() => {
		const params = new URLSearchParams()
		if (query) params.set("q", query)
		if (category !== "all") params.set("cat", category)
		if (platforms.length) params.set("platform", platforms.join(","))
		if (techs.length) params.set("tech", techs.join(","))
		const qs = params.toString()
		router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
	}, [query, category, platforms, techs, pathname, router])

	// 技术标签按出现频次排序，取前 14 个
	const topTechs = useMemo(() => {
		const counts = new Map<string, number>()
		for (const it of items) for (const tech of it.techStack) counts.set(tech, (counts.get(tech) || 0) + 1)
		return Array.from(counts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 14)
	}, [items])

	// 平台里只展示实际存在的
	const availablePlatforms = useMemo(() => {
		const present = new Set(items.flatMap((it) => it.platforms))
		return ALL_PLATFORMS.filter((p) => present.has(p))
	}, [items])

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		return items.filter((it) => {
			if (category !== "all" && it.category !== category) return false
			if (platforms.length && !platforms.some((p) => it.platforms.includes(p as ShowcasePlatform))) return false
			if (techs.length && !techs.some((tech) => it.techStack.includes(tech))) return false
			if (q) {
				const hay = `${it.name} ${it.tagline} ${it.short} ${it.techStack.join(" ")} ${it.categoryLabel}`.toLowerCase()
				if (!hay.includes(q)) return false
			}
			return true
		})
	}, [items, query, category, platforms, techs])

	const toggle = useCallback((list: string[], setList: (v: string[]) => void, value: string) => {
		setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
	}, [])

	const hasFilters = query !== "" || category !== "all" || platforms.length > 0 || techs.length > 0
	const clearAll = () => {
		setQuery("")
		setCategory("all")
		setPlatforms([])
		setTechs([])
	}

	const counts = useMemo(() => {
		const c = new Map<string, number>()
		for (const it of items) c.set(it.category, (c.get(it.category) || 0) + 1)
		return c
	}, [items])

	const cardLabels: ShowcaseCardLabels = {
		install: t("install"),
		comingSoon: t("comingSoon"),
		details: t("viewDetails"),
		status: {
			live: t("status.live"),
			"coming-soon": t("comingSoon"),
			"in-development": t("status.inDevelopment"),
			"case-study": t("status.caseStudy"),
			delivered: t("status.delivered"),
		},
		platforms: Object.fromEntries(ALL_PLATFORMS.map((p) => [p, t(`platforms.${p}`)])),
	}

	return (
		<div>
			{/* 搜索 + 分类 */}
			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="relative w-full lg:max-w-sm">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={t("searchPlaceholder")}
						className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none ring-primary/30 transition focus:ring-2"
					/>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						onClick={() => setCategory("all")}
						className={cn(
							"rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
							category === "all"
								? "border-primary bg-primary text-primary-foreground"
								: "border-border bg-card text-muted-foreground hover:text-foreground"
						)}
					>
						{t("all")} · {items.length}
					</button>
					{categories.map((cat) => (
						<button
							key={cat}
							onClick={() => setCategory(category === cat ? "all" : cat)}
							className={cn(
								"rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
								category === cat
									? "border-primary bg-primary text-primary-foreground"
									: "border-border bg-card text-muted-foreground hover:text-foreground"
							)}
						>
							{t(`categories.${cat}`)} · {counts.get(cat) || 0}
						</button>
					))}
				</div>
			</div>

			{/* 平台 + 技术 chips */}
			<div className="mb-8 flex flex-col gap-3">
				{availablePlatforms.length > 1 && (
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{t("platformsLabel")}
						</span>
						{availablePlatforms.map((p) => (
							<button
								key={p}
								onClick={() => toggle(platforms, setPlatforms, p)}
								className={cn(
									"rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
									platforms.includes(p)
										? "border-primary/50 bg-primary/10 text-primary"
										: "border-border bg-card text-muted-foreground hover:text-foreground"
								)}
							>
								{t(`platforms.${p}`)}
							</button>
						))}
					</div>
				)}
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("techLabel")}</span>
					{topTechs.map(([tech, count]) => (
						<button
							key={tech}
							onClick={() => toggle(techs, setTechs, tech)}
							className={cn(
								"rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
								techs.includes(tech)
									? "border-primary/50 bg-primary/10 text-primary"
									: "border-border bg-card text-muted-foreground hover:text-foreground"
							)}
						>
							{tech} <span className="opacity-60">{count}</span>
						</button>
					))}
					{hasFilters && (
						<button
							onClick={clearAll}
							className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-primary hover:underline"
						>
							<X className="h-3.5 w-3.5" />
							{t("clearFilters")}
						</button>
					)}
				</div>
			</div>

			{/* 结果 */}
			<p className="mb-6 text-sm text-muted-foreground">
				{filtered.length} {t("itemsCount")}
			</p>
			{filtered.length > 0 ? (
				<CardGrid columns={3} gap="lg">
					{filtered.map((card) => (
						<ShowcaseCard key={card.slug} card={card} labels={cardLabels} />
					))}
				</CardGrid>
			) : (
				<div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
					{t("noResults")}
				</div>
			)}
		</div>
	)
}

export function ShowcaseExplorer(props: ShowcaseExplorerProps) {
	// useSearchParams 需要 Suspense 边界（静态导出下于客户端水合后生效）
	return (
		<Suspense fallback={null}>
			<ExplorerInner {...props} />
		</Suspense>
	)
}
