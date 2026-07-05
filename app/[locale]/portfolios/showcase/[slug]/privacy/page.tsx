import { setRequestLocale } from "next-intl/server"
import { Locale } from "@/i18n/request"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getAllShowcaseItems, getShowcaseItem, localizeShowcase } from "@/lib/showcase"
import { markdownToHtml } from "@/lib/portfolio"

export async function generateStaticParams() {
	return getAllShowcaseItems()
		.filter((it) => it.privacyMarkdown)
		.map((it) => ({ slug: it.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { slug } = await params
	const item = getShowcaseItem(slug)
	if (!item) return { title: "Not Found" }
	const c = localizeShowcase(item, "en")
	return {
		title: `Privacy Policy — ${c.name} | China Developer`,
		description: `Privacy policy for ${c.name}.`,
		robots: { index: true, follow: true },
	}
}

// 隐私页仅提供英文内容（按需求）
export default async function ShowcasePrivacyPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { locale, slug } = await params
	setRequestLocale(locale)

	const item = getShowcaseItem(slug)
	if (!item || !item.privacyMarkdown) notFound()

	const c = localizeShowcase(item, "en")
	const html = await markdownToHtml(item.privacyMarkdown)

	return (
		<div className="container px-4 py-8">
			<div className="mx-auto max-w-3xl">
				<Link
					href={`/${locale}/portfolios/showcase/${slug}`}
					className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to {c.name}
				</Link>
				<h1 className="mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
				<p className="mb-8 text-muted-foreground">{c.name}</p>
				<div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />
			</div>
		</div>
	)
}
