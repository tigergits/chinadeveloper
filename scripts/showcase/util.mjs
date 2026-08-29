// @ts-check
/**
 * showcase 生成管线共用工具：locale 映射、文件读取、素材拷贝（sharp 压缩）。
 */

import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

export const SITE_LOCALES = ["en", "zh-cn", "es", "fr", "ja", "zh-tw"]

// listing-all-languages.md / 各类 kit 里的语言码 → 站点 locale
export const LISTING_LOCALE_MAP = {
	en: "en",
	zh: "zh-cn",
	"zh-cn": "zh-cn",
	"zh_cn": "zh-cn",
	"zh-hans": "zh-cn",
	"zh_hans": "zh-cn",
	"zh-tw": "zh-tw",
	"zh_tw": "zh-tw",
	"zh-hant": "zh-tw",
	"zh_hant": "zh-tw",
	es: "es",
	fr: "fr",
	ja: "ja",
}

// 游戏 listing 目录名 → 站点 locale
export const GAME_LOCALE_MAP = { en: "en", "zh-Hans": "zh-cn", "zh-Hant": "zh-tw" }

export const warnings = []
export const warn = (m) => {
	warnings.push(m)
	console.warn("  ⚠ " + m)
}

export function readJson(p) {
	return JSON.parse(fs.readFileSync(p, "utf8"))
}

export function readJsonSafe(p) {
	try {
		return readJson(p)
	} catch {
		return null
	}
}

export function readTextSafe(p) {
	try {
		return fs.readFileSync(p, "utf8").trim()
	} catch {
		return ""
	}
}

export function stripFrontmatter(md) {
	if (md.startsWith("---")) {
		const end = md.indexOf("\n---", 3)
		if (end !== -1) return md.slice(md.indexOf("\n", end + 1) + 1).trimStart()
	}
	return md
}

export function titleFromFilename(name) {
	return name
		.replace(/\.[a-z0-9]+$/i, "")
		.replace(/[-_]+/g, " ")
		.replace(/\b\w/g, (ch) => ch.toUpperCase())
}

/** 空的 per-locale 容器 */
export function emptyContent() {
	const c = {}
	for (const l of SITE_LOCALES) c[l] = {}
	return c
}

export function readPrivacy(p) {
	if (!fs.existsSync(p)) return null
	return stripFrontmatter(fs.readFileSync(p, "utf8")).trim() || null
}

const isImg = (f) => /\.(png|jpg|jpeg|webp)$/i.test(f)

/**
 * 截图压缩落盘：宽 >1600 缩到 1600，统一输出 webp（q80）。
 * 返回 web 路径（或 null）。destName 不带扩展名。
 */
export async function copyScreenshot(src, destDir, destName, webBase) {
	if (!src || !fs.existsSync(src) || !fs.statSync(src).isFile()) return null
	fs.mkdirSync(destDir, { recursive: true })
	const outName = `${destName}.webp`
	try {
		await sharp(src).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(destDir, outName))
		return `${webBase}/${outName}`
	} catch (e) {
		warn(`截图处理失败 ${src}: ${e.message}`)
		return null
	}
}

/** logo 原样拷贝（保留格式），返回 web 路径（或 null） */
export function copyLogo(candidates, destDir, webBase) {
	for (const c of candidates) {
		if (c && fs.existsSync(c) && fs.statSync(c).isFile()) {
			const ext = path.extname(c).toLowerCase() === ".svg" ? "svg" : path.extname(c).toLowerCase() === ".webp" ? "webp" : "png"
			fs.mkdirSync(destDir, { recursive: true })
			fs.copyFileSync(c, path.join(destDir, `logo.${ext}`))
			return `${webBase}/logo.${ext}`
		}
	}
	return null
}

/** 从多个候选目录里发现截图文件（绝对路径数组）。优先编号帧，其次全部图片。 */
export function discoverScreenshotFiles(dirCandidates, limit = 8) {
	for (const dir of dirCandidates) {
		if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue
		const all = fs.readdirSync(dir).filter(isImg)
		if (!all.length) continue
		const framed = all.filter((f) => /^(cws|scrn|shot|steam|screenshot)[-_]?\d/i.test(f)).sort()
		const pick = (framed.length ? framed : all.sort()).slice(0, limit)
		return pick.map((f) => path.join(dir, f))
	}
	return []
}

