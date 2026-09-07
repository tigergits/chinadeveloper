import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { formatPostDate, formatTag, type BlogPostMeta } from "@/lib/blog"

export function BlogCard({ post }: { post: BlogPostMeta }) {
	const href = `/en/blog/${post.slug}/`

	return (
		<article className="group relative rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
			<div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
				<span className="inline-flex items-center gap-1.5">
					<Calendar className="h-3.5 w-3.5" />
					<time dateTime={post.date}>{formatPostDate(post.date)}</time>
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Clock className="h-3.5 w-3.5" />
					{post.readingMinutes} min read
				</span>
			</div>

			<h2 className="mb-2 text-xl font-semibold tracking-tight">
				<Link href={href} className="after:absolute after:inset-0 hover:text-primary transition-colors">
					{post.title}
				</Link>
			</h2>

			<p className="mb-4 text-sm leading-relaxed text-muted-foreground">{post.description}</p>

			<div className="flex flex-wrap gap-2">
				{post.tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
					>
						{formatTag(tag)}
					</span>
				))}
			</div>
		</article>
	)
}
