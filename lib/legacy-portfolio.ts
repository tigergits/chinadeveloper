import type { Locale } from "@/i18n/request"
import { getAllContent, getContentBySlug, type ContentItem } from "@/lib/content"
import type { ExplorerItem } from "@/lib/showcase"

/** 从 markdown 正文提取首段纯文本作卡片摘要 */
function firstParagraph(md: string, max = 200): string {
	const lines = md.split(/\r?\n/)
	const buf: string[] = []
	for (const line of lines) {
		const t = line.trim()
		if (/^#/.test(t) || /^!\[/.test(t)) continue
		if (!t) {
			if (buf.length) break
			continue
		}
		buf.push(t)
	}
	const text = buf.join(" ").replace(/\[(.*?)\]\(.*?\)/g, "$1").replace(/[*_`]/g, "")
	return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text
}

function toLegacyExplorerItem(item: ContentItem, locale: Locale): ExplorerItem {
	const cover = item.metadata.cover ? `/assets/images/portfolios/${item.slug}/${item.metadata.cover}` : null
	return {
		slug: item.slug,
		href: `/${locale}/portfolios/${item.slug}`,
		name: item.metadata.title || item.slug,
		tagline: "",
		short: firstParagraph(item.content),
		category: "client",
		categoryLabel: "Enterprise",
		status: "delivered",
		pricing: undefined,
		platforms: [],
		techStack: item.metadata.technologies || [],
		installUrl: "",
		logo: null,
		gradient: null,
		cover,
	}
}

/**
 * 旧 markdown 作品集（content/portfolios）→ 列表页条目。
 * 指定语言缺文件时回退英文，保证六个语言页面条目数一致。
 */
export async function getLegacyExplorerItems(locale: Locale): Promise<ExplorerItem[]> {
	const enItems = await getAllContent("portfolios", "en")
	const out: ExplorerItem[] = []
	for (const en of enItems) {
		const localized = locale === "en" ? en : (await getContentBySlug("portfolios", en.slug, locale)) || en
		out.push(toLegacyExplorerItem(localized, locale))
	}
	return out
}
