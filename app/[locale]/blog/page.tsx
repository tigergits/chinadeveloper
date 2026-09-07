import { setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Locale } from "@/i18n/request"
import { getAllBlogPosts, getAllBlogTags, BLOG_LOCALE } from "@/lib/blog"
import { FeaturedPostCard, PostCard } from "@/components/blog-card"
import { BlogSidebar } from "@/components/blog-sidebar"

const BASE_URL = "https://chinadeveloper.net"
const TITLE = "Blog — Notes From Shipping Software"
const DESCRIPTION =
	"Rejection notices, build logs and the things that broke: what I learned shipping browser extensions, SaaS and games as a solo developer."

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	// 博客只有英文，非英文语言不产出页面，也就不需要 metadata
	if (locale !== BLOG_LOCALE) return { title: "Not Found" }

	const url = `${BASE_URL}/${BLOG_LOCALE}/blog/`
	const ogImage = `${BASE_URL}/assets/images/og-image.png`

	return {
		title: TITLE,
		description: DESCRIPTION,
		authors: [{ name: "Tiger Liu", url: BASE_URL }],
		alternates: {
			canonical: url,
			types: { "application/rss+xml": `${BASE_URL}/${BLOG_LOCALE}/feed.xml` },
		},
		openGraph: {
			title: TITLE,
			description: DESCRIPTION,
			type: "website",
			url,
			siteName: "China Developer - Tiger Liu",
			images: [{ url: ogImage, width: 1200, height: 630, alt: TITLE }],
		},
		twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [ogImage] },
	}
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params

	// 单语英文：其余语言不生成博客页
	if (locale !== BLOG_LOCALE) notFound()

	setRequestLocale(locale)

	const posts = getAllBlogPosts()
	const tags = getAllBlogTags()
	const [featured, ...rest] = posts

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/${BLOG_LOCALE}` },
			{ "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/${BLOG_LOCALE}/blog/` },
		],
	}

	const blogSchema = {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: TITLE,
		description: DESCRIPTION,
		url: `${BASE_URL}/${BLOG_LOCALE}/blog/`,
		author: { "@type": "Person", name: "Tiger Liu", url: BASE_URL },
		blogPost: posts.map((post) => ({
			"@type": "BlogPosting",
			headline: post.title,
			datePublished: post.date,
			dateModified: post.updated,
			url: `${BASE_URL}/${BLOG_LOCALE}/blog/${post.slug}/`,
		})),
	}

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

			<div className="w-full min-w-0 max-w-6xl mx-auto px-4 sm:px-6">
				<header className="border-b border-border py-12 sm:py-16">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-gradient-brand">Blog</h1>
					<p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{DESCRIPTION}</p>
					{posts.length > 0 && (
						<p className="mt-5 text-xs text-muted-foreground/70">
							{posts.length} {posts.length === 1 ? "post" : "posts"}, latest{" "}
							<time dateTime={posts[0].date} className="font-mono">
								{posts[0].date}
							</time>
						</p>
					)}
				</header>

				{posts.length === 0 ? (
					<p className="py-16 text-muted-foreground">Nothing published yet. The first post is being written.</p>
				) : (
					<div className="grid gap-10 py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_296px] lg:gap-12">
						<div className="min-w-0 space-y-8">
							<FeaturedPostCard post={featured} />

							{rest.length > 0 && (
								<div className="grid gap-6 sm:grid-cols-2">
									{rest.map((post) => (
										<PostCard key={post.slug} post={post} />
									))}
								</div>
							)}
						</div>

						<BlogSidebar posts={posts} tags={tags} />
					</div>
				)}
			</div>
		</>
	)
}
