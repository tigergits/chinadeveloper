"use client"

import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

const locales = ["en", "fr", "es", "ja", "zh_CN", "zh_TW"] as const

const localeLabels: Record<(typeof locales)[number], string> = {
	en: "English",
	fr: "Français",
	es: "Español",
	ja: "日本語",
	zh_CN: "简体中文",
	zh_TW: "繁體中文",
}

export function LanguageSwitcher() {
	const locale = useLocale()
	const pathname = usePathname()

	const switchLocale = (newLocale: string) => {
		const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/"
		window.location.href = `/${newLocale}${pathWithoutLocale}`
	}

	return (
		<Select value={locale} onValueChange={switchLocale}>
			<SelectTrigger className="w-[120px]">
				<SelectValue placeholder="Language" />
			</SelectTrigger>
			<SelectContent>
				{locales.map((loc) => (
					<SelectItem key={loc} value={loc}>
						{localeLabels[loc]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
