import { getTranslations, setRequestLocale } from "next-intl/server"
import { Locale } from "@/i18n/request"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Shield, Globe, Chrome, Gamepad2, PlayCircle, Github } from "lucide-react"
import { getAllShowcaseItems, getShowcaseItem, localizeShowcase } from "@/lib/showcase"
import { markdownToHtml } from "@/lib/portfolio"
import { ImageGallery } from "@/components/image-gallery"
import { HireCta } from "@/components/hire-cta"

export async function generateStaticParams() {
	return getAllShowcaseItems().map((it) => ({ slug: it.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { locale, slug } = await params
	const item = getShowcaseItem(slug)
	if (!item) return { title: "Not Found" }
	const c = localizeShowcase(item, locale)
	const title = `${c.name} | Portfolio - Tiger Liu | China Developer`
	const description = c.metaDescription || c.short
	const ogImageUrl = item.screenshots[0]?.src
		? `https://chinadeveloper.net${item.screenshots[0].src}`
		: `https://chinadeveloper.net/assets/images/og-image.png`
	return {
		title,
		description,
		authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
		alternates: { canonical: `https://chinadeveloper.net/${locale}/portfolios/showcase/${slug}` },
		openGraph: {
			title,
			description,
			type: "article",
			url: `https://chinadeveloper.net/${locale}/portfolios/showcase/${slug}`,
			siteName: "China Developer - Tiger Liu",
			images: [{ url: ogImageUrl, width: 1200, height: 630, alt: c.name }],
		},
		twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
	}
}

export default async function ShowcaseDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { locale, slug } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	const item = getShowcaseItem(slug)
	if (!item) notFound()

	const c = localizeShowcase(item, locale)
	const longHtml = c.long ? await markdownToHtml(c.long) : ""
	const isExtension = item.category === "extension"

	const logoBg = item.gradient
		? { background: `linear-gradient(135deg, ${item.gradient.join(", ")})` }
		: undefined

	const galleryImages = item.screenshots.map((s, i) => ({
		src: s.src,
		alt: s.caption || `${c.name} — screenshot ${i + 1}`,
	}))

	const baseUrl = "https://chinadeveloper.net"
	const schemaType = isExtension ? "SoftwareApplication" : item.category === "game" ? "VideoGame" : "WebApplication"
	const operatingSystem = isExtension
		? "Chrome"
		: item.category === "game"
			? "Windows"
			: item.platforms.includes("mobile")
				? "Web, iOS, Android"
				: "Web"

	const offers =
		item.plans && item.plans.length
			? item.plans.map((p) => ({
					"@type": "Offer",
					name: p.name,
					price: (p.price.match(/[\d.]+/) || ["0"])[0],
					priceCurrency: "USD",
				}))
			: item.pricing === "free"
				? [{ "@type": "Offer", price: "0", priceCurrency: "USD" }]
				: undefined

	const appSchema = {
		"@context": "https://schema.org",
		"@type": schemaType,
		name: c.name,
		description: c.metaDescription || c.short,
		applicationCategory: item.categoryLabel,
		operatingSystem,
		url: item.links.site || undefined,
		offers,
		author: { "@type": "Person", name: "Tiger Liu", url: baseUrl },
		image: item.screenshots[0]?.src ? `${baseUrl}${item.screenshots[0].src}` : undefined,
	}

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/${locale}` },
			{ "@type": "ListItem", position: 2, name: t("portfolios.title"), item: `${baseUrl}/${locale}/portfolios` },
			{ "@type": "ListItem", position: 3, name: c.name, item: `${baseUrl}/${locale}/portfolios/showcase/${slug}` },
		],
	}

	// 平台/商店链接行
	const linkButtons: { key: string; href: string; icon: typeof Globe; label: string }[] = []
	if (item.links.chromeStore)
		linkButtons.push({ key: "chromeStore", href: item.links.chromeStore, icon: Chrome, label: t("portfolios.links.chromeStore") })
	if (item.links.steam)
		linkButtons.push({ key: "steam", href: item.links.steam, icon: Gamepad2, label: t("portfolios.links.steam") })
	if (item.links.site)
		linkButtons.push({ key: "site", href: item.links.site, icon: Globe, label: t("portfolios.links.site") })
	if (item.links.demo)
		linkButtons.push({ key: "demo", href: item.links.demo, icon: PlayCircle, label: t("portfolios.links.demo") })
	if (item.links.github)
		linkButtons.push({ key: "github", href: item.links.github, icon: Github, label: t("portfolios.links.github") })

	const statusLabelMap: Record<string, string> = {
		"coming-soon": t("portfolios.comingSoon"),
		"in-development": t("portfolios.status.inDevelopment"),
		"case-study": t("portfolios.status.caseStudy"),
	}
	const statusLabel = statusLabelMap[item.status]

	return (
		<div className="container px-4 py-4">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
			<div className="mx-auto max-w-4xl">
				<Link
					href={`/${locale}/portfolios`}
					className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					{t("portfolios.backToShowcase")}
				</Link>

				{/* 头部 */}
				<div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
					<div
						className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-border/50 shadow-sm"
						style={logoBg}
					>
						{item.logo ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={item.logo}
								alt={`${c.name} logo`}
								className={item.gradient ? "h-2/3 w-2/3 object-contain" : "h-full w-full object-cover"}
							/>
						) : (
							<span className="bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-3xl font-bold text-transparent">
								{c.name.charAt(0)}
							</span>
						)}
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.categoryLabel}</p>
							{statusLabel && (
								<span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
									{statusLabel}
								</span>
							)}
						</div>
						<h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{c.name}</h1>
						{c.tagline && <p className="mt-2 text-lg text-muted-foreground">{c.tagline}</p>}
					</div>
				</div>

				{/* 操作按钮 */}
				<div className="mb-10 flex flex-wrap items-center gap-3">
					{item.installUrl ? (
						<a
							href={item.installUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							<Download className="h-5 w-5" />
							<span>{t("portfolios.install")}</span>
						</a>
					) : !statusLabel ? (
						<span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-5 py-3 font-medium text-muted-foreground">
							{t("portfolios.comingSoon")}
						</span>
					) : null}
					{linkButtons
						.filter((b) => b.href !== item.installUrl)
						.map((b) => {
							const Icon = b.icon
							return (
								<a
									key={b.key}
									href={b.href}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
								>
									<Icon className="h-4 w-4" />
									<span>{b.label}</span>
								</a>
							)
						})}
					{item.releaseStatus && <span className="text-sm text-muted-foreground">{item.releaseStatus}</span>}
					{isExtension && item.privacyMarkdown && (
						<Link
							href={`/${locale}/portfolios/showcase/${slug}/privacy`}
							className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							<Shield className="h-4 w-4" />
							{t("portfolios.privacyPolicy")}
						</Link>
					)}
				</div>

				{/* 截图 */}
				{galleryImages.length > 0 && (
					<section className="mb-10">
						<ImageGallery images={galleryImages} />
					</section>
				)}

				{/* 长描述 */}
				{longHtml && (
					<div className="markdown-content mb-10" dangerouslySetInnerHTML={{ __html: longHtml }} />
				)}

				{/* 亮点 */}
				{c.features && c.features.length > 0 && (
					<section className="mb-10">
						<h2 className="mb-6 text-2xl font-semibold tracking-tight">{t("portfolios.highlights")}</h2>
						<div className="grid gap-5 sm:grid-cols-2">
							{c.features.map((f, i) => (
								<div key={i} className="rounded-xl border border-border bg-card/50 p-5">
									<div className="mb-2 flex items-center gap-2">
										{f.emoji && <span className="text-xl">{f.emoji}</span>}
										<h3 className="font-semibold">{f.title}</h3>
									</div>
									{f.desc && <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>}
								</div>
							))}
						</div>
					</section>
				)}

				{/* 技术栈 */}
				{item.techStack.length > 0 && (
					<section className="mb-10">
						<h2 className="mb-4 text-2xl font-semibold tracking-tight">{t("portfolios.techStackTitle")}</h2>
						<div className="flex flex-wrap gap-2">
							{item.techStack.map((tech) => (
								<span
									key={tech}
									className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/80"
								>
									{tech}
								</span>
							))}
						</div>
					</section>
				)}

				{/* 定价 */}
				{item.plans && item.plans.length > 0 && (
					<section className="mb-10">
						<h2 className="mb-4 text-2xl font-semibold tracking-tight">{t("portfolios.plansTitle")}</h2>
						<div className="grid gap-4 sm:grid-cols-3">
							{item.plans.map((p) => (
								<div key={p.name} className="rounded-xl border border-border bg-card/50 p-5 text-center">
									<p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{p.name}</p>
									<p className="mt-1 text-lg font-semibold">{p.price}</p>
								</div>
							))}
						</div>
					</section>
				)}

				<HireCta locale={locale} projectSlug={slug} projectName={c.name} />
			</div>
		</div>
	)
}
