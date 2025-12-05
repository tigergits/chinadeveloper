import { getTranslations } from "next-intl/server"
import { Locale } from "@/i18n/request"
import { Github, Twitter, Facebook, Mail } from "lucide-react"
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
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	const t = await getTranslations({ locale })

	const isZhCN = locale === "zh_CN"
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
	const t = await getTranslations({ locale })

	const emailItem = contacts.find((item) => item.name.toLowerCase() === "email")
	const otherContacts = contacts.filter((item) => item.name.toLowerCase() !== "email")

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
		<div className="container px-4 py-16">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-4xl font-bold mb-8 text-center">{t("contact.title")}</h1>

				<div className="space-y-8">
					<div className="text-center">
						<p className="text-lg text-foreground/60 mb-6">
							I&apos;m open to full-time or part-time remote work opportunities. Let&apos;s discuss how I
							can help with your project.
						</p>
					</div>

					{emailItem && (
						<div className="border rounded-lg p-8">
							<h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
								<Mail className="h-6 w-6" />
								{t("contact.email")}
							</h2>
							<a
								href={`mailto:${emailItem.value}`}
								className="text-xl text-foreground hover:underline"
							>
								{emailItem.value}
							</a>
						</div>
					)}

					{otherContacts.length > 0 && (
						<div className="border rounded-lg p-8">
							<h2 className="text-2xl font-semibold mb-6">{t("contact.social")}</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{otherContacts.map((contact) => {
									const Icon = iconMap[contact.name] ?? Mail
									return (
										<a
											key={contact.name}
											href={contact.value}
											target="_blank"
											rel="noopener noreferrer"
											className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-foreground/5 transition-colors"
										>
											<Icon className="h-8 w-8" />
											<span className="text-sm">{contact.name}</span>
										</a>
									)
								})}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
		</>
	)
}
