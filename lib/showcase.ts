import type { Locale } from "@/i18n/request"
import generated from "@/data/showcase.generated.json"

export interface ShowcaseFeature {
	emoji: string
	title: string
	desc: string
}

export interface ShowcaseLocaleContent {
	name: string
	tagline?: string
	short: string
	long?: string
	metaDescription?: string
	features?: ShowcaseFeature[]
}

export interface ShowcaseScreenshot {
	src: string
	caption: string
}

export interface ShowcaseLinks {
	site?: string
	chromeStore?: string
	steam?: string
	demo?: string
	appStore?: string
	playStore?: string
	github?: string
}

export interface ShowcasePlan {
	name: string
	price: string
}

export type ShowcaseStatus = "live" | "coming-soon" | "in-development" | "case-study" | "delivered"
export type ShowcasePlatform = "web" | "extension" | "desktop" | "mobile" | "wechat"

export interface ShowcaseItem {
	slug: string
	category: string
	type: string
	status: ShowcaseStatus
	pricing?: string
	platforms: ShowcasePlatform[]
	techStack: string[]
	links: ShowcaseLinks
	installUrl: string
	categoryLabel: string
	releaseStatus?: string
	logo: string | null
	gradient: string[] | null
	screenshots: ShowcaseScreenshot[]
	privacyMarkdown: string | null
	plans?: ShowcasePlan[]
	content: Record<string, ShowcaseLocaleContent>
}

export interface ShowcaseCategory {
	key: string
	order: number
}

interface GeneratedData {
	generatedOn: string
	locales: string[]
	categories: ShowcaseCategory[]
	items: ShowcaseItem[]
}

const data = generated as unknown as GeneratedData

const FALLBACK_LOCALE = "en"

/** 取某条目在指定语言下的文案，缺失字段回退英文 */
export function localizeShowcase(item: ShowcaseItem, locale: Locale): ShowcaseLocaleContent {
	const base = item.content[FALLBACK_LOCALE] || ({ name: item.slug, short: "" } as ShowcaseLocaleContent)
	const loc = item.content[locale] || {}
	return {
		name: loc.name || base.name,
		tagline: loc.tagline || base.tagline,
		short: loc.short || base.short,
		long: loc.long || base.long,
		metaDescription: loc.metaDescription || base.metaDescription,
		features: loc.features && loc.features.length ? loc.features : base.features,
	}
}

/** 已本地化的完整展示数据（详情页用） */
export interface ShowcaseCard extends ShowcaseLocaleContent {
	slug: string
	category: string
	type: string
	status: ShowcaseStatus
	pricing?: string
	platforms: ShowcasePlatform[]
	techStack: string[]
	links: ShowcaseLinks
	installUrl: string
	categoryLabel: string
	releaseStatus?: string
	logo: string | null
	gradient: string[] | null
	screenshots: ShowcaseScreenshot[]
	plans?: ShowcasePlan[]
	hasPrivacy: boolean
}

export function toCard(item: ShowcaseItem, locale: Locale): ShowcaseCard {
	const c = localizeShowcase(item, locale)
	return {
		slug: item.slug,
		category: item.category,
		type: item.type,
		status: item.status || "live",
		pricing: item.pricing,
		platforms: item.platforms || [],
		techStack: item.techStack || [],
		links: item.links || {},
		installUrl: item.installUrl,
		categoryLabel: item.categoryLabel,
		releaseStatus: item.releaseStatus,
		logo: item.logo,
		gradient: item.gradient,
		screenshots: item.screenshots,
		plans: item.plans,
		hasPrivacy: !!item.privacyMarkdown,
		...c,
	}
}

/**
 * 列表页/筛选器用的瘦身条目（只带渲染卡片与过滤所需字段，
 * 避免整包 content 进入 client bundle）。
 */
export interface ExplorerItem {
	slug: string
	href: string
	name: string
	tagline: string
	short: string
	category: string
	categoryLabel: string
	status: ShowcaseStatus
	pricing?: string
	platforms: ShowcasePlatform[]
	techStack: string[]
	installUrl: string
	logo: string | null
	gradient: string[] | null
	cover: string | null
}

export function toExplorerItem(item: ShowcaseItem, locale: Locale): ExplorerItem {
	const c = localizeShowcase(item, locale)
	return {
		slug: item.slug,
		href: `/${locale}/portfolios/showcase/${item.slug}`,
		name: c.name,
		tagline: c.tagline || "",
		short: c.short,
		category: item.category,
		categoryLabel: item.categoryLabel,
		status: item.status || "live",
		pricing: item.pricing,
		platforms: item.platforms || [],
		techStack: item.techStack || [],
		installUrl: item.installUrl,
		logo: item.logo,
		gradient: item.gradient,
		cover: item.screenshots[0]?.src || null,
	}
}

export interface ShowcaseGroup {
	key: string
	order: number
	items: ShowcaseCard[]
}

/** 按分类分组（只含有 items 的分类，保持 order） */
export function getShowcaseGroups(locale: Locale): ShowcaseGroup[] {
	return data.categories
		.map((cat) => ({
			key: cat.key,
			order: cat.order,
			items: data.items.filter((it) => it.category === cat.key).map((it) => toCard(it, locale)),
		}))
		.filter((g) => g.items.length > 0)
		.sort((a, b) => a.order - b.order)
}

export function getAllShowcaseItems(): ShowcaseItem[] {
	return data.items
}

export function getShowcaseItem(slug: string): ShowcaseItem | null {
	return data.items.find((it) => it.slug === slug) || null
}

export function getShowcaseCategoryKeys(): string[] {
	return data.categories.map((c) => c.key)
}

export function getShowcaseCategories(): ShowcaseCategory[] {
	return data.categories
}