/** 扫描目录根的编号截图（scrn-1.jpg 这类平铺在根目录的情况） */
export function discoverRootScreenshots(dir, limit = 8) {
	if (!dir || !fs.existsSync(dir)) return []
	return fs
		.readdirSync(dir)
		.filter((f) => isImg(f) && /^(cws|scrn|shot)[-_]?\d/i.test(f))
		.sort()
		.slice(0, limit)
		.map((f) => path.join(dir, f))
}

/** 字段标签 → 规范字段名 */
function normalizeField(label) {
	const l = label.trim().toLowerCase()
	if (l.startsWith("name")) return "name"
	if (l.startsWith("short")) return "short"
	if (l.startsWith("detail")) return "long"
	if (l.startsWith("categor")) return "category"
	return null
}

/** 字段内容清理：去掉 ``` 围栏与 > 注释行、首尾的 --- 分隔线 */
function cleanFieldText(lines) {
	const kept = lines.filter((l) => !/^\s*```/.test(l) && !/^\s*>/.test(l))
	while (kept.length && (/^---\s*$/.test(kept[0]) || !kept[0].trim())) kept.shift()
	while (kept.length && (/^---\s*$/.test(kept[kept.length - 1]) || !kept[kept.length - 1].trim())) kept.pop()
	return kept.join("\n").trim()
}

/** 无语言代码时按语言名识别 */
const LANG_NAME_MAP = [
	[/english/i, "en"],
	[/简体中文|simplified|中文（中国）|中文\(中国\)/i, "zh-cn"],
	[/繁體中文|traditional|中文（台湾）|中文（台灣）|中文\(台湾\)/i, "zh-tw"],
	[/español|spanish|西班牙语/i, "es"],
	[/français|french|法语/i, "fr"],
	[/日本語|japanese|日语/i, "ja"],
]

/**
 * 从标题行提取站点 locale。支持：
 *   `(en)`、`(\`zh-CN\`) — master`、`– en (English)`、`– pt-BR`（行尾裸代码）、
 *   纯语言名（English / 简体中文 (Simplified Chinese)）。
 */
function localeFromHeading(text) {
	const tryMap = (code) => (code ? LISTING_LOCALE_MAP[code.toLowerCase()] || null : null)
	let m = text.match(/\(\s*`?([A-Za-z]{2}(?:[-_][A-Za-z0-9]{2,5})?)`?\s*\)/)
	let loc = tryMap(m && m[1])
	if (loc) return loc
	m = text.match(/[–—-]\s*([A-Za-z]{2}(?:[-_][A-Za-z0-9]{2,5})?)\s*(?:\(|$)/)
	loc = tryMap(m && m[1])
	if (loc) return loc
	for (const [re, l] of LANG_NAME_MAP) if (re.test(text)) return l
	return null
}

/**
 * 解析 listing-all-languages.md，返回 { <siteLocale>: { name, short, long, category } }。
 * 兼容多种历史格式：
 *   - 语言节标题可以是 H1 或 H2（`# English (en)`、`## 简体中文 (\`zh-CN\`)`、`## English`…）
 *   - 字段标题可以是语言节下一级的标题（H2/H3），或 `**Name:** 值`，或 `**Name (≤75)**` 独行
 *   - 字段内容可含 ``` 围栏与更深层的小标题（保留为 markdown）
 *   - 整节没有字段标签的（纯长文案节）视为 long
 */
export function parseAllLanguages(mdPath) {
	if (!fs.existsSync(mdPath)) return {}
	const lines = fs.readFileSync(mdPath, "utf8").split(/\r?\n/)
	const out = {}
	let locale = null
	let localeLevel = 0
	let field = null
	let fieldLevel = 0
	let buf = []
	let proseBuf = [] // 分节里没有字段标签时的整节内容

	const flushField = () => {
		if (locale && field && buf.length) {
			const text = cleanFieldText(buf)
			if (text) {
				out[locale] = out[locale] || {}
				out[locale][field] = out[locale][field] ? out[locale][field] + "\n\n" + text : text
			}
		}
		buf = []
	}
	const endSection = () => {
		flushField()
		if (locale && (!out[locale] || !out[locale].long)) {
			const text = cleanFieldText(proseBuf)
			if (text && text.length > 60) {
				out[locale] = out[locale] || {}
				out[locale].long = text
			}
		}
		proseBuf = []
		field = null
	}

	for (const line of lines) {
		const heading = line.match(/^(#{1,4})\s+(.+?)\s*$/)
		if (heading) {
			const level = heading[1].length
			const text = heading[2]
			const loc = localeFromHeading(text)
			// 语言节标题：必须不深于当前语言节层级（避免把内容里的小标题误判成语言）
			if (loc && (!locale || level <= localeLevel || !normalizeField(text.replace(/\([^)]*\)/g, "")))) {
				endSection()
				locale = loc
				localeLevel = level
				continue
			}
			if (!locale) continue
			const f = normalizeField(text.replace(/\([^)]*\)/g, ""))
			if (f && level > localeLevel) {
				flushField()
				field = f
				fieldLevel = level
				continue
			}
			if (field && level > fieldLevel) {
				buf.push(line) // 字段内容里的小标题，原样保留
				continue
			}
			if (level <= localeLevel) {
				endSection()
				locale = null
				continue
			}
			// 语言节内的未知同级标题：结束当前字段
			flushField()
			field = null
			continue
		}
		if (!locale) continue
		const bold = line.match(/^\*\*(.+?)\*\*\s*(.*)$/)
		if (bold) {
			const label = bold[1].replace(/\([^)]*\)/g, "").replace(/[:：]\s*$/, "")
			const f = normalizeField(label)
			if (f) {
				flushField()
				field = f
				fieldLevel = localeLevel + 1
				const inline = bold[2].replace(/^[—–:：\s]+/, "").trim()
				if (inline) buf.push(inline)
				continue
			}
			// 不是字段标签的加粗行：当内容处理
		}
		if (field) buf.push(line)
		else proseBuf.push(line)
	}
	endSection()
	return out
}

/**
 * 解析 listing-en.md（H2 即字段名：`## Name (≤75)` / `## Detailed description`…），
 * 返回 { name, short, long, category }。用于 listing-all-languages.md 里英文长文案
 * 只写“见 listing-en.md”的情况。
 */
export function parseListingEn(mdPath) {
	if (!fs.existsSync(mdPath)) return {}
	const lines = fs.readFileSync(mdPath, "utf8").split(/\r?\n/)
	const out = {}
	let field = null
	let buf = []
	const flush = () => {
		if (field && buf.length) {
			const text = cleanFieldText(buf)
			if (text && !out[field]) out[field] = text
		}
		buf = []
	}
	for (const line of lines) {
		const h2 = line.match(/^##\s+(.+?)\s*$/)
		if (h2) {
			flush()
			field = normalizeField(h2[1].replace(/\([^)]*\)/g, ""))
			continue
		}
		if (field) buf.push(line)
	}
	flush()
	return out
}

/** 依赖名 → 展示名 的白名单（按此顺序输出，最多 cap 个） */
const TECH_PRIORITY = [
	["next", "Next.js"],
	["react", "React"],
	["react-native", "React Native"],
	["expo", "Expo"],
	["plasmo", "Plasmo"],
	["typescript", "TypeScript"],
	["tailwindcss", "Tailwind CSS"],
	["@prisma/client", "Prisma"],
	["pg", "PostgreSQL"],
	["better-auth", "Better Auth"],
	["@paddle/paddle-js", "Paddle"],
	["pixi.js", "Pixi.js"],
	["zustand", "Zustand"],
	["@aws-sdk/client-s3", "AWS S3"],
	["@playwright/test", "Playwright"],
]

/** 从若干 package.json 提取技术栈展示名 */
export function techFromPackages(pkgPaths, extra = [], cap = 6) {
	const deps = new Set()
	for (const p of pkgPaths) {
		const pkg = readJsonSafe(p)
		if (!pkg) continue
		for (const k of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) deps.add(k)
	}
	const out = []
	for (const [dep, label] of TECH_PRIORITY) {
		if (deps.has(dep) && !out.includes(label)) out.push(label)
	}
	for (const label of extra) if (!out.includes(label)) out.push(label)
	return out.slice(0, cap)
}
