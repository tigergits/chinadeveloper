// @ts-check
/**
 * Showcase 生成器
 *
 * 读取 data/portfolio-sources.json 里列出的各 store 目录（浏览器扩展 / 游戏），
 * 规范化为 data/showcase.generated.json，并把 logo / 截图素材拷贝到
 * public/assets/showcase/<slug>/。
 *
 * 运行：npm run gen:showcase
 *
 * 说明：sourceDir 是 Tiger 本机的绝对路径，只在本机能跑；生成产物（JSON + public 素材）
 * 已提交仓库，部署端无需再跑。缺失的源目录会被跳过并告警，不会中断。
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const SOURCES_FILE = path.join(ROOT, "data", "portfolio-sources.json")
const OUT_FILE = path.join(ROOT, "data", "showcase.generated.json")
const PUBLIC_DIR = path.join(ROOT, "public", "assets", "showcase")

const SITE_LOCALES = ["en", "zh-cn", "es", "fr", "ja", "zh-tw"]

// listing-all-languages.md 里的语言码 → 站点 locale
const LISTING_LOCALE_MAP = {
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
const GAME_LOCALE_MAP = { en: "en", "zh-Hans": "zh-cn", "zh-Hant": "zh-tw" }

const warnings = []
const warn = (m) => {
	warnings.push(m)
	console.warn("  ⚠ " + m)
}

// ---------- 小工具 ----------

function readJson(p) {
	return JSON.parse(fs.readFileSync(p, "utf8"))
}

function stripFrontmatter(md) {
	if (md.startsWith("---")) {
		const end = md.indexOf("\n---", 3)
		if (end !== -1) return md.slice(md.indexOf("\n", end + 1) + 1).trimStart()
	}
	return md
}

function ensureEmptyDir(dir) {
	fs.rmSync(dir, { recursive: true, force: true })
	fs.mkdirSync(dir, { recursive: true })
}

/** 在多个候选位置里找到第一个存在的文件，拷贝到目标目录，返回 web 路径（或 null） */
function copyAsset(candidates, destDir, destName, webBase) {
	for (const c of candidates) {
		if (c && fs.existsSync(c) && fs.statSync(c).isFile()) {
			fs.mkdirSync(destDir, { recursive: true })
			fs.copyFileSync(c, path.join(destDir, destName))
			return `${webBase}/${destName}`
		}
	}
	return null
}

function titleFromFilename(name) {
	return name
		.replace(/\.[a-z0-9]+$/i, "")
		.replace(/[-_]+/g, " ")
		.replace(/\b\w/g, (ch) => ch.toUpperCase())
}

/** 空的 per-locale 容器 */
function emptyContent() {
	const c = {}
	for (const l of SITE_LOCALES) c[l] = {}
	return c
}

// ---------- 解析 listing-all-languages.md ----------

/** 字段标签 → 规范字段名（兼容 Short / Short description、Detailed / Detailed description） */
function normalizeField(label) {
	const l = label.trim().toLowerCase()
	if (l.startsWith("name")) return "name"
	if (l.startsWith("short")) return "short"
	if (l.startsWith("detail")) return "long"
	if (l.startsWith("categor")) return "category"
	return null
}

/**
 * 返回 { <siteLocale>: { name, short, long, category } }
 * 分节：`## 语言名 (code)`。节内字段两种写法都支持：
 *   - `### Name` / `### Short description` / `### Detailed description`（下一行起为内容）
 *   - `**Name:** 值` / `**Short:** 值` / `**Detailed:**`（同行可带值）
 */
