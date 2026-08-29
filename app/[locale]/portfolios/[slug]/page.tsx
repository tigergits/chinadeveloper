import { setRequestLocale } from "next-intl/server"
import { Locale } from "@/i18n/request"
import { getAllContent } from "@/lib/content"
import { getAllShowcaseItems, getShowcaseItem } from "@/lib/showcase"
import { showcaseMetadata, ShowcaseView } from "./showcase-view"
import { legacyMetadata, LegacyView } from "./legacy-view"

/**
 * 作品集详情页的统一入口。
 *
 * 两个数据源共用这一条 /portfolios/<slug> 路由：先查 showcase 管线产物
 * （data/showcase.generated.json），未命中再回落到旧 markdown（content/portfolios）。
 * 两边 slug 目前无重名；万一将来撞车，showcase 优先。
 */
function isShowcase(slug: string) {
	return Boolean(getShowcaseItem(slug))
}

export async function generateStaticParams() {
	const slugs = new Set(getAllShowcaseItems().map((it) => it.slug))
	try {
		for (const portfolio of await getAllContent("portfolios", "en")) {
			slugs.add(portfolio.slug)
		}
	} catch (error) {
		console.error("Error generating static params:", error)
	}
	return Array.from(slugs, (slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { locale, slug } = await params
	return isShowcase(slug) ? showcaseMetadata(locale, slug) : legacyMetadata(locale, slug)
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { locale, slug } = await params
	setRequestLocale(locale)
	return isShowcase(slug) ? <ShowcaseView locale={locale} slug={slug} /> : <LegacyView locale={locale} slug={slug} />
}
