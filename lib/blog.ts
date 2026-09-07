import fs from "fs"
import path from "path"
import matter from "gray-matter"

/**
 * 博客内容读取。
 *
 * 博客是**单语英文**：内容只存在于 content/blog/<slug>/en.md，不做多语言翻译
 * （机翻多份有被判 low-value auto-generated content 的风险）。路由仍在 [locale] 下，
 * 但只有 en 会生成静态页，其余语言的导航直接指向 /en/blog/。
 */

export const BLOG_LOCALE = "en" as const

const blogDirectory = path.join(process.cwd(), "content", "blog")

export type BlogType = "pitfall" | "comparison" | "listicle" | "build-in-public" | "howto"

export interface BlogPostMeta {
	slug: string
	title: string
	description: string
	/** YYYY-MM-DD */
	date: string
	/** YYYY-MM-DD */
	updated: string
	type: BlogType
	targetKeyword: string
	secondaryKeywords: string[]
	tags: string[]
	products: string[]
	cover: string
	draft: boolean
	readingMinutes: number
}

export interface BlogPost extends BlogPostMeta {
	content: string
}

/** frontmatter 的 date 会被 gray-matter 解析成 Date，统一转回 YYYY-MM-DD */
function toDateString(value: unknown): string {
	if (value instanceof Date) return value.toISOString().slice(0, 10)
	if (typeof value === "string") return value.slice(0, 10)
	return ""
}

function toStringArray(value: unknown): string[] {
	return Array.isArray(value) ? value.map(String) : []
}

/** 按 200 词/分钟估算，向上取整，至少 1 分钟 */
function readingMinutes(markdown: string): number {
	const words = markdown.split(/\s+/).filter(Boolean).length
	return Math.max(1, Math.round(words / 200))
}

function parsePost(slug: string): BlogPost | null {
	const fullPath = path.join(blogDirectory, slug, `${BLOG_LOCALE}.md`)
	if (!fs.existsSync(fullPath)) return null

	const { data, content } = matter(fs.readFileSync(fullPath, "utf8"))

	return {
		slug,
		title: String(data.title ?? slug),
		description: String(data.description ?? ""),
		date: toDateString(data.date),
		updated: toDateString(data.updated) || toDateString(data.date),
		type: (data.type ?? "pitfall") as BlogType,
		targetKeyword: String(data.targetKeyword ?? ""),
		secondaryKeywords: toStringArray(data.secondaryKeywords),
		tags: toStringArray(data.tags),
		products: toStringArray(data.products),
		cover: String(data.cover ?? "/assets/images/og-image.png"),
		draft: data.draft === true,
		readingMinutes: readingMinutes(content),
		content,
	}
}

/** 已发布文章，按发布日期倒序。草稿默认排除。 */
export function getAllBlogPosts(includeDrafts = false): BlogPost[] {
	if (!fs.existsSync(blogDirectory)) return []

	const posts: BlogPost[] = []
	for (const entry of fs.readdirSync(blogDirectory, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue
		const post = parsePost(entry.name)
		if (!post) continue
		if (post.draft && !includeDrafts) continue
		posts.push(post)
	}

	return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export function getBlogPost(slug: string): BlogPost | null {
	const post = parsePost(slug)
	if (!post || post.draft) return null
	return post
}

/** 生成静态路由用：已发布文章的 slug */
export function getBlogSlugs(): string[] {
	return getAllBlogPosts().map((p) => p.slug)
}

/** 标签及其文章数，按文章数倒序 */
export function getAllBlogTags(): { tag: string; count: number }[] {
	const counts = new Map<string, number>()
	for (const post of getAllBlogPosts()) {
		for (const tag of post.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1)
		}
	}
	return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
		(a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
	)
}

/** 同标签的其他文章，用于详情页底部的相关阅读 */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
	const current = getBlogPost(slug)
	if (!current) return []

	const scored = getAllBlogPosts()
		.filter((p) => p.slug !== slug)
		.map((p) => ({ post: p, shared: p.tags.filter((t) => current.tags.includes(t)).length }))
		.filter((s) => s.shared > 0)
		.sort((a, b) => b.shared - a.shared || b.post.date.localeCompare(a.post.date))

	return scored.slice(0, limit).map((s) => s.post)
}

/** kebab-case 标签转展示文案：chrome-extensions → Chrome Extensions */
export function formatTag(tag: string): string {
	return tag
		.split("-")
		.map((w) => (w === "v3" ? "V3" : w.charAt(0).toUpperCase() + w.slice(1)))
		.join(" ")
}

export function formatPostDate(date: string): string {
	if (!date) return ""
	return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	})
}
