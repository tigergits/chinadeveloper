import { remark } from "remark"
import html from "remark-html"
import remarkGfm from "remark-gfm"

export interface ParsedPortfolioSections {
	bodyMarkdown: string
	screenshots: { alt: string; src: string }[]
	technologiesFromSection: string[]
}

export function parsePortfolioSections(content: string): ParsedPortfolioSections {
	const lines = content.split(/\r?\n/)

	const bodyLines: string[] = []
	const screenshots: { alt: string; src: string }[] = []
	const technologiesFromSection: string[] = []

	type Section = "body" | "screenshots" | "technologies"
	let section: Section = "body"

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const trimmed = line.trim()

		// 标题切换区块
		if (/^##\s+Screenshots/i.test(trimmed)) {
			section = "screenshots"
			// 不把这个标题放进正文
			continue
		}

		if (/^##\s+Technologies/i.test(trimmed)) {
			section = "technologies"
			// 不把这个标题放进正文
			continue
		}

		// 其他二级标题，归入正文
		if (/^##\s+/.test(trimmed)) {
			section = "body"
			bodyLines.push(line)
			continue
		}

		// Screenshots 区块中的图片
		if (section === "screenshots") {
			const imageMatch = /^!\[(.*?)\]\((.+?)\)/.exec(trimmed)
			if (imageMatch) {
				const alt = imageMatch[1] || ""
				const src = imageMatch[2]
				screenshots.push({ alt, src })
			}
			// 不把截图行放进正文
			continue
		}

		// Technologies 区块中的列表
		if (section === "technologies") {
			const listMatch = /^[-*+]\s+(.*)/.exec(trimmed)
			if (listMatch) {
				const value = listMatch[1].trim()
				if (value) {
					technologiesFromSection.push(value)
				}
				// 不把技术栈列表放进正文
				continue
			}

			// 空行直接跳过，保持分段
			if (trimmed === "") {
				continue
			}

			// 遇到非列表内容，说明 Technologies 区块结束，回到正文
			section = "body"
			bodyLines.push(line)
			continue
		}

		// 默认归入正文
		bodyLines.push(line)
	}

	return {
		bodyMarkdown: bodyLines.join("\n").trim(),
		screenshots,
		technologiesFromSection,
	}
}

export async function markdownToHtml(markdown: string): Promise<string> {
	if (!markdown) return ""

	const processedContent = await remark().use(remarkGfm).use(html).process(markdown)
	return processedContent.toString()
}


