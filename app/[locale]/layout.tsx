import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales, Locale } from "@/i18n/request"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CookieConsent from "@/components/cookie-consent"
import GoogleAnalytics from "@/components/google-analytics"
import { ThemeProvider } from "@/components/theme-provider"
import { getContactInfo } from "@/lib/content"
import "./globals.css"

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params
	return {
		metadataBase: new URL("https://chinadeveloper.net"),
		title: {
			template: "%s | Tiger Liu - China Developer",
			default: "Tiger Liu - Senior Full-Stack Developer | China Developer",
		},
		description: "Tiger Liu is a Senior Full-Stack Software Development Engineer with 25+ years of experience. China Developer - Building robust software solutions since 1993. Available for remote work opportunities.",
		keywords: [
			"Tiger Liu",
			"China Developer",
			"Senior Full-Stack Developer",
			"Full-Stack Software Engineer",
			"China Developer.net",
			"remote developer",
			"software development",
			"25+ years experience",
			"full-stack engineer",
			"China developer portfolio",
		],
		alternates: {
			canonical: `/${locale}`,
			languages: {
				en: "/en",
				"zh-CN": "/zh-cn",
				"zh-TW": "/zh-tw",
				es: "/es",
				fr: "/fr",
				ja: "/ja",
			},
		},
		authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
		openGraph: {
			type: "website",
			siteName: "China Developer - Tiger Liu",
			title: "Tiger Liu - Senior Full-Stack Developer | China Developer",
			description: "Tiger Liu is a Senior Full-Stack Software Development Engineer with 25+ years of experience. China Developer - Building robust software solutions since 1993.",
			images: [
				{
					url: "https://chinadeveloper.net/assets/images/og-image.png",
					width: 1200,
					height: 630,
					alt: "Tiger Liu - Senior Full-Stack Developer | China Developer",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: "Tiger Liu - Senior Full-Stack Developer | China Developer",
			description: "Tiger Liu is a Senior Full-Stack Software Development Engineer with 25+ years of experience. China Developer - Building robust software solutions since 1993.",
			images: ["https://chinadeveloper.net/assets/images/og-image.png"],
		},
	}
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params

	if (!locales.includes(locale as any)) {
		notFound()
	}

	setRequestLocale(locale)
	const messages = await getMessages()
	const contactInfo = await getContactInfo(locale as Locale)

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<GoogleAnalytics />
			</head>
			<body className="flex flex-col min-h-screen">
				<ThemeProvider>
					<NextIntlClientProvider messages={messages}>
						<Header />
						<main className="flex-1 flex flex-col max-w-7xl mx-auto px-8 py-4">{children}</main>
						<Footer contactInfo={contactInfo} />
						<CookieConsent />
					</NextIntlClientProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
