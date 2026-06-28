import { getTranslations, setRequestLocale } from "next-intl/server"
import { HeroSection } from "@/components/hero-section"
import { getAllContent, getContactInfo } from "@/lib/content"
import { Locale } from "@/i18n/request"
import Link from "next/link"
import Image from "next/image"
import {
	Mail,
	Rocket,
	Smartphone,
	Gamepad2,
	Puzzle,
	Bot,
	Workflow,
	Wrench,
	Search,
	FileText,
	GraduationCap,
	type LucideIcon,
} from "lucide-react"
import { Card } from "@/components/card"
import { CardGrid } from "@/components/card-grid"
import { SectionWrapper } from "@/components/section-wrapper"

interface Service {
	slug: string
	name?: string
	tagline?: string
	description?: string
}

const serviceIcons: Record<string, LucideIcon> = {
	"ai-fullstack": Rocket,
	"mobile-app": Smartphone,
	"game-development": Gamepad2,
	"browser-extension": Puzzle,
	"ai-agent": Bot,
	"ai-workflow": Workflow,
	"maintenance-migration": Wrench,
	"seo-geo": Search,
	"doc-processing": FileText,
	"ai-consulting": GraduationCap,
}

async function getServices(locale: Locale): Promise<Service[]> {
	try {
		return (await import(`@/content/services/${locale}.json`)).default
	} catch {
		return (await import(`@/content/services/en.json`)).default
	}
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	const isZhCN = locale === "zh-cn"
	const title = isZhCN 
		? "Tiger Liu - 资深全栈软件开发工程师 | China Developer"
		: "Tiger Liu - Senior Full-Stack Developer | China Developer"
	const description = isZhCN
		? "Tiger Liu，拥有30年全栈开发经验的资深工程师，由 Claude Code、Cursor、Codex 加持。帮个人或团队快速构建 SaaS、Web/移动应用、游戏、浏览器扩展、AI 工作流等。寻求远程工作机会。"
		: "Tiger Liu is a Senior Full-Stack Developer with 30 years of experience, supercharged with Claude Code, Cursor & Codex. I help individuals and teams ship SaaS, web & mobile apps, games, browser extensions and AI workflows — fast. Available for remote work."

	const ogImageUrl = `https://chinadeveloper.net/assets/images/og-image.png`
	
	return {
		title,
		description,
		keywords: [
			"Tiger Liu",
			"China Developer",
			"Senior Full-Stack Developer",
			"Full-Stack Software Engineer",
			"AI development",
			"Claude Code",
			"Cursor",
			"30 years experience",
			"remote work",
			"software development",
			"China Developer.net",
		],
		authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
		alternates: {
			canonical: `https://chinadeveloper.net/${locale}`,
		},
		openGraph: {
			title,
			description,
			type: "website",
			url: `https://chinadeveloper.net/${locale}`,
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

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	const portfolios = await getAllContent("portfolios", locale)
	const skills = await getAllContent("skills", locale)
	const contactInfo = await getContactInfo(locale)
	const services = await getServices(locale)
	const previewServices = services.slice(0, 6)
	const emailForCta = contactInfo.find(item => item.name === 'Email')?.value || "tiger.hu.liu@gmail.com"
	const featuredPortfolios = portfolios.filter(portfolio => ['atp', 'qtrade', 'train'].includes(portfolio.slug))

	const isZhCN = locale === "zh-cn"
	// Get social links from contact info for JSON-LD
	const socialLinksForJsonLd = contactInfo
		.filter(item => item.name !== 'Email')
		.map(item => item.value)
	const emailForJsonLd = contactInfo.find(item => item.name === 'Email')?.value || "tiger.hu.liu@gmail.com"
	
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Person",
		"name": "Tiger Liu",
		"alternateName": "China Developer",
		"jobTitle": isZhCN ? "资深全栈软件开发工程师" : "Senior Full-Stack Software Development Engineer",
		"description": isZhCN
			? "Tiger Liu 是一位拥有30年经验的资深全栈软件开发工程师，由 Claude Code、Cursor、Codex 加持，帮个人和团队快速交付软件。"
			: "Tiger Liu is a Senior Full-Stack Software Development Engineer with 30 years of experience, supercharged with Claude Code, Cursor & Codex to help individuals and teams ship software fast.",
		"url": `https://chinadeveloper.net/${locale}`,
		"sameAs": socialLinksForJsonLd.length > 0 ? socialLinksForJsonLd : [
			"https://github.com/tigergits",
			"https://x.com/liuhu",
			"https://www.facebook.com/hu.liu.9216"
		],
		"email": emailForJsonLd,
		"knowsAbout": [
			"Full-Stack Development",
			"Software Engineering",
			"Web Development",
			"Mobile Development",
			"Database Design",
			"Cloud Computing"
		],
		"alumniOf": {
			"@type": "Organization",
			"name": "Software Development Industry"
		},
		"worksFor": {
			"@type": "Organization",
			"name": "China Developer"
		}
	}

	return (
		<div className="flex flex-col">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			{/* Hero Section */}
			<HeroSection contactInfo={contactInfo} />

			{/* AI Services Preview */}
			{previewServices.length > 0 && (
				<SectionWrapper
					id="ai-services"
					title={t("home.servicesTitle")}
					description={t("home.servicesDescription")}
				>
					<CardGrid columns={3}>
						{previewServices.map((service) => {
							const Icon = serviceIcons[service.slug] || Rocket
							return (
								<Link
									key={service.slug}
									href={`/${locale}/services`}
									className="group block h-full"
								>
									<Card className="flex h-full flex-col bg-gradient-to-br from-card to-muted/40 border-border/60">
										<div className="flex items-center gap-4 mb-3">
											<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30">
												<Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
											</div>
											<h3 className="text-lg font-semibold tracking-tight">{service.name || service.slug}</h3>
										</div>
										{service.tagline && (
											<p className="text-sm font-medium text-primary/80 mb-2">{service.tagline}</p>
										)}
										{service.description && (
											<p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
												{service.description}
											</p>
										)}
									</Card>
								</Link>
							)
						})}
					</CardGrid>
					<div className="text-center mt-8">
						<Link
							href={`/${locale}/services`}
							className="inline-flex items-center gap-1 text-primary font-medium hover:translate-x-1 transition-transform"
						>
							{t("home.viewServices")}
						</Link>
					</div>
				</SectionWrapper>
			)}

			{/* Featured Projects */}
			{featuredPortfolios.length > 0 && (
				<SectionWrapper
					id="featured-projects"
					title={t("home.featuredProjects")}
					description={t("home.featuredDescription")}
				>
					<CardGrid columns={3}>
						{featuredPortfolios.map((project) => (
							<Card key={project.slug}>
								<Link href={`/${locale}/portfolios/${project.slug}`} className="flex flex-col h-full">
									{project.metadata.cover && (
										<div className="relative w-full h-48 mb-4 rounded overflow-hidden">
											<Image
												src={
													"/assets/images/portfolios/" +
													project.slug +
													"/" +
													project.metadata.cover
												}
												alt={`${project.metadata.title || project.slug} - ${isZhCN ? "精选项目" : "Featured project"} by Tiger Liu, China Developer`}
												fill
												className="object-cover"
											/>
										</div>
									)}
									<h3 className="text-xl font-semibold mb-2">
										{project.metadata.title || project.slug}
									</h3>
									{project.metadata.technologies && (
										<div className="flex flex-wrap gap-2 mt-2">
											{project.metadata.technologies.map((tech) => (
												<span
													key={tech}
													className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
												>
													{tech}
												</span>
											))}
										</div>
									)}
								</Link>
							</Card>
						))}
					</CardGrid>
				</SectionWrapper>
			)}

			{/* Skills Preview */}
			{skills.length > 0 && (
				<SectionWrapper
					id="skills-preview"
					title={t("home.skills")}
					description={t("home.skillsDescription")}
					className="bg-muted/30"
				>
					<CardGrid columns={4}>
						{skills.slice(0, 12).map((skill) => (
							<Card key={skill.slug} hover={false}>
								<div className="text-center">
									<h3 className="font-semibold text-sm">{skill.metadata.title || skill.slug}</h3>
								</div>
							</Card>
						))}
					</CardGrid>
					<div className="text-center mt-8">
						<Link
							href={`/${locale}/skills`}
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							View all skills →
						</Link>
					</div>
				</SectionWrapper>
			)}

			{/* Email CTA */}
			<section className="px-6 py-20">
				<div className="max-w-2xl mx-auto text-center rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10 px-6 py-12">
					<h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
						{t("services.ctaTitle")}
					</h2>
					<p className="text-muted-foreground mb-6">{t("home.emailNote")}</p>
					<a
						href={`mailto:${emailForCta}`}
						className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform"
					>
						<Mail size={20} />
						{t("home.emailCta")}
					</a>
					<p className="mt-4 text-sm text-muted-foreground">
						<a href={`mailto:${emailForCta}`} className="font-medium text-foreground hover:text-primary transition-colors">
							{emailForCta}
						</a>
					</p>
				</div>
			</section>
		</div>
	)
}
