#!/usr/bin/env node
// 生成博客封面 / OG 图（1200x630 webp），配色取自站点 CSS 变量。
//
// 设计立场：封面渲染文章的**真实数据**，不做装饰。
// 一篇讲 7 封拒信的文章，封面就把这 7 条记录列出来。
//
// 用法：
//   node .claude/skills/blog/scripts/gen-cover.mjs <slug>
//   ... --ledger "2026-01-01|Purple Potassium,2026-07-02|Blue Argon"   右侧记录条（首选）
//   ... --chips "Plasmo,WXT,vanilla MV3"                                无日期时的备选
//   ... --stat "7|rejections"                                           只有一个关键数字时
//   ... --title "..."                                                   覆盖 frontmatter 标题
//
// 三者都不给就只排标题（满宽）。输出 public/assets/blog/<slug>/cover.webp。

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"
import sharp from "sharp"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "../../../..")

const W = 1200
const H = 630
const PAD = 76

// 站点品牌色（app/[locale]/globals.css 的 oklch 变量转 sRGB）
const C = {
	gradStart: "#4f4cda",
	gradEnd: "#9738e1",
	accent: "#00b5dc",
	ink: "#0d0f1c",
	ink2: "#151830",
	text: "#ffffff",
	dim: "#9ea2bb",
	faint: "#787ea6",
}

// 记录名里的颜色词 → 圆点色，让同类记录一眼归组
const DOT = {
	purple: "#a855f7",
	blue: "#5b7cfa",
	yellow: "#e8b93a",
	red: "#f0616d",
	green: "#3ec98a",
	orange: "#f0913a",
}

const args = process.argv.slice(2)
const slug = args[0]
if (!slug) {
	console.error('用法：node .claude/skills/blog/scripts/gen-cover.mjs <slug> [--ledger "date|Name,..."] [--chips "a,b"] [--stat "7|rejections"] [--title "..."]')
	process.exit(1)
}

const argValue = (flag) => {
	const i = args.indexOf(flag)
	return i !== -1 && args[i + 1] ? args[i + 1] : null
}

const postPath = path.join(repoRoot, "content/blog", slug, "en.md")
let fm = {}
if (fs.existsSync(postPath)) {
	fm = matter(fs.readFileSync(postPath, "utf8")).data
} else if (!argValue("--title")) {
	console.error(`找不到 ${path.relative(repoRoot, postPath)}，且没给 --title`)
	process.exit(1)
}

const title = argValue("--title") || String(fm.title || slug)

