#!/usr/bin/env node
// 构建后清理：删除非英文语言下的 /blog 静态产物。
//
// 博客是单语英文。列表页 app/[locale]/blog/page.tsx 对非英文调用 notFound()，
// 但静态导出仍会为每个 locale 落一个 index.html —— 文件存在，Cloudflare Pages
// 就会以 200 返回这个「404 内容」页面，等于凭空多出 5 个可被索引的空 URL。
//
// 删掉这些文件后，public/_redirects 里的 301 规则才会真正生效
// （Pages 优先返回已存在的静态资源，命中不到才走 redirects）。
//
// 由 npm run build 自动调用。

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "..")
const outDir = path.join(repoRoot, "out")

const BLOG_LOCALE = "en"
const locales = ["en", "zh-cn", "es", "fr", "ja", "zh-tw"]

if (!fs.existsSync(outDir)) {
	console.error(`找不到 ${path.relative(repoRoot, outDir)}/，先跑 next build`)
	process.exit(1)
}

let removed = 0
for (const locale of locales) {
	if (locale === BLOG_LOCALE) continue
	const dir = path.join(outDir, locale, "blog")
	if (!fs.existsSync(dir)) continue
	fs.rmSync(dir, { recursive: true, force: true })
	console.log(`已删除 out/${locale}/blog/`)
	removed++
}

const kept = path.join(outDir, BLOG_LOCALE, "blog")
if (!fs.existsSync(kept)) {
	console.error(`out/${BLOG_LOCALE}/blog/ 不存在 —— 英文博客没有产出，构建可能有问题`)
	process.exit(1)
}

console.log(`博客产物清理完成：删除 ${removed} 个语言，保留 ${BLOG_LOCALE}`)
