import Link from "next/link"
import Image from "next/image"
import { formatPostDate, formatTag, type BlogPostMeta } from "@/lib/blog"

/**
 * 文章卡片。两种形态：
 * - featured：最新一篇，图文左右分栏、占满主列宽度
 * - 默认：网格卡，图在上
 *
 * 约定：整张卡是链接（不用 “Read article →” 这类附加文字链），
 * 等宽字体只用于日期这类机器字面量。
 */

function Meta({ post, className = "" }: { post: BlogPostMeta; className?: string }) {
	return (
		<div className={`flex items-center gap-3 text-xs text-muted-foreground ${className}`}>
			<time dateTime={post.date} className="font-mono tracking-tight">
				{formatPostDate(post.date)}
			</time>
			<span className="h-3 w-px bg-border" aria-hidden />
			<span>{post.readingMinutes} min read</span>
		</div>
	)
}

function Tags({ post, max = 3 }: { post: BlogPostMeta; max?: number }) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{post.tags.slice(0, max).map((tag) => (
				<span
					key={tag}
					className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
				>
					{formatTag(tag)}
				</span>
			))}
		</div>
	)
}

export function FeaturedPostCard({ post }: { post: BlogPostMeta }) {
	const href = `/en/blog/${post.slug}/`

	return (
		<article className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
			{/* 封面是 1200x630 且图内含文章数据，任何裁切都会切掉信息：
			    图整幅置顶，文字在下方分两栏，卡片不至于过高。 */}
			<div className="relative aspect-[1200/630] w-full overflow-hidden border-b border-border">
				<Image
					src={post.cover}
					alt=""
					fill
					className="object-cover"
					sizes="(max-width: 1024px) 100vw, 880px"
					priority
				/>
			</div>

			<div className="p-6 sm:p-8">
				<Meta post={post} className="mb-3" />
				<div className="grid gap-x-10 gap-y-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
					<h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-[1.7rem]">
						<Link href={href} className="after:absolute after:inset-0 hover:text-primary transition-colors">
							{post.title}
						</Link>
					</h2>
					<div className="space-y-4">
						<p className="text-sm leading-relaxed text-muted-foreground">{post.description}</p>
						<Tags post={post} />
					</div>
				</div>
			</div>
		</article>
	)
}

export function PostCard({ post }: { post: BlogPostMeta }) {
	const href = `/en/blog/${post.slug}/`

	return (
		<article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
			<div className="relative aspect-[1200/630] w-full overflow-hidden border-b border-border">
				<Image src={post.cover} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 340px" />
			</div>

			<div className="flex flex-1 flex-col gap-3 p-5">
				<Meta post={post} />
				<h2 className="text-lg font-semibold leading-snug tracking-tight">
					<Link href={href} className="after:absolute after:inset-0 hover:text-primary transition-colors">
						{post.title}
					</Link>
				</h2>
				<p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
				<Tags post={post} max={2} />
			</div>
		</article>
	)
}
