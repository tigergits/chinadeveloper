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
	features?: ShowcaseFeature[]
}

export interface ShowcaseScreenshot {
	src: string
	caption: string
}

export interface ShowcaseItem {
	slug: string
	category: string
	type: string
	installUrl: string
	categoryLabel: string
	releaseStatus?: string
	logo: string | null
	gradient: string[] | null
	screenshots: ShowcaseScreenshot[]
	privacyMarkdown: string | null
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
		features: loc.features && loc.features.length ? loc.features : base.features,
	}
}

/** 已本地化的展示卡片数据 */
export interface ShowcaseCard extends ShowcaseLocaleContent {
	slug: string
	category: string
	type: string
	installUrl: string
	categoryLabel: string
	releaseStatus?: string
	logo: string | null
	gradient: string[] | null
	screenshots: ShowcaseScreenshot[]
	hasPrivacy: boolean
}

function toCard(item: ShowcaseItem, locale: Locale): ShowcaseCard {
	const c = localizeShowcase(item, locale)
	return {
		slug: item.slug,
		category: item.category,
		type: item.type,
		installUrl: item.installUrl,
		categoryLabel: item.categoryLabel,
		releaseStatus: item.releaseStatus,
		logo: item.logo,
		gradient: item.gradient,
		screenshots: item.screenshots,
		hasPrivacy: !!item.privacyMarkdown,
		...c,
	}
}

export interface ShowcaseGroup {
	key: string
	order: number
	items: ShowcaseCard[]
}

/** 按分类分组（只含有 items 的分类，保持 order），用于落地页 */
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
