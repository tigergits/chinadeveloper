import { getTranslations, setRequestLocale } from "next-intl/server"
import { getAboutContent } from "@/lib/content"
import { Locale } from "@/i18n/request"
import Image from "next/image"
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	const isZhCN = locale === "zh-cn"
	const title = `${t("about.title")} - Tiger Liu | China Developer`
	const description = isZhCN
		? "了解 Tiger Liu 作为资深全栈软件开发工程师的历程。China Developer - 自1993年起构建软件解决方案，拥有30年专业经验，由 AI 工具加持。"
		: "Learn about Tiger Liu's journey as a Senior Full-Stack Software Development Engineer. China Developer - Building software solutions since 1993 with 30 years of professional experience, supercharged with AI."

	const ogImageUrl = `https://chinadeveloper.net/assets/images/og-image.png`
	
	return {
		title,
		description,
		authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
		alternates: {
			canonical: `https://chinadeveloper.net/${locale}/about`,
		},
		openGraph: {
			title,
			description,
			type: "profile",
			url: `https://chinadeveloper.net/${locale}/about`,
			siteName: "China Developer - Tiger Liu",
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: title,
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
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })
	const content = await getAboutContent(locale)
	
	// Convert markdown to HTML
	const processedContent = await remark()
		.use(remarkGfm)
		.use(html)
		.process(content)
	const htmlContent = processedContent.toString()

	const isZhCN = locale === "zh-cn"
	const baseUrl = "https://chinadeveloper.net"
	
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
				"name": isZhCN ? "关于我" : "About",
				"item": `${baseUrl}/${locale}/about`,
			},
		],
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
			/>
		<section className="relative px-4 py-12 md:py-16 overflow-hidden">
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-grid opacity-40" />
				<div className="glow-blob absolute -top-16 left-1/2 -translate-x-1/2 w-[34rem] h-64" />
			</div>

			<div className="max-w-4xl mx-auto">
				{/* Avatar + eyebrow */}
				<div className="mb-10 flex flex-col items-center text-center">
					<div className="mb-6 w-44 h-44 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-primary to-accent/30 flex items-center justify-center ring-4 ring-primary/20 shadow-2xl overflow-hidden">
						<Image
							src="/assets/images/tiger.jpg"
							alt={locale === 'zh-cn' ? 'Tiger Liu - 资深全栈软件开发工程师，China Developer' : 'Tiger Liu - Senior Full-Stack Software Development Engineer, China Developer'}
							width={224}
							height={224}
							className="w-full h-full object-cover"
							priority
						/>
					</div>
					<p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
						<span className="h-1.5 w-1.5 rounded-full bg-primary" />
						{t("about.title")}
					</p>
				</div>

				{/* Markdown Content */}
				<div
					className="markdown-content rounded-2xl bg-card/60 p-8 md:p-10 border border-border/60 shadow-sm backdrop-blur-sm"
					dangerouslySetInnerHTML={{ __html: htmlContent }}
				/>
			</div>
		</section>
		</>
	)
}
