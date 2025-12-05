import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card } from "@/components/card"
import { CardGrid } from "@/components/card-grid"
import { Locale } from "@/i18n/request"

interface Skill {
	slug: string
	name?: string
	description?: string
}

async function getSkills(locale: Locale): Promise<Skill[]> {
	try {
		const skills = (await import(`@/content/skills/${locale}.json`)).default
		return skills
	} catch {
		// Fallback to English if locale file doesn't exist
		const skills = (await import(`@/content/skills/en.json`)).default
		return skills
	}
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	const isZhCN = locale === "zh_CN"
	const title = `${t("skills.title")} - Tiger Liu | China Developer`
	const description = isZhCN
		? "Tiger Liu 掌握的技能与技术栈。China Developer - 资深全栈开发工程师的技术专长，涵盖前端、后端、移动端、数据库等多个领域。"
		: "Technologies and skills mastered by Tiger Liu. China Developer - Technical expertise of a Senior Full-Stack Developer covering frontend, backend, mobile, databases, and more."

	const ogImageUrl = `https://chinadeveloper.net/assets/images/og-image.png`
	
	return {
		title,
		description,
		authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
		alternates: {
			canonical: `https://chinadeveloper.net/${locale}/skills`,
		},
		openGraph: {
			title,
			description,
			type: "website",
			url: `https://chinadeveloper.net/${locale}/skills`,
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

export default async function SkillsPage({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })
	const skills = await getSkills(locale)

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
				"name": isZhCN ? "技能" : "Skills",
				"item": `${baseUrl}/${locale}/skills`,
			},
		],
	}

	// ItemList structured data for skills
	const itemListSchema = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		"name": isZhCN ? "技能列表" : "Skills List",
		"description": isZhCN
			? "Tiger Liu 掌握的技能与技术栈"
			: "Technologies and skills mastered by Tiger Liu",
		"itemListElement": skills.map((skill, index) => ({
			"@type": "ListItem",
			"position": index + 1,
			"name": skill.name || skill.slug,
			"description": skill.description || "",
		})),
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
			/>
		<section className="relative px-4 py-4 md:py-4 overflow-hidden">
			<div className="container max-w-6xl mx-auto">
				<div className="max-w-3xl mx-auto text-center mb-10">
					<p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1 text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] text-primary/90 mb-3">
						<span className="h-1.5 w-1.5 rounded-full bg-primary" />
						{t("skills.title")}
					</p>
					<h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-balance">
						{t("skills.title")}
					</h1>
					<p className="text-sm md:text-base text-muted-foreground leading-relaxed">
						{locale === "zh_CN"
							? "覆盖前端、后端、移动端、桌面端、嵌入式、数据库等多个技术栈，可根据业务需求灵活选择最合适的技术组合。"
							: "A broad set of technologies across frontend, backend, mobile, desktop, embedded, databases and more, so we can choose the right tool for each project."}
					</p>
				</div>

				<CardGrid columns={4} gap="md">
					{skills.map((skill) => {
						const title = skill.name || skill.slug
						const iconSlug = skill.slug === "go" ? "goland" : skill.slug
						const iconSrc = `/assets/images/skills/${iconSlug}.svg`

						return (
							<Card
								key={skill.slug}
								className="flex h-full flex-col bg-card/80 border-border/60 px-4 py-3 md:px-5 md:py-4"
							>
								<div className="flex items-start gap-3 md:gap-4 mb-2">
									<div className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-primary/5 ring-1 ring-primary/10 shadow-sm overflow-hidden shrink-0">
										<Image
											src={iconSrc}
											alt={`${title} ${locale === "zh_CN" ? "技能图标" : "skill icon"} - Tiger Liu, China Developer`}
											fill
											sizes="40px"
											className="object-contain p-1.5"
										/>
									</div>
									<div className="min-w-0">
										<h2 className="text-sm md:text-base font-semibold tracking-tight mb-0.5 line-clamp-1">
											{title}
										</h2>
										<p className="text-[11px] md:text-xs uppercase tracking-[0.16em] text-muted-foreground/80">
											{skill.slug}
										</p>
									</div>
								</div>
								{skill.description && (
									<p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-4">
										{skill.description}
									</p>
								)}
							</Card>
						)
					})}
				</CardGrid>
			</div>
		</section>
		</>
	)
}
