import { getTranslations, setRequestLocale } from "next-intl/server"
import { HeroSection } from "@/components/hero-section"
import { getAllContent, getContactInfo } from "@/lib/content"
import { Locale } from "@/i18n/request"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/card"
import { CardGrid } from "@/components/card-grid"
import { SectionWrapper } from "@/components/section-wrapper"

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	const isZhCN = locale === "zh-cn"
	const title = isZhCN 
		? "Tiger Liu - 资深全栈软件开发工程师 | China Developer"
		: "Tiger Liu - Senior Full-Stack Developer | China Developer"
	const description = isZhCN
		? "Tiger Liu 是一位拥有25+年经验的资深全栈软件开发工程师。China Developer - 自1993年起构建强大的软件解决方案。寻求远程工作机会。"
		: "Tiger Liu is a Senior Full-Stack Software Development Engineer with 25+ years of experience. China Developer - Building robust software solutions since 1993. Available for remote work opportunities."

	const ogImageUrl = `https://chinadeveloper.net/assets/images/og-image.png`
	
	return {
		title,
		description,
		keywords: [
			"Tiger Liu",
			"China Developer",
			"Senior Full-Stack Developer",
			"Full-Stack Software Engineer",
			"25+ years experience",
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
			? "Tiger Liu 是一位拥有25+年经验的资深全栈软件开发工程师。China Developer - 自1993年起构建强大的软件解决方案。"
			: "Tiger Liu is a Senior Full-Stack Software Development Engineer with 25+ years of experience. China Developer - Building robust software solutions since 1993.",
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
		</div>
	)
}
