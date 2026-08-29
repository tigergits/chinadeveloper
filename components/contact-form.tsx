"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Mail } from "lucide-react"

interface ContactFormProps {
	email: string
}

const PROJECT_TYPES = ["webapp", "extension", "mobile", "game", "ai", "other"] as const
const BUDGETS = ["b0", "b1", "b2", "b3", "b4"] as const

// mailto URL 过长会被部分客户端（Outlook 等）截断，正文限长
const MAX_MESSAGE = 2000

function ContactFormInner({ email }: ContactFormProps) {
	const t = useTranslations("contact")
	const searchParams = useSearchParams()
	const project = searchParams.get("project") || ""

	const [name, setName] = useState("")
	const [fromEmail, setFromEmail] = useState("")
	const [projectType, setProjectType] = useState<string>("webapp")
	const [budget, setBudget] = useState<string>("b0")
	const [message, setMessage] = useState("")
	const [opened, setOpened] = useState(false)

	const budgetLabel = (b: string) => t(`budgets.${b}`)
	const typeLabel = (p: string) => t(`projectTypes.${p}`)

	// 表单内容直接拼成 mailto，由用户自己的邮件客户端发出
	const mailtoHref = useMemo(() => {
		const subject = project
			? `[chinadeveloper.net] ${name} — ${project}`
			: `[chinadeveloper.net] ${name} — new inquiry`
		// 元信息与正文之间留空行；分开拼接，避免空串被 filter 掉
		const meta = [
			project ? `About: ${project}` : "",
			`Name: ${name}`,
			`Email: ${fromEmail}`,
			`Project type: ${typeLabel(projectType)}`,
			`Budget: ${budgetLabel(budget)}`,
		]
			.filter(Boolean)
			.join("\n")
		const body = `${meta}\n\n${message}`
		return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [email, project, name, fromEmail, projectType, budget, message])

	// 走 form submit 而非裸 <a>，保留浏览器原生的必填 / 邮箱格式校验
	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setOpened(true)
		window.location.href = mailtoHref
	}

	const inputCls =
		"w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-primary/30 transition focus:ring-2"

	return (
		<form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
			<h2 className="mb-5 text-xl font-semibold tracking-tight">{t("formTitle")}</h2>
			{project && (
				<p className="mb-4 inline-block rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
					{t("aboutProject", { name: project })}
				</p>
			)}
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium">{t("formName")}</label>
					<input id="cf-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
				</div>
				<div>
					<label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium">{t("formEmail")}</label>
					<input
						id="cf-email"
						type="email"
						required
						value={fromEmail}
						onChange={(e) => setFromEmail(e.target.value)}
						className={inputCls}
					/>
				</div>
				<div>
					<label htmlFor="cf-type" className="mb-1.5 block text-sm font-medium">{t("formProjectType")}</label>
					<select id="cf-type" value={projectType} onChange={(e) => setProjectType(e.target.value)} className={inputCls}>
						{PROJECT_TYPES.map((p) => (
							<option key={p} value={p}>
								{typeLabel(p)}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="cf-budget" className="mb-1.5 block text-sm font-medium">{t("formBudget")}</label>
					<select id="cf-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className={inputCls}>
						{BUDGETS.map((b) => (
							<option key={b} value={b}>
								{budgetLabel(b)}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="mt-4">
				<label htmlFor="cf-msg" className="mb-1.5 block text-sm font-medium">{t("formMessage")}</label>
				<textarea
					id="cf-msg"
					required
					rows={5}
					maxLength={MAX_MESSAGE}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder={t("formMessagePlaceholder")}
					className={inputCls}
				/>
			</div>

			<button
				type="submit"
				className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105 hover:shadow-xl"
			>
				<Mail className="h-4 w-4" />
				{t("formFallbackCta")}
			</button>

			{/* mailto 在未配置邮件客户端的设备上是静默无反应的，必须给出直达邮箱 */}
			{opened && (
				<div className="mt-4 rounded-xl border border-border bg-muted/60 p-4 text-sm">
					<p className="mb-2 text-muted-foreground">{t("formMailtoOpened")}</p>
					<a href={`mailto:${email}`} className="font-medium text-primary hover:underline break-all">
						{email}
					</a>
				</div>
			)}
		</form>
	)
}

export function ContactForm(props: ContactFormProps) {
	return (
		<Suspense fallback={null}>
			<ContactFormInner {...props} />
		</Suspense>
	)
}
