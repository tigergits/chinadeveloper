import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import remarkGfm from "remark-gfm"
import { Locale } from "@/i18n/request"

const contentDirectory = path.join(process.cwd(), "content")

export interface ContentMetadata {
	title?: string
	slug?: string
	cover?: string
	technologies?: string[]
	github?: string
	gitee?: string
	icon?: string
	[key: string]: any
}

export interface ContentItem {
	slug: string
	metadata: ContentMetadata
	content: string
	htmlContent: string
}

export async function getContentBySlug(
	category: string,
	slug: string,
	locale: Locale = "en"
): Promise<ContentItem | null> {
	const fullPath = path.join(contentDirectory, category, slug, `${locale}.md`)

	if (!fs.existsSync(fullPath)) {
		return null
	}

	const fileContents = fs.readFileSync(fullPath, "utf8")
	const { data, content } = matter(fileContents)

	const processedContent = await remark().use(remarkGfm).use(html).process(content)
	const htmlContent = processedContent.toString()

	return {
		slug,
		metadata: data as ContentMetadata,
		content,
		htmlContent,
	}
}

export async function getAllContent(category: string, locale: Locale = "en"): Promise<ContentItem[]> {
	const categoryPath = path.join(contentDirectory, category)

	if (!fs.existsSync(categoryPath)) {
		return []
	}

	const entries = fs.readdirSync(categoryPath, { withFileTypes: true })
	const items: ContentItem[] = []

	for (const entry of entries) {
		if (entry.isDirectory()) {
			const item = await getContentBySlug(category, entry.name, locale)
			if (item) {
				items.push(item)
			}
		}
	}

	return items.sort((a, b) => {
		const titleA = a.metadata.title || a.slug
		const titleB = b.metadata.title || b.slug
		return titleA.localeCompare(titleB)
	})
}

export async function getAboutContent(locale: Locale = "en"): Promise<string> {
	const fullPath = path.join(contentDirectory, "about", `${locale}.md`)

	if (!fs.existsSync(fullPath)) {
		return ""
	}

	const fileContents = fs.readFileSync(fullPath, "utf8")
	const { content } = matter(fileContents)
	return content
}

export interface ContactItem {
	name: string
	value: string
}

export async function getContactInfo(locale: Locale = "en"): Promise<ContactItem[]> {
	const fullPath = path.join(contentDirectory, "contact", `${locale}.json`)

	if (!fs.existsSync(fullPath)) {
		// Fallback to English if locale file doesn't exist
		const fallbackPath = path.join(contentDirectory, "contact", "en.json")
		if (!fs.existsSync(fallbackPath)) {
			return []
		}
		const fileContents = fs.readFileSync(fallbackPath, "utf8")
		return JSON.parse(fileContents) as ContactItem[]
	}

	const fileContents = fs.readFileSync(fullPath, "utf8")
	return JSON.parse(fileContents) as ContactItem[]
}
