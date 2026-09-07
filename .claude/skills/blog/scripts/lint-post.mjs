#!/usr/bin/env node
// 博客文章校验：frontmatter 规范 + 去 AI 味硬规则 + 内链 + SEO。
// 用法：node .claude/skills/blog/scripts/lint-post.mjs <slug>
//       node .claude/skills/blog/scripts/lint-post.mjs --all
// ❌ 存在时退出码 1。

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "../../../..")
const blogRoot = path.join(repoRoot, "content/blog")

// ---------- 规则表（与 references/voice.md 保持同步）----------

const BANNED_PHRASES = [
	"in today's fast-paced",
	"in today's world",
	"in the world of",
	"in the ever-evolving",
	"has become increasingly popular",
	"whether you're a beginner",
	"let's dive in",
	"let's dive into",
	"let's explore",
	"it's important to note",
	"it's worth noting",
	"at the end of the day",
	"needless to say",
	"when it comes to",
	"the key takeaway",
	"here's the thing",
	"here's the kicker",
	"in conclusion",
	"to sum up",
	"boost your productivity",
	"treasure trove",
]

const BANNED_WORDS = [
	"seamless",
	"seamlessly",
	"robust",
	"powerful",
	"game-changer",
	"game-changing",
	"leverage",
	"leveraging",
	"utilize",
	"utilizing",
	"delve",
	"realm",
	"tapestry",
	"elevate",
	"streamline",
	"cutting-edge",
	"state-of-the-art",
	"comprehensive",
	"effortlessly",
	"revolutionize",
	"supercharge",
]

const BANNED_HEADINGS = [
	"conclusion",
	"final thoughts",
	"wrapping up",
	"wrap up",
	"summary",
	"overview",
	"background",
	"getting started",
	"introduction",
]

const VALID_TYPES = ["pitfall", "comparison", "listicle", "build-in-public", "howto"]

const WORD_RANGE = {
	pitfall: [1200, 2000],
	comparison: [1800, 3000],
	listicle: [1500, 2500],
	"build-in-public": [1000, 2500],
	howto: [1000, 2200],
}

const REQUIRED_FIELDS = [
	"title",
	"description",
	"date",
	"updated",
	"type",
	"targetKeyword",
	"secondaryKeywords",
	"tags",
	"cover",
	"draft",
]

// ---------- 工具 ----------

const productSlugs = new Set()
try {
	const d = JSON.parse(fs.readFileSync(path.join(repoRoot, "data/showcase.generated.json"), "utf8"))
	for (const it of Array.isArray(d) ? d : d.items || []) productSlugs.add(it.slug)
} catch {
	// 数据源缺失时跳过产品 slug 校验
}

// 去掉围栏代码块与行内代码，避免代码里的词被误判
function stripCode(md) {
	const fence = String.fromCharCode(96).repeat(3)
	const fenceRe = new RegExp(fence + "[\\s\\S]*?" + fence, "g")
	const inlineRe = new RegExp(String.fromCharCode(96) + "[^" + String.fromCharCode(96) + "\\n]*" + String.fromCharCode(96), "g")
	return md.replace(fenceRe, "").replace(inlineRe, "")
}

function lineOf(text, index) {
	return text.slice(0, index).split("\n").length
}

