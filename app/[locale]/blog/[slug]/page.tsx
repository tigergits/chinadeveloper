import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import { Locale } from "@/i18n/request"
import { markdownToHtml } from "@/lib/portfolio"
import {
	BLOG_LOCALE,
	formatPostDate,
	formatTag,
	getBlogPost,
	getBlogSlugs,
	getRelatedPosts,
} from "@/lib/blog"

const BASE_URL = "https://chinadeveloper.net"

/**
 * 博客只有英文。父层 [locale] 会为六种语言各调一次本函数，
 * 非英文直接返回空数组 —— 这样静态导出只产出 /en/blog/<slug>/。
 */
export async function generateStaticParams({ params }: { params: { locale: Locale } }) {
	if (params.locale !== BLOG_LOCALE) return []
	return getBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { locale, slug } = await params
	const post = locale === BLOG_LOCALE ? getBlogPost(slug) : null
	if (!post) return { title: "Not Found" }

	const url = `${BASE_URL}/${BLOG_LOCALE}/blog/${post.slug}/`
	const ogImage = post.cover.startsWith("http") ? post.cover : `${BASE_URL}${post.cover}`

	return {
		title: post.title,
		description: post.description,
		keywords: [post.targetKeyword, ...post.secondaryKeywords, ...post.tags.map(formatTag)],
		authors: [{ name: "Tiger Liu", url: BASE_URL }],
		alternates: { canonical: url },
		openGraph: {
			title: post.title,
			description: post.description,
			type: "article",
			url,
			siteName: "China Developer - Tiger Liu",
			publishedTime: post.date,
			modifiedTime: post.updated,
			authors: ["Tiger Liu"],
			tags: post.tags,
			images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: post.description,
			images: [ogImage],
		},
	}
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
	const { locale, slug } = await params
	if (locale !== BLOG_LOCALE) notFound()

	setRequestLocale(locale)

	const post = getBlogPost(slug)
	if (!post) notFound()

	const bodyHtml = await markdownToHtml(post.content)
	const related = getRelatedPosts(slug)

	const url = `${BASE_URL}/${BLOG_LOCALE}/blog/${post.slug}/`
	const ogImage = post.cover.startsWith("http") ? post.cover : `${BASE_URL}${post.cover}`

	const articleSchema = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.description,
		image: ogImage,
		datePublished: post.date,
		dateModified: post.updated,
		keywords: [post.targetKeyword, ...post.secondaryKeywords].join(", "),
		author: { "@type": "Person", name: "Tiger Liu", url: BASE_URL },
		publisher: { "@type": "Organization", name: "China Developer", url: BASE_URL },
		mainEntityOfPage: { "@type": "WebPage", "@id": url },
		inLanguage: "en",
	}

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/${BLOG_LOCALE}` },
			{ "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/${BLOG_LOCALE}/blog/` },
			{ "@type": "ListItem", position: 3, name: post.title, item: url },
		],
	}

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

			{/* w-full + min-w-0：本 div 是 main（flex col）的 flex item，mx-auto 会关掉 cross-axis
			    stretch 而改用内容宽度，宽表格会因此撑出横向滚动条。 */}
			<div className="w-full min-w-0 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
				<Link
					href={`/${BLOG_LOCALE}/blog/`}
					className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					All posts
				</Link>

				<header className="mb-8">
					<h1 className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">{post.title}</h1>

					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
						<span className="inline-flex items-center gap-1.5">
							<Calendar className="h-4 w-4" />
							<time dateTime={post.date}>{formatPostDate(post.date)}</time>
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Clock className="h-4 w-4" />
							{post.readingMinutes} min read
						</span>
						{post.updated !== post.date && <span>Updated {formatPostDate(post.updated)}</span>}
					</div>

					{post.tags.length > 0 && (
						<div className="mt-4 flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
								>
									{formatTag(tag)}
								</span>
							))}
						</div>
					)}
				</header>

				<div className="relative mb-10 aspect-[1200/630] w-full overflow-hidden rounded-xl border border-border">
					<Image src={post.cover} alt={post.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 768px" />
				</div>

				<div className="markdown-content blog-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

				{related.length > 0 && (
					<section className="mt-14 border-t border-border pt-8">
						<h2 className="mb-4 text-lg font-semibold tracking-tight">Related</h2>
						<ul className="space-y-3">
							{related.map((r) => (
								<li key={r.slug}>
									<Link
										href={`/${BLOG_LOCALE}/blog/${r.slug}/`}
										className="text-primary hover:text-accent transition-colors"
									>
										{r.title}
									</Link>
									<p className="text-sm text-muted-foreground">{r.description}</p>
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
		</>
	)
}
