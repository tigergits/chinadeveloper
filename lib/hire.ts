import hire from "@/data/hire.json"

export interface HireLinks {
	email: string
	upwork: string
	fiverr: string
	linkedin: string
	github: string
}

export function getHireLinks(): HireLinks {
	const { email, upwork, fiverr, linkedin, github } = hire as HireLinks & { _note?: string }
	return { email, upwork, fiverr, linkedin, github }
}

/** JSON-LD Person.sameAs：只包含已填写的外部主页 */
export function getSameAs(): string[] {
	const h = getHireLinks()
	return [h.github, h.linkedin, h.upwork, h.fiverr].filter(Boolean)
}
