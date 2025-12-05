import { getTranslations, setRequestLocale } from "next-intl/server"
import { getContentBySlug, getAllContent } from "@/lib/content"
import { Locale } from "@/i18n/request"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Github, ExternalLink } from "lucide-react"
import { markdownToHtml, parsePortfolioSections } from "@/lib/portfolio"
import { ImageGallery } from "@/components/image-gallery"

export async function generateStaticParams() {
	try {
		const portfolios = await getAllContent("portfolios", "en")
		return portfolios.map((portfolio) => ({ slug: portfolio.slug }))
	} catch (error) {
		console.error("Error generating static params:", error)
		return []
	}
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { locale, slug } = await params
	try {
		const portfolio = await getContentBySlug("portfolios", slug, locale)

		if (!portfolio) {
			return {
				title: "Portfolio Not Found",
			}
		}

		const isZhCN = locale === "zh-cn"
		const portfolioTitle = portfolio.metadata.title || slug
		const technologies = portfolio.metadata.technologies || []
		const techKeywords = technologies.join(", ")
		
		// Create a more detailed description
		const contentPreview = portfolio.content
			.replace(/^#+\s+/gm, "") // Remove markdown headers
			.replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
			.replace(/\n+/g, " ") // Replace newlines with spaces
			.trim()
			.substring(0, 155)
		
		const description = isZhCN
			? `${portfolioTitle} - ${contentPreview}${technologies.length > 0 ? ` 技术栈：${techKeywords}` : ""}。Tiger Liu 作品集项目，China Developer。`
			: `${portfolioTitle} - ${contentPreview}${technologies.length > 0 ? ` Technologies: ${techKeywords}` : ""}. Portfolio project by Tiger Liu, China Developer.`

		const title = `${portfolioTitle} | Portfolio - Tiger Liu | China Developer`
		const keywords = [
			portfolioTitle,
			"Tiger Liu",
			"China Developer",
			"Portfolio",
			"Software Development",
			"Full-Stack Developer",
			...technologies,
		]

		const ogImageUrl = portfolio.metadata.cover
			? `https://chinadeveloper.net/assets/images/portfolios/${slug}/${portfolio.metadata.cover}`
			: `https://chinadeveloper.net/assets/images/og-image.png`

		return {
			title,
			description,
			keywords,
			authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
			alternates: {
				canonical: `https://chinadeveloper.net/${locale}/portfolios/${slug}`,
			},
			openGraph: {
				title,
				description,
				type: "article",
				url: `https://chinadeveloper.net/${locale}/portfolios/${slug}`,
				siteName: "China Developer - Tiger Liu",
				images: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
						alt: portfolioTitle,
					},
				],
			},
			twitter: {
				card: "summary_large_image",
				title,
				description,
				images: [ogImageUrl],
			},
		}
	} catch (error) {
		return {
			title: "Portfolio Not Found",
		}
	}
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { locale, slug } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	try {
		const portfolio = await getContentBySlug("portfolios", slug, locale)

		if (!portfolio) {
			notFound()
		}

		const { bodyMarkdown, screenshots } = parsePortfolioSections(portfolio.content)
		const bodyHtml = await markdownToHtml(bodyMarkdown)

		const galleryImages = screenshots.map((image, index) => ({
			src: `/assets/images/portfolios/${slug}/${image.src}`,
			alt: image.alt || `${portfolio.metadata.title || slug} - Screenshot ${index + 1}`,
		}))

		const isZhCN = locale === "zh-cn"
		const portfolioTitle = portfolio.metadata.title || slug
		const baseUrl = "https://chinadeveloper.net"
		
		// Article structured data
		const articleSchema = {
			"@context": "https://schema.org",
			"@type": "Article",
			"headline": portfolioTitle,
			"description": portfolio.content.substring(0, 200).replace(/\n/g, " "),
			"image": portfolio.metadata.cover
				? `${baseUrl}/assets/images/portfolios/${slug}/${portfolio.metadata.cover}`
				: `${baseUrl}/assets/images/og-image.png`,
			"author": {
				"@type": "Person",
				"name": "Tiger Liu",
				"url": baseUrl,
			},
			"publisher": {
				"@type": "Organization",
				"name": "China Developer",
				"url": baseUrl,
			},
			"datePublished": new Date().toISOString(),
			"dateModified": new Date().toISOString(),
			"mainEntityOfPage": {
				"@type": "WebPage",
				"@id": `${baseUrl}/${locale}/portfolios/${slug}`,
			},
		}

		// Breadcrumb structured data
		const breadcrumbSchema = {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": isZhCN ? "首页" : "Home",
					"item": `${baseUrl}/${locale}`,
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": isZhCN ? "作品集" : "Portfolios",
					"item": `${baseUrl}/${locale}/portfolios`,
				},
				{
					"@type": "ListItem",
					"position": 3,
					"name": portfolioTitle,
					"item": `${baseUrl}/${locale}/portfolios/${slug}`,
				},
			],
		}

		return (
			<div className="container px-4 py-4">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
				/>
				<div className="max-w-4xl mx-auto">
					<Link
						href={`/${locale}/portfolios`}
						className="text-foreground/60 hover:text-foreground mb-4 inline-block"
					>
						← Back to Portfolios
					</Link>

					{portfolio.metadata.cover && (
						<div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
							<Image
								src={'/assets/images/portfolios/' + slug + '/' + portfolio.metadata.cover}
								alt={`${portfolioTitle} - ${isZhCN ? "项目封面图" : "Project cover image"} by Tiger Liu, China Developer`}
								fill
								className="object-cover"
								priority
							/>
						</div>
					)}

					<h1 className="mb-4 text-4xl font-bold">{portfolio.metadata.title || slug}</h1>

					{portfolio.metadata.technologies && (
						<div className="mb-6 space-y-2">
							<div className="text-sm font-medium text-foreground/60">Technologies</div>
							<div className="flex flex-wrap gap-2">
								{portfolio.metadata.technologies.map((tech) => (
									<span
										key={tech}
										className="inline-flex items-center rounded-full border border-foreground/20 bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/80"
									>
										{tech}
									</span>
								))}
							</div>
						</div>
					)}

					{bodyHtml && (
						<div
							className="markdown-content mb-10"
							dangerouslySetInnerHTML={{ __html: bodyHtml }}
						/>
					)}

					{galleryImages.length > 0 && (
						<section className="mb-10 space-y-4">
							<h2 className="text-2xl font-semibold tracking-tight">Screenshots</h2>
							<p className="text-sm text-foreground/60">
								Click any screenshot to view it in a larger gallery.
							</p>
							<ImageGallery images={galleryImages} />
						</section>
					)}

					{/* Technologies section is now only displayed under the title above */}

					{(portfolio.metadata.github || portfolio.metadata.gitee) && (
						<div className="my-8 h-px w-full bg-foreground/10" />
					)}

					{(portfolio.metadata.github || portfolio.metadata.gitee) && (
						<div className="mt-2 flex flex-wrap gap-4">
							{portfolio.metadata.github && (
								<a
									href={portfolio.metadata.github}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 rounded-lg border border-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
								>
									<Github className="h-5 w-5" />
									<span>{t("portfolios.viewOnGithub")}</span>
								</a>
							)}
						</div>
					)}
				</div>
			</div>
		)
	} catch (error) {
		notFound()
	}
}