const ledger = (argValue("--ledger") || "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean)
	.map((row) => {
		const [left, right = ""] = row.split("|").map((s) => s.trim())
		return { left, right }
	})

const chips = (argValue("--chips") || "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean)

const statRaw = argValue("--stat")
const stat = statRaw ? { value: statRaw.split("|")[0].trim(), label: (statRaw.split("|")[1] || "").trim() } : null

const esc = (s) =>
	String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const dotFor = (label) => DOT[String(label).toLowerCase().split(/\s+/)[0]] || C.accent

/** 按估算字宽贪心折行（SVG 无自动换行） */
function wrap(text, fontSize, maxWidth, maxLines) {
	const perLine = Math.floor(maxWidth / (fontSize * 0.52))
	const lines = []
	let cur = ""
	for (const w of text.split(/\s+/)) {
		const next = cur ? `${cur} ${w}` : w
		if (next.length > perLine && cur) {
			lines.push(cur)
			cur = w
		} else cur = next
	}
	if (cur) lines.push(cur)
	if (lines.length > maxLines) {
		const kept = lines.slice(0, maxLines)
		kept[maxLines - 1] = kept[maxLines - 1].replace(/[,;:]$/, "") + "…"
		return kept
	}
	return lines
}

// 有右侧面板时标题占左半栏，否则满宽
const hasPanel = ledger.length > 0 || stat !== null
const titleMaxWidth = hasPanel ? 590 : 1000
const titleMaxLines = hasPanel ? 4 : 3

let titleSize = hasPanel ? 56 : 68
let titleLines = wrap(title, titleSize, titleMaxWidth, titleMaxLines)
while (titleLines.length > (hasPanel ? 3 : 2) && titleSize > 40) {
	titleSize -= 4
	titleLines = wrap(title, titleSize, titleMaxWidth, titleMaxLines)
}
const lineH = Math.round(titleSize * 1.16)

// 标题块垂直居中（在 chips 之上留出空间）
const blockH = titleLines.length * lineH
const titleTop = Math.round((H - blockH) / 2) - (chips.length && !hasPanel ? 34 : 0) + titleSize * 0.34

// ── 右侧记录条 ──────────────────────────────────────────────
const PANEL_X = 700
const PANEL_W = W - PANEL_X - PAD
let panel = ""

if (ledger.length > 0) {
	const rowH = Math.min(46, Math.floor(400 / ledger.length))
	const panelH = ledger.length * rowH + 28
	const panelY = Math.round((H - panelH) / 2)
	const rows = ledger
		.map((r, i) => {
			const y = panelY + 14 + i * rowH + rowH / 2
			return `
    <circle cx="${PANEL_X + 22}" cy="${y}" r="4.5" fill="${dotFor(r.right)}"/>
    <text x="${PANEL_X + 40}" y="${y + 5}" font-family="JetBrains Mono, Consolas, ui-monospace, monospace" font-size="15" fill="${C.dim}">${esc(r.left)}</text>
    <text x="${PANEL_X + 152}" y="${y + 5}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="15" fill="${C.faint}">${esc(r.right)}</text>`
		})
		.join("")
	panel = `
  <rect x="${PANEL_X}" y="${panelY}" width="${PANEL_W}" height="${panelH}" rx="16" fill="#ffffff" fill-opacity="0.045" stroke="#ffffff" stroke-opacity="0.10"/>
  ${rows}`
} else if (stat) {
	const cy = H / 2
	panel = `
  <text x="${PANEL_X + PANEL_W / 2}" y="${cy + 24}" text-anchor="middle" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="190" font-weight="700" fill="url(#rule)">${esc(stat.value)}</text>
  <text x="${PANEL_X + PANEL_W / 2}" y="${cy + 74}" text-anchor="middle" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="21" fill="${C.dim}">${esc(stat.label)}</text>`
}

// ── 底部 chips（无右侧面板时才用）────────────────────────────
let chipEls = ""
if (chips.length > 0 && !hasPanel) {
	let x = PAD
	chipEls = chips
		.map((label) => {
			const w = Math.round(label.length * 9.2 + 48)
			const el = `
    <g transform="translate(${x}, 462)">
      <rect x="0" y="0" rx="18" ry="18" width="${w}" height="36" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.13"/>
      <circle cx="20" cy="18" r="4.5" fill="${dotFor(label)}"/>
      <text x="34" y="23" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="15" fill="${C.dim}">${esc(label)}</text>
    </g>`
			x += w + 12
			return el
		})
		.join("")
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.ink}"/>
      <stop offset="100%" stop-color="${C.ink2}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.05" cy="0.0" r="0.62">
      <stop offset="0%" stop-color="${C.gradStart}" stop-opacity="0.50"/>
      <stop offset="100%" stop-color="${C.gradStart}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="1.0" cy="1.0" r="0.62">
      <stop offset="0%" stop-color="${C.gradEnd}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${C.gradEnd}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.gradStart}"/>
      <stop offset="55%" stop-color="${C.gradEnd}"/>
      <stop offset="100%" stop-color="${C.accent}"/>
    </linearGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- 左侧竖向渐变导轨：全图唯一的强调装置 -->
  <rect x="${PAD - 28}" y="${PAD}" width="5" height="${H - PAD * 2}" rx="2.5" fill="url(#rule)"/>

  <text font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="${C.text}" letter-spacing="-0.8">
${titleLines.map((l, i) => `    <tspan x="${PAD}" y="${titleTop + i * lineH}">${esc(l)}</tspan>`).join("\n")}
  </text>
${panel}${chipEls}

  <text x="${PAD}" y="${H - PAD + 8}" font-family="JetBrains Mono, Consolas, ui-monospace, monospace" font-size="17" fill="${C.faint}">chinadeveloper.net</text>
</svg>`

const outDir = path.join(repoRoot, "public/assets/blog", slug)
const outPath = path.join(outDir, "cover.webp")
fs.mkdirSync(outDir, { recursive: true })

await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile(outPath)

const { size } = fs.statSync(outPath)
console.log(`已生成 ${path.relative(repoRoot, outPath)}（${W}x${H}, ${(size / 1024).toFixed(1)} KB）`)
console.log(
	`标题 ${titleLines.length} 行 @ ${titleSize}px` +
		(ledger.length ? `，ledger ${ledger.length} 条` : stat ? `，stat ${stat.value}` : chips.length ? `，chips ${chips.length} 个` : "，仅标题")
)