function parseAllLanguages(mdPath) {
	if (!fs.existsSync(mdPath)) return {}
	const lines = fs.readFileSync(mdPath, "utf8").split(/\r?\n/)
	const out = {}
	let locale = null
	let field = null
	let buf = []

	const flush = () => {
		if (locale && field && buf.length) {
			const text = buf.join("\n").trim()
			if (text) {
				out[locale] = out[locale] || {}
				out[locale][field] = text
			}
		}
		buf = []
	}

	for (const line of lines) {
		const h2 = line.match(/^##\s+.*\(([\w-]+)\)\s*$/)
		if (h2) {
			flush()
			field = null
			locale = LISTING_LOCALE_MAP[h2[1].toLowerCase()] || null
			continue
		}
		if (/^##\s+/.test(line)) {
			flush()
			locale = null
			field = null
			continue
		}
		if (/^---\s*$/.test(line)) {
			flush()
			field = null
			continue
		}
		const h3 = line.match(/^###\s+(.+?)\s*$/)
		if (h3) {
			flush()
			field = normalizeField(h3[1])
			continue
		}
		const bold = line.match(/^\*\*([\w ]+?):\*\*\s*(.*)$/)
		if (bold) {
			flush()
			field = normalizeField(bold[1])
			if (field && bold[2].trim()) buf.push(bold[2])
			continue
		}
		if (locale && field) buf.push(line)
	}
	flush()
	return out
}

// ---------- 扩展 ----------

/** config 没有 screenshots 时，自动从 scrn/ 或 store 根发现截图 */
function discoverScreenshots(dir) {
	const isImg = (f) => /\.(png|jpg|jpeg|webp)$/i.test(f)
	const scrnDir = path.join(dir, "scrn")
	if (fs.existsSync(scrnDir)) {
		const all = fs.readdirSync(scrnDir).filter(isImg)
		// 优先编号帧 cws-N / scrn-N；否则取全部
		const framed = all.filter((f) => /^(cws|scrn)[-_]?\d/i.test(f)).sort()
		const pick = framed.length ? framed : all.sort()
		return pick.map((src) => ({ src, caption: "" }))
	}
	// 无 scrn/ 目录：扫描 store 根的编号截图（排除 use-*、promo 等）
	const root = fs
		.readdirSync(dir)
		.filter((f) => isImg(f) && /^(cws|scrn)[-_]?\d/i.test(f))
		.sort()
	return root.map((src) => ({ src, caption: "" }))
}

function buildExtension(item, destDir, webBase) {
	const dir = item.sourceDir
	const configPath = path.join(dir, "store-kit.config.json")
	if (!fs.existsSync(configPath)) {
		warn(`${item.slug}: 缺少 store-kit.config.json，跳过`)
		return null
	}
	const cfg = readJson(configPath)
	const perLang = parseAllLanguages(path.join(dir, "listing-all-languages.md"))

	// 内容：以 config 英文为基底，用 listing 覆盖各语言
	const content = emptyContent()
	content.en = {
		name: cfg.brand,
		tagline: cfg.tagline || "",
		short: cfg.shortDescription || "",
		long: "",
		features: (cfg.features || []).map((f) => ({
			emoji: f.emoji || "",
			title: f.title || "",
			desc: f.desc || "",
		})),
	}
	for (const [loc, v] of Object.entries(perLang)) {
		if (!SITE_LOCALES.includes(loc)) continue
		content[loc] = {
			...content[loc],
			name: v.name || content[loc].name,
			short: v.short || content[loc].short,
			long: v.long || "",
		}
	}
	// 每个语言都带上英文 features（扩展 features 仅英文）
	for (const loc of SITE_LOCALES) {
		if (!content[loc].features) content[loc].features = content.en.features
		if (!content[loc].name) content[loc].name = content.en.name
		if (!content[loc].short) content[loc].short = content.en.short
	}

	// logo：优先 icons/ 里最大的，其次 promo.iconSvg
	const iconDir = path.join(dir, "icons")
	let logo = copyAsset(
		[
			path.join(iconDir, "icon-512.png"),
			path.join(iconDir, "icon512.png"),
			path.join(iconDir, "icon-256.png"),
			path.join(iconDir, "icon256.png"),
			path.join(iconDir, "icon-128.png"),
			path.join(iconDir, "icon128.png"),
		],
		destDir,
		"logo.png",
		webBase
	)
	let gradient = null
	if (!logo && cfg.promo && cfg.promo.iconSvg) {
		fs.mkdirSync(destDir, { recursive: true })
		fs.writeFileSync(path.join(destDir, "logo.svg"), cfg.promo.iconSvg, "utf8")
		logo = `${webBase}/logo.svg`
		gradient = Array.isArray(cfg.promo.gradient) ? cfg.promo.gradient : null
	}

	// 截图：优先 config.screenshots，否则扫描 scrn/ 或 store 根目录
	const screenshots = []
	let shots = Array.isArray(cfg.screenshots) ? cfg.screenshots : null
	if (!shots) shots = discoverScreenshots(dir)
	shots.forEach((s, i) => {
		const web = copyAsset(
			[path.join(dir, "scrn", s.src), path.join(dir, s.src), path.join(dir, "promo", s.src)],
			path.join(destDir, "scrn"),
			`${String(i + 1).padStart(2, "0")}-${s.src.replace(/[^\w.-]/g, "_")}`,
			`${webBase}/scrn`
		)
		if (web) screenshots.push({ src: web, caption: s.caption || "" })
		else warn(`${item.slug}: 找不到截图 ${s.src}`)
	})

	const privacyMarkdown = readPrivacy(path.join(dir, "privacy-policy.md"))

	return {
		categoryLabel: cfg.category || "Extension",
		logo,
		gradient,
		screenshots,
		privacyMarkdown,
		content,
	}
}

// ---------- 扩展（内联，无 config） ----------

function buildExtensionInline(item, destDir, webBase) {
	const dir = item.sourceDir
	const content = emptyContent()
	for (const [loc, v] of Object.entries(item.content || {})) {
		if (!SITE_LOCALES.includes(loc)) continue
		content[loc] = { name: v.name, tagline: v.tagline || "", short: v.short, long: v.long || "", features: [] }
	}
	// 回退英文
	for (const loc of SITE_LOCALES) {
		if (!content[loc].name) content[loc] = { ...content.en }
	}

	const screenshots = []
	;(item.screenshots || []).forEach((s, i) => {
		const web = copyAsset(
			[path.join(dir, "scrn", s.src), path.join(dir, s.src)],
			path.join(destDir, "scrn"),
			`${String(i + 1).padStart(2, "0")}-${s.src}`,
			`${webBase}/scrn`
		)
		if (web) screenshots.push({ src: web, caption: s.caption || "" })
		else warn(`${item.slug}: 找不到截图 ${s.src}`)
	})

	const privacyMarkdown = item.privacyFile ? readPrivacy(path.join(dir, item.privacyFile)) : null

	return {
		categoryLabel: item.categoryLabel || "Extension",
		logo: null,
		gradient: null,
		screenshots,
		privacyMarkdown,
		content,
	}
}

// ---------- 游戏 ----------

function buildGame(item, destDir, webBase) {
	const dir = item.sourceDir
	const configPath = path.join(dir, "game-store-kit.config.json")
	if (!fs.existsSync(configPath)) {
		warn(`${item.slug}: 缺少 game-store-kit.config.json，跳过`)
		return null
	}
	const cfg = readJson(configPath)
	const facts = fs.existsSync(path.join(dir, "meta", "facts.json"))
		? readJson(path.join(dir, "meta", "facts.json"))
		: {}

	const content = emptyContent()
	for (const [gameLoc, siteLoc] of Object.entries(GAME_LOCALE_MAP)) {
		const ld = path.join(dir, "listing", gameLoc)
		const readTxt = (f) => (fs.existsSync(path.join(ld, f)) ? fs.readFileSync(path.join(ld, f), "utf8").trim() : "")
		const features = (cfg.sellingPoints || []).map((p) => ({
			emoji: p.emoji || "",
			title: (p.title && (p.title[gameLoc] || p.title.en)) || "",
			desc: (p.desc && (p.desc[gameLoc] || p.desc.en)) || "",
		}))
		content[siteLoc] = {
			name: readTxt("name.txt") || (cfg.brandLocalized && cfg.brandLocalized[gameLoc]) || cfg.brand,
			tagline: readTxt("tagline.txt") || (cfg.tagline && cfg.tagline[gameLoc]) || "",
			short: readTxt("short-description.txt") || "",
			long: stripFrontmatter(readTxt("about.md") || ""),
			features,
		}
	}
	// 其余语言回退英文
	for (const loc of SITE_LOCALES) {
		if (!content[loc].name) content[loc] = { ...content.en }
	}

	// logo
	const iconDir = path.join(dir, "visual", "icon")
	const logo = copyAsset(
		[path.join(iconDir, "icon.png"), path.join(iconDir, "StoreLogo.png"), path.join(iconDir, "Square310x310Logo.png")],
		destDir,
		"logo.png",
		webBase
	)

	// 截图：visual/screenshots/*.webp
	const shotsDir = path.join(dir, "visual", "screenshots")
	const screenshots = []
	if (fs.existsSync(shotsDir)) {
		const files = fs
			.readdirSync(shotsDir)
			.filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f))
			.sort()
		files.forEach((f, i) => {
			const web = copyAsset([path.join(shotsDir, f)], path.join(destDir, "scrn"), `${String(i + 1).padStart(2, "0")}-${f}`, `${webBase}/scrn`)
			if (web) screenshots.push({ src: web, caption: titleFromFilename(f) })
		})
	}

	const privacyMarkdown = readPrivacy(path.join(dir, "legal", "privacy-policy-en.md"))
	const genres = Array.isArray(facts.genres) ? facts.genres : cfg.genres || []

	return {
		categoryLabel: genres.slice(0, 3).join(" · ") || "Game",
		releaseStatus: cfg.releaseStatus || facts.releaseStatus || "",
		logo,
		gradient: null,
		screenshots,
		privacyMarkdown,
		content,
	}
}

