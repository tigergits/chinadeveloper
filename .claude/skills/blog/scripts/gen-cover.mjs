#!/usr/bin/env node
// 生成博客封面 / OG 图（1200x630 webp），配色取自站点 CSS 变量。
//
// 用法：
//   node .claude/skills/blog/scripts/gen-cover.mjs <slug>
//   node .claude/skills/blog/scripts/gen-cover.mjs <slug> --chips "Purple Potassium,Blue Argon"
//
// 标题、副标题默认从 content/blog/<slug>/en.md 的 frontmatter 读取。
// 输出到 public/assets/blog/<slug>/cover.webp，与 frontmatter 的 cover 字段对应。

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"
import sharp from "sharp"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "../../../..")

const WIDTH = 1200
const HEIGHT = 630

// 站点品牌色（app/[locale]/globals.css 的 oklch 变量转 sRGB）
const C = {
	gradStart: "#4f4cda",
	gradEnd: "#9738e1",
	accent: "#00b5dc",
	ink: "#141726",
	mutedText: "#a8abbd",
}

// chip 名称里的颜色词 → 圆点颜色，让违规代号一眼可辨
const CHIP_DOT = {
	purple: "#9738e1",
	blue: "#4f4cda",
	yellow: "#e8b93a",
	red: "#e05252",
	green: "#3ec98a",
}

const args = process.argv.slice(2)
const slug = args[0]
if (!slug) {
	console.error('用法：node .claude/skills/blog/scripts/gen-cover.mjs <slug> [--chips "A,B,C"] [--title "..."]')
	process.exit(1)
}

function argValue(flag) {
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
const chips = (argValue("--chips") || "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean)

const esc = (s) =>
	String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** 按估算字宽做贪心折行（SVG 没有自动换行） */
function wrap(text, fontSize, maxWidth, maxLines) {
	const avg = fontSize * 0.54 // 粗体无衬线的平均字宽系数
	const perLine = Math.floor(maxWidth / avg)
	const words = text.split(/\s+/)
	const lines = []
	let cur = ""
	for (const w of words) {
		const next = cur ? `${cur} ${w}` : w
		if (next.length > perLine && cur) {
			lines.push(cur)
			cur = w
		} else {
			cur = next
		}
	}
	if (cur) lines.push(cur)
	if (lines.length > maxLines) {
		const kept = lines.slice(0, maxLines)
		kept[maxLines - 1] = kept[maxLines - 1].replace(/[,;:]?$/, "") + "…"
		return kept
	}
	return lines
}

// 标题行数多时缩小字号，保证三行内放得下
let titleSize = 66
let titleLines = wrap(title, titleSize, 980, 3)
if (titleLines.length === 3 && title.length > 58) {
	titleSize = 58
	titleLines = wrap(title, titleSize, 980, 3)
}

const titleTop = chips.length > 0 ? 232 : 268
const lineHeight = Math.round(titleSize * 1.22)

function dotColor(label) {
	const first = label.toLowerCase().split(/\s+/)[0]
	return CHIP_DOT[first] || C.accent
}

// chip 宽度按字数估算，逐个横向排布
let chipX = 80
const chipEls = chips
	.map((label) => {
		const w = Math.round(label.length * 9.4 + 46)
		const el = `
    <g transform="translate(${chipX}, 470)">
      <rect x="0" y="0" rx="17" ry="17" width="${w}" height="34" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.14"/>
      <circle cx="19" cy="17" r="5" fill="${dotColor(label)}"/>
      <text x="32" y="22" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="15" fill="${C.mutedText}">${esc(label)}</text>
    </g>`
		chipX += w + 12
		return el
	})
	.join("")

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1120"/>
      <stop offset="100%" stop-color="${C.ink}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.12" cy="0.08" r="0.55">
      <stop offset="0%" stop-color="${C.gradStart}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${C.gradStart}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.92" cy="0.95" r="0.6">
      <stop offset="0%" stop-color="${C.gradEnd}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${C.gradEnd}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.gradStart}"/>
      <stop offset="55%" stop-color="${C.gradEnd}"/>
      <stop offset="100%" stop-color="${C.accent}"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow1)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)"/>

  <rect x="80" y="86" width="86" height="4" rx="2" fill="url(#rule)"/>
  <text x="80" y="130" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="19" letter-spacing="2.6" fill="${C.mutedText}">CHINADEVELOPER.NET</text>

  <text font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="#ffffff">
${titleLines.map((l, i) => `    <tspan x="80" y="${titleTop + i * lineHeight}">${esc(l)}</tspan>`).join("\n")}
  </text>
${chipEls}

  <text x="80" y="570" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="20" fill="${C.mutedText}">Tiger Liu — building in public since 1993</text>
  <rect x="0" y="${HEIGHT - 6}" width="${WIDTH}" height="6" fill="url(#rule)"/>
</svg>`

const outDir = path.join(repoRoot, "public/assets/blog", slug)
const outPath = path.join(outDir, "cover.webp")
fs.mkdirSync(outDir, { recursive: true })

await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(outPath)

const { size } = fs.statSync(outPath)
console.log(`已生成 ${path.relative(repoRoot, outPath)}（${WIDTH}x${HEIGHT}, ${(size / 1024).toFixed(1)} KB）`)
console.log(`标题 ${titleLines.length} 行 @ ${titleSize}px${chips.length ? `，chips: ${chips.join(" / ")}` : ""}`)
