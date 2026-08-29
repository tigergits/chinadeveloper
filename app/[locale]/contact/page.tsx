import { getTranslations, setRequestLocale } from "next-intl/server"
import { Locale } from "@/i18n/request"
import { Github, Twitter, Facebook, Mail, Linkedin, Briefcase, ExternalLink } from "lucide-react"
import { getContactInfo } from "@/lib/content"
import { getHireLinks, getSameAs } from "@/lib/hire"
import { ContactForm } from "@/components/contact-form"

const iconMap: Record<string, typeof Mail> = {
	Email: Mail,
	GitHub: Github,
	X: Twitter,
	Facebook: Facebook,
	LinkedIn: Linkedin,
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	const isZhCN = locale === "zh-cn"
	const title = `${t("contact.title")} - Tiger Liu | China Developer`
	const description = isZhCN
		? "联系 Tiger Liu：AI 加速的软件开发——Web 应用、浏览器扩展、移动应用与游戏。描述你的需求，24 小时内回复。"
		: "Contact Tiger Liu for AI-accelerated software development — web apps, browser extensions, mobile apps and games. Describe your project and get a reply within 24 hours."

	const ogImageUrl = `https://chinadeveloper.net/assets/images/og-image.png`

	return {
		title,
		description,
		authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
		alternates: {
			canonical: `https://chinadeveloper.net/${locale}/contact`,
		},
		openGraph: {
			title,
			description,
			type: "website",
			url: `https://chinadeveloper.net/${locale}/contact`,
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

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale })

	const contacts = await getContactInfo(locale)
	const hire = getHireLinks()
	const emailItem = contacts.find((item) => item.name.toLowerCase() === "email")
	const email = emailItem?.value || hire.email
	const otherContacts = contacts.filter((item) => item.name.toLowerCase() !== "email")

	const hirePlatforms = [
		{ name: "Upwork", href: hire.upwork },
		{ name: "Fiverr", href: hire.fiverr },
	].filter((p) => p.href)

	const isZhCN = locale === "zh-cn"
	const baseUrl = "https://chinadeveloper.net"

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: isZhCN ? "首页" : "Home", item: `${baseUrl}/${locale}` },
			{ "@type": "ListItem", position: 2, name: isZhCN ? "联系我" : "Contact", item: `${baseUrl}/${locale}/contact` },
		],
	}

	const personSchema = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: "Tiger Liu",
		url: baseUrl,
		email: `mailto:${email}`,
		jobTitle: "Senior Full-Stack Developer",
		sameAs: getSameAs(),
	}

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
			<section className="relative px-4 py-16 overflow-hidden">
				<div className="pointer-events-none absolute inset-0 -z-10">
					<div className="absolute inset-0 bg-grid opacity-50" />
					<div className="glow-blob absolute -top-20 left-1/2 -translate-x-1/2 w-[32rem] h-72" />
				</div>

				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
							<span className="h-1.5 w-1.5 rounded-full bg-primary" />
							{isZhCN ? "联系" : "Contact"}
						</p>
						<h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-gradient-brand">
							{t("contact.title")}
						</h1>
						<p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
							{t("contact.subtitle")}
						</p>
					</div>

					<div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
						{/* 左：表单 */}
						<ContactForm email={email} />

						{/* 右：直达渠道 */}
						<div className="flex flex-col gap-6">
							<div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-6">
								<div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
									<Mail className="h-6 w-6 text-primary" />
								</div>
								<h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
									{t("contact.email")}
								</h2>
								<a
									href={`mailto:${email}`}
									className="text-lg font-semibold text-foreground transition-colors hover:text-primary break-all"
								>
									{email}
								</a>
							</div>

							{hirePlatforms.length > 0 && (
								<div className="rounded-2xl border border-border bg-card p-6">
									<h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
										{t("contact.hirePlatforms")}
									</h2>
									<div className="flex flex-col gap-3">
										{hirePlatforms.map((p) => (
											<a
												key={p.name}
												href={p.href}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center justify-between rounded-xl border border-border px-4 py-3 font-medium transition-colors hover:bg-foreground/5"
											>
												<span className="flex items-center gap-2">
													<Briefcase className="h-5 w-5 text-primary" />
													{p.name}
												</span>
												<ExternalLink className="h-4 w-4 text-muted-foreground" />
											</a>
										))}
									</div>
								</div>
							)}

							{otherContacts.length > 0 && (
								<div className="rounded-2xl border border-border bg-card p-6">
									<h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
										{t("contact.social")}
									</h2>
									<div className="grid grid-cols-2 gap-3">
										{otherContacts.map((contact) => {
											const Icon = iconMap[contact.name] ?? Mail
											return (
												<a
													key={contact.name}
													href={contact.value}
													target="_blank"
													rel="noopener noreferrer"
													className="card-hover flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-3"
												>
													<Icon className="h-5 w-5 text-primary" />
													<span className="text-sm font-medium">{contact.name}</span>
												</a>
											)
										})}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