function readPrivacy(p) {
	if (!fs.existsSync(p)) return null
	return stripFrontmatter(fs.readFileSync(p, "utf8")).trim() || null
}

// ---------- 主流程 ----------

function main() {
	if (!fs.existsSync(SOURCES_FILE)) {
		console.error("找不到 data/portfolio-sources.json")
		process.exit(1)
	}
	const sources = readJson(SOURCES_FILE)
	ensureEmptyDir(PUBLIC_DIR)

	const items = []
	for (const item of sources.items) {
		if (!fs.existsSync(item.sourceDir)) {
			warn(`${item.slug}: 源目录不存在（${item.sourceDir}），跳过`)
			continue
		}
		console.log(`• ${item.slug} (${item.type})`)
		const destDir = path.join(PUBLIC_DIR, item.slug)
		const webBase = `/assets/showcase/${item.slug}`

		let built = null
		if (item.type === "extension") built = buildExtension(item, destDir, webBase)
		else if (item.type === "extension-inline") built = buildExtensionInline(item, destDir, webBase)
		else if (item.type === "game") built = buildGame(item, destDir, webBase)
		else warn(`${item.slug}: 未知 type ${item.type}`)

		if (!built) continue

		items.push({
			slug: item.slug,
			category: item.category,
			type: item.type,
			installUrl: item.installUrl || "",
			...built,
		})
	}

	// 分类元数据（只输出有 items 的分类，保持 order）
	const cats = (sources.categories || [])
		.filter((c) => items.some((it) => it.category === c.key))
		.sort((a, b) => (a.order || 0) - (b.order || 0))

	const generated = {
		generatedOn: new Date().toISOString().slice(0, 10),
		locales: SITE_LOCALES,
		categories: cats,
		items,
	}
	fs.writeFileSync(OUT_FILE, JSON.stringify(generated, null, "\t") + "\n", "utf8")

	console.log(`\n✔ 写入 ${path.relative(ROOT, OUT_FILE)}：${items.length} 个条目，${cats.length} 个分类`)
	if (warnings.length) console.log(`  ${warnings.length} 条告警（见上）`)
}

main()
