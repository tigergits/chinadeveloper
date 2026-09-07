import Link from "next/link"
import { ArrowRight, Rss } from "lucide-react"
import { formatPostDate, formatTag, type BlogPostMeta } from "@/lib/blog"

interface BlogSidebarProps {
	posts: BlogPostMeta[]
	tags: { tag: string; count: number }[]
	/** 详情页传入当前文章 slug，最近文章列表会跳过它 */
	currentSlug?: string
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="rounded-xl border border-border bg-card p-5">
			<h2 className="mb-3 text-sm font-semibold tracking-tight">{title}</h2>
			{children}
		</section>
	)
}

/** 博客侧边栏：转化入口 + 最近文章 + 主题标签 + RSS */
export function BlogSidebar({ posts, tags, currentSlug }: BlogSidebarProps) {
	const recent = posts.filter((p) => p.slug !== currentSlug).slice(0, 5)

	return (
		<aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
			<section className="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
				<div className="glow-blob absolute -top-12 right-0 h-28 w-44" aria-hidden />
				<div className="relative">
					<h2 className="text-base font-bold tracking-tight">Need this shipped?</h2>
					<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
						I build browser extensions, SaaS and mobile apps — 24 products shipped solo.
					</p>
					<Link
						href="/en/contact"
						className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
					>
						Start a project
						<ArrowRight className="h-3.5 w-3.5" />
					</Link>
				</div>
			</section>

			{recent.length > 0 && (
				<Panel title="Recent posts">
					<ul className="space-y-3">
						{recent.map((p) => (
							<li key={p.slug}>
								<Link
									href={`/en/blog/${p.slug}/`}
									className="block text-sm font-medium leading-snug transition-colors hover:text-primary"
								>
									{p.title}
								</Link>
								<time dateTime={p.date} className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
									{formatPostDate(p.date)}
								</time>
							</li>
						))}
					</ul>
				</Panel>
			)}

			{tags.length > 0 && (
				<Panel title="Topics">
					<div className="flex flex-wrap gap-2">
						{tags.map(({ tag, count }) => (
							<span
								key={tag}
								className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
							>
								{formatTag(tag)}
								<span className="font-mono text-[10px] text-foreground/40">{count}</span>
							</span>
						))}
					</div>
				</Panel>
			)}

			<a
				href="/en/feed.xml"
				className="inline-flex items-center gap-2 px-1 text-sm text-muted-foreground transition-colors hover:text-primary"
			>
				<Rss className="h-3.5 w-3.5" />
				Subscribe by RSS
			</a>
		</aside>
	)
}
