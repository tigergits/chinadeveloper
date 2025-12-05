import { getTranslations, setRequestLocale } from "next-intl/server"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/card"
import { CardGrid } from "@/components/card-grid"
import { Locale } from "@/i18n/request"

interface Service {
	slug: string
	name?: string
	tagline?: string
	description?: string
}

async function getServices(locale: Locale): Promise<Service[]> {
	try {
		const services = (await import(`@/content/services/${locale}.json`)).default
		return services
	} catch {
		// Fallback to English if locale file doesn't exist
		const services = (await import(`@/content/services/en.json`)).default
		return services
	}
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	const isZhCN = locale === "zh_CN"
	const title = `${t("services.title")} - Tiger Liu | China Developer`
	const description = isZhCN
		? `Tiger Liu 提供的专业服务项目。China Developer - ${t("services.description")} 资深全栈开发工程师，25+年经验，支持远程工作。`
		: `Professional services offered by Tiger Liu. China Developer - ${t("services.description")} Senior Full-Stack Developer with 25+ years of experience, available for remote work.`

	const ogImageUrl = `https://chinadeveloper.net/assets/images/og-image.png`
	
	return {
		title,
		description,
		authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
		alternates: {
			canonical: `https://chinadeveloper.net/${locale}/services`,
		},
		openGraph: {
			title,
			description,
			type: "website",
			url: `https://chinadeveloper.net/${locale}/services`,
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

export default async function ServicesPage({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })
	const services = await getServices(locale)

	const isZhCN = locale === "zh_CN"
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
				"name": isZhCN ? "服务" : "Services",
				"item": `${baseUrl}/${locale}/services`,
			},
		],
	}

	// Service structured data
	const serviceSchemas = services.map((service) => ({
		"@context": "https://schema.org",
		"@type": "Service",
		"name": service.name || service.slug,
		"description": service.description || service.tagline || "",
		"provider": {
			"@type": "Person",
			"name": "Tiger Liu",
			"url": baseUrl,
		},
	}))

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
			/>
			{serviceSchemas.map((schema, index) => (
				<script
					key={index}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
				/>
			))}
		<section className="relative px-4 py-4 md:py-4 overflow-hidden">
			{/* Background gradient and decorative shapes */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
				<div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute -right-10 top-10 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
			</div>

			<div className="container max-w-6xl mx-auto">
				<div className="max-w-3xl mx-auto text-center mb-12">
					<p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary mb-4">
						<span className="h-1.5 w-1.5 rounded-full bg-primary" />
						{t("services.title")}
					</p>
					<h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-balance">
						{t("services.title")}
					</h1>
					<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
						{t("services.description")}
					</p>
				</div>

				<CardGrid columns={3} gap="lg">
					{services.map((service) => {
						const title = service.name || service.slug
						const iconPath = `/assets/images/services/${service.slug}.svg`

						return (
							<Card
								key={service.slug}
								className="group flex h-full flex-col bg-gradient-to-br from-card to-muted/40 border-border/60"
							>
								<div className="flex items-center gap-4 mb-4">
									<div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30">
										<Image
											src={iconPath}
											alt={`${title} ${locale === "zh_CN" ? "服务图标" : "service icon"} - Tiger Liu, China Developer`}
											width={48}
											height={48}
											className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
										/>
									</div>
									<div className="flex flex-col">
										<h2 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h2>
										<span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary/80">
											<span className="h-1 w-1 rounded-full bg-primary/80" />
											<span>{service.tagline}</span>
										</span>
									</div>
								</div>

								{service.description && (
									<p className="text-sm md:text-base text-muted-foreground leading-relaxed">
										{service.description}
									</p>
								)}

								<div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
									<span className="inline-flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
										{locale === "zh_CN" ? "联系我" : "Contact me"}
										<ArrowRight className="h-4 w-4" />
									</span>
								</div>
							</Card>
						)
					})}
				</CardGrid>
			</div>
		</section>
		</>
	)
}
