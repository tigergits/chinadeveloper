import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowRight, Briefcase } from "lucide-react"
import { getHireLinks } from "@/lib/hire"

interface HireCtaProps {
	locale: string
	/** 详情页传入项目名，联系页表单会预填该项目 */
	projectSlug?: string
	projectName?: string
}

/** “想要类似的产品？”转化卡片：放在作品集列表与详情页底部 */
export async function HireCta({ locale, projectSlug, projectName }: HireCtaProps) {
	const t = await getTranslations({ locale, namespace: "hire" })
	const links = getHireLinks()
	const contactHref = projectSlug ? `/${locale}/contact?project=${encodeURIComponent(projectSlug)}` : `/${locale}/contact`

	return (
		<section className="relative mt-14 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-8 sm:p-10">
			<div className="glow-blob absolute -top-16 right-10 h-40 w-72" />
			<div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="max-w-xl">
					<p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
						<Briefcase className="h-4 w-4" />
						{t("badge")}
					</p>
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
						{projectName ? t("title", { name: projectName }) : t("titleGeneric")}
					</h2>
					<p className="mt-2 text-muted-foreground">{t("description")}</p>
				</div>
				<div className="flex flex-shrink-0 flex-col items-start gap-3">
					<Link
						href={contactHref}
						className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105 hover:shadow-xl"
					>
						{t("cta")}
						<ArrowRight className="h-4 w-4" />
					</Link>
					{(links.upwork || links.fiverr) && (
						<p className="text-sm text-muted-foreground">
							{t("or")}{" "}
							{links.upwork && (
								<a href={links.upwork} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
									Upwork
								</a>
							)}
							{links.upwork && links.fiverr && " · "}
							{links.fiverr && (
								<a href={links.fiverr} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
									Fiverr
								</a>
							)}
						</p>
					)}
				</div>
			</div>
		</section>
	)
}
