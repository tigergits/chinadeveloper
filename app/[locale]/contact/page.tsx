import { getTranslations, setRequestLocale } from "next-intl/server"
import { Locale } from "@/i18n/request"
import { Github, Twitter, Facebook, Mail, Linkedin } from "lucide-react"
import contactEn from "@/content/contact/en.json"

type ContactItem = {
	name: string
	value: string
}

const contacts = contactEn as ContactItem[]

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
		? "联系 Tiger Liu 讨论远程工作机会。China Developer - 资深全栈软件开发工程师，寻求全职或兼职远程工作机会。"
		: "Get in touch with Tiger Liu for remote work opportunities. China Developer - Senior Full-Stack Software Development Engineer seeking full-time or part-time remote positions."

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

	const emailItem = contacts.find((item) => item.name.toLowerCase() === "email")
	const otherContacts = contacts.filter((item) => item.name.toLowerCase() !== "email")

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
				"name": isZhCN ? "联系我" : "Contact",
				"item": `${baseUrl}/${locale}/contact`,
			},
		],
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
			/>
			<section className="relative px-4 py-16 overflow-hidden">
				<div className="pointer-events-none absolute inset-0 -z-10">
					<div className="absolute inset-0 bg-grid opacity-50" />
					<div className="glow-blob absolute -top-20 left-1/2 -translate-x-1/2 w-[32rem] h-72" />
				</div>

				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-12">
						<p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
							<span className="h-1.5 w-1.5 rounded-full bg-primary" />
							{isZhCN ? "联系" : "Contact"}
						</p>
						<h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-gradient-brand">
							{t("contact.title")}
						</h1>
						<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
							{t("contact.subtitle")}
						</p>
					</div>

					{emailItem && (
						<div className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-8 md:p-10 text-center">
							<div className="glow-blob absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-40" />
							<div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
								<Mail className="h-7 w-7 text-primary" />
							</div>
							<h2 className="relative mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
								{t("contact.email")}
							</h2>
							<a
								href={`mailto:${emailItem.value}`}
								className="relative mb-6 inline-block text-xl md:text-2xl font-semibold text-foreground hover:text-primary transition-colors"
							>
								{emailItem.value}
							</a>
							<div className="relative">
								<a
									href={`mailto:${emailItem.value}`}
									className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition transform"
								>
									<Mail size={20} />
									{t("home.emailCta")}
								</a>
							</div>
						</div>
					)}

					{otherContacts.length > 0 && (
						<div>
							<h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
								{t("contact.social")}
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{otherContacts.map((contact) => {
									const Icon = iconMap[contact.name] ?? Mail
									return (
										<a
											key={contact.name}
											href={contact.value}
											target="_blank"
											rel="noopener noreferrer"
											className="card-hover flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5"
										>
											<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
												<Icon className="h-6 w-6" />
											</div>
											<span className="text-sm font-medium">{contact.name}</span>
										</a>
									)
								})}
							</div>
						</div>
					)}
				</div>
			</section>
		</>
	)
}