function checkPost(slug) {
	const file = path.join(blogRoot, slug, "en.md")
	const errs = []
	const warns = []
	const oks = []

	if (!fs.existsSync(file)) {
		return { errs: [`找不到 ${path.relative(repoRoot, file)}`], warns, oks }
	}

	const raw = fs.readFileSync(file, "utf8")
	const { data: fm, content } = matter(raw)
	const prose = stripCode(content)
	const proseLower = prose.toLowerCase()

	// --- frontmatter ---
	for (const f of REQUIRED_FIELDS) {
		if (fm[f] === undefined || fm[f] === null || fm[f] === "") errs.push(`frontmatter 缺 ${f}`)
	}

	const kw = String(fm.targetKeyword || "").toLowerCase()
	const kwReal = kw && kw !== "todo"
	if (!kwReal) errs.push("targetKeyword 未填写或还是 TODO")

	if (fm.title) {
		const t = String(fm.title)
		if (/TODO/i.test(t)) errs.push("title 还是 TODO")
		else if (t.length > 60) errs.push(`title ${t.length} 字符，超过 60（SERP 会截断）`)
		else oks.push(`title 长度 ${t.length}/60`)
		if (kwReal && !t.toLowerCase().includes(kw)) warns.push(`title 不含 targetKeyword "${fm.targetKeyword}"`)
	}

	if (fm.description) {
		const d = String(fm.description)
		if (/TODO/i.test(d)) errs.push("description 还是 TODO")
		else if (d.length < 140 || d.length > 160) errs.push(`description ${d.length} 字符，应在 140-160`)
		else oks.push(`description 长度 ${d.length}/140-160`)
		if (kwReal && !d.toLowerCase().includes(kw)) warns.push("description 不含 targetKeyword")
	}

	if (fm.type && !VALID_TYPES.includes(fm.type)) errs.push(`type "${fm.type}" 不在 ${VALID_TYPES.join(" / ")} 中`)

	for (const f of ["date", "updated"]) {
		const v = fm[f]
		if (!v) continue
		const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v)
		if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) errs.push(`${f} 格式应为 YYYY-MM-DD，当前 "${s}"`)
	}

	const sk = Array.isArray(fm.secondaryKeywords) ? fm.secondaryKeywords : []
	if (sk.length < 3 || sk.length > 5) errs.push(`secondaryKeywords 应有 3-5 个，当前 ${sk.length}`)
	if (sk.some((k) => /TODO/i.test(String(k)))) errs.push("secondaryKeywords 还有 TODO")

	const tags = Array.isArray(fm.tags) ? fm.tags : []
	if (tags.length < 2 || tags.length > 4) errs.push(`tags 应有 2-4 个，当前 ${tags.length}`)
	for (const t of tags) {
		if (/TODO/i.test(String(t))) errs.push("tags 还有 TODO")
		else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(t))) errs.push(`tag "${t}" 不是 kebab-case`)
	}

	for (const p of fm.products || []) {
		if (productSlugs.size && !productSlugs.has(p)) errs.push(`products 里的 "${p}" 不在 showcase.generated.json 中`)
	}

	// --- 去 AI 味 ---
	for (const phrase of BANNED_PHRASES) {
		let i = proseLower.indexOf(phrase)
		while (i !== -1) {
			errs.push(`L${lineOf(prose, i)} 禁用句式："${phrase}"`)
			i = proseLower.indexOf(phrase, i + phrase.length)
		}
	}

	// 词干匹配：leverage 要能抓到 leveraged / leveraging，elevate 抓到 elevated
	const hitWords = new Set()
	for (const w of BANNED_WORDS) {
		const esc = w.replace(/-/g, "[-]")
		const pattern = esc.endsWith("e")
			? "\\b" + esc.slice(0, -1) + "(?:e|es|ed|ing|ely)\\b"
			: "\\b" + esc + "(?:s|es|ed|ing|ly)?\\b"
		const re = new RegExp(pattern, "gi")
		let m
		while ((m = re.exec(prose)) !== null) {
			const key = `${m.index}:${m[0].toLowerCase()}`
			if (hitWords.has(key)) continue
			hitWords.add(key)
			errs.push(`L${lineOf(prose, m.index)} 禁用词："${m[0]}"`)
		}
	}

	const headings = [...content.matchAll(/^(#{2,3})\s+(.+)$/gm)]
	for (const h of headings) {
		const text = h[2].trim().toLowerCase().replace(/[:：].*$/, "").trim()
		if (BANNED_HEADINGS.includes(text)) errs.push(`L${lineOf(content, h.index)} 空标题："${h[2].trim()}"`)
		if (/\p{Extended_Pictographic}/u.test(h[2])) warns.push(`L${lineOf(content, h.index)} 标题里有 emoji："${h[2].trim()}"`)
	}

	// bullet 句式过于统一：**Bold**: 开头占比过高
	const bullets = [...content.matchAll(/^\s*[-*]\s+(.+)$/gm)].map((m) => m[1])
	const boldLead = bullets.filter((b) => /^\*\*[^*]+\*\*\s*[:：]/.test(b)).length
	if (bullets.length >= 6 && boldLead / bullets.length > 0.8) {
		warns.push(`bullet 句式过于统一：${boldLead}/${bullets.length} 都是 **Bold**: 开头，混用短句和整句`)
	}

	// 句长方差：连续 4 句都超过 18 词
	const sentences = prose
		.replace(/^\s*[-*#>|].*$/gm, "")
		.split(/(?<=[.!?])\s+/)
		.map((s) => s.trim())
		.filter((s) => s.split(/\s+/).length > 2)
	let run = 0
	let flagged = false
	for (const s of sentences) {
		if (s.split(/\s+/).length > 18) {
			run++
			if (run >= 4 && !flagged) {
				warns.push("有连续 4 句以上的长句（>18 词），典型 AI 节奏——插入短句")
				flagged = true
			}
		} else {
			run = 0
		}
	}

	// --- 内链 / SEO ---
	const links = [...content.matchAll(/\]\((\/en\/[^)]+)\)/g)].map((m) => m[1])
	const productLinks = links.filter((l) => l.startsWith("/en/portfolios/"))
	const blogLinks = links.filter((l) => l.startsWith("/en/blog/"))
	if (links.length < 3) errs.push(`站内链接只有 ${links.length} 条，至少要 3 条`)
	else oks.push(`站内链接 ${links.length} 条`)
	if (productLinks.length < 1) errs.push("没有指向 /en/portfolios/<slug>/ 的产品内链")
	if (blogLinks.length < 1) warns.push("没有指向其他博客文章的内链（首篇可忽略，文章多了必须补）")
	for (const l of links) {
		if (!l.endsWith("/")) warns.push(`内链缺尾斜杠（站点 trailingSlash: true）：${l}`)
	}

	const firstWords = prose.trim().split(/\s+/).slice(0, 100).join(" ").toLowerCase()
	if (kwReal && !firstWords.includes(kw)) errs.push("targetKeyword 未出现在首 100 词内")
	else if (kwReal) oks.push("targetKeyword 出现在首段")

	const h2s = headings.filter((h) => h[1] === "##").map((h) => h[2].toLowerCase())
	const kwTokens = kw.split(/\s+/).filter((t) => t.length > 3)
	const h2HasKw = kwTokens.length > 0 && h2s.some((h) => kwTokens.every((t) => h.includes(t)))
	if (kwReal && !h2HasKw) warns.push("没有 H2 包含 targetKeyword 或其变体")
	if (h2s.length < 3) warns.push(`只有 ${h2s.length} 个 H2，结构偏薄`)

	const words = prose.split(/\s+/).filter(Boolean).length
	const range = WORD_RANGE[fm.type] || [1000, 3000]
	if (words < range[0]) errs.push(`正文 ${words} 词，${fm.type} 类型下限 ${range[0]}`)
	else if (words > range[1]) warns.push(`正文 ${words} 词，超过 ${fm.type} 上限 ${range[1]}`)
	else oks.push(`字数 ${words}（${range[0]}-${range[1]}）`)

	if (fm.type === "comparison" && !/^\s*\|.+\|/m.test(content)) {
		errs.push("comparison 类型必须有对比表格（AI 引用和精选摘要优先抓表格）")
	}

	if (/TODO/.test(content)) errs.push("正文里还有 TODO")

	return { errs, warns, oks }
}

// ---------- 主流程 ----------

const arg = process.argv[2]
if (!arg) {
	console.error("用法：node .claude/skills/blog/scripts/lint-post.mjs <slug> | --all")
	process.exit(1)
}

let slugs = []
if (arg === "--all") {
	if (!fs.existsSync(blogRoot)) {
		console.log("content/blog/ 还不存在，没有文章可查。")
		process.exit(0)
	}
	slugs = fs
		.readdirSync(blogRoot, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => e.name)
} else {
	slugs = [arg]
}

let failed = 0
for (const slug of slugs) {
	const { errs, warns, oks } = checkPost(slug)
	console.log(`\n=== ${slug} ===`)
	for (const o of oks) console.log(`  ✅ ${o}`)
	for (const w of warns) console.log(`  ⚠️  ${w}`)
	for (const e of errs) console.log(`  ❌ ${e}`)
	if (!errs.length && !warns.length) console.log("  ✅ 全部通过")
	if (errs.length) failed++
}

console.log(`\n${slugs.length} 篇检查完成，${failed} 篇有阻塞项。`)
process.exit(failed ? 1 : 0)
