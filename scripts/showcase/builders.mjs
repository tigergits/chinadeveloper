// @ts-check
/**
 * 显式条目的构建器：extension（plasmo-store-kit）、webapp（webapp-store-kit）、
 * game（game-store-kit，Steam 布局）、inline（文案内嵌在 manifest 里）。
 *
 * 每个构建器只负责产出内容与素材（content/logo/screenshots/privacy），
 * 结构性字段（category/status/platforms/techStack/links…）由 manifest 条目声明，
 * 在入口处合并。
 */

import fs from "node:fs"
import path from "node:path"
import {
	SITE_LOCALES,
	GAME_LOCALE_MAP,
	LISTING_LOCALE_MAP,
	emptyContent,
	parseAllLanguages,
	parseListingEn,
	readJson,
	readJsonSafe,
	readPrivacy,
	readTextSafe,
	stripFrontmatter,
	copyLogo,
	copyScreenshot,
	discoverScreenshotFiles,
	discoverRootScreenshots,
	warn,
} from "./util.mjs"

/** 各语言缺失字段回退英文 */
function fillFallback(content) {
	for (const loc of SITE_LOCALES) {
		if (!content[loc] || !content[loc].name) content[loc] = { ...content.en }
	}
	return content
}

async function copyShots(files, captions, destDir, webBase) {
	const screenshots = []
	for (let i = 0; i < files.length; i++) {
		const web = await copyScreenshot(files[i], path.join(destDir, "scrn"), `${String(i + 1).padStart(2, "0")}`, `${webBase}/scrn`)
		if (web) screenshots.push({ src: web, caption: captions[i] || "" })
	}
	return screenshots
}

// ---------- 扩展（plasmo-store-kit） ----------

export async function buildExtension(item, destDir, webBase) {
	const dir = item.sourceDir
	const configPath = path.join(dir, "store-kit.config.json")
	if (!fs.existsSync(configPath)) {
		warn(`${item.slug}: 缺少 store-kit.config.json`)
		return null
	}
	const cfg = readJson(configPath)
	const perLang = parseAllLanguages(path.join(dir, "listing-all-languages.md"))
	if (!perLang.en || !perLang.en.long || /listing-en\.md/.test(perLang.en.long)) {
		const enListing = parseListingEn(path.join(dir, "listing-en.md"))
		if (enListing.long) perLang.en = { ...(perLang.en || {}), long: enListing.long }
		else if (perLang.en && /listing-en\.md/.test(perLang.en.long || "")) perLang.en.long = ""
	}

	const content = emptyContent()
	content.en = {
		name: cfg.brand,
		tagline: cfg.tagline || "",
		short: cfg.shortDescription || "",
		long: "",
		features: (cfg.features || []).map((f) => ({ emoji: f.emoji || "", title: f.title || "", desc: f.desc || "" })),
	}
	for (const [loc, v] of Object.entries(perLang)) {
		if (!SITE_LOCALES.includes(loc)) continue
		content[loc] = {
			...content[loc],
			name: v.name || content.en.name,
			short: v.short || content.en.short,
			long: v.long || "",
		}
	}
	for (const loc of SITE_LOCALES) {
		if (!content[loc].features) content[loc].features = content.en.features
		if (!content[loc].name) content[loc].name = content.en.name
		if (!content[loc].short) content[loc].short = content.en.short
	}

	let logo = copyLogo(
		[
			path.join(dir, "icon", "icon-256.png"),
			path.join(dir, "icon", "icon-128.png"),
			path.join(dir, "icons", "icon-256.png"),
			path.join(dir, "icons", "icon-128.png"),
			path.join(dir, "icon.png"),
			path.join(path.dirname(dir), "assets", "icon.png"),
		],
		destDir,
		webBase
	)
	let gradient = null
	if (!logo && cfg.promo && cfg.promo.iconSvg) {
		fs.mkdirSync(destDir, { recursive: true })
		fs.writeFileSync(path.join(destDir, "logo.svg"), cfg.promo.iconSvg, "utf8")
		logo = `${webBase}/logo.svg`
		gradient = Array.isArray(cfg.promo.gradient) ? cfg.promo.gradient : null
	}

	let shotFiles = discoverScreenshotFiles([path.join(dir, "scrn")])
	if (!shotFiles.length) shotFiles = discoverRootScreenshots(dir)
	const captions = (Array.isArray(cfg.screenshots) ? cfg.screenshots : []).map((s) => s.caption || "")
	const screenshots = await copyShots(shotFiles, captions, destDir, webBase)

	return {
		categoryLabel: cfg.category || "Extension",
		logo,
		gradient,
		screenshots,
		privacyMarkdown: readPrivacy(path.join(dir, "privacy-policy.md")),
		content: fillFallback(content),
	}
}

// ---------- Web 应用（webapp-store-kit） ----------

export async function buildWebapp(item, destDir, webBase) {
	const dir = item.sourceDir
	const configPath = path.join(dir, "webapp-store-kit.config.json")
	if (!fs.existsSync(configPath)) {
		warn(`${item.slug}: 缺少 webapp-store-kit.config.json`)
		return null
	}
	const cfg = readJson(configPath)
	const pick = (o) => (o && typeof o === "object" ? o.en || o[Object.keys(o)[0]] || "" : o || "")

	const features = (cfg.features || []).map((f) => ({ emoji: f.emoji || "", title: pick(f.title), desc: pick(f.desc) }))

	const content = emptyContent()
	content.en = {
		name: pick(cfg.brandLocalized) || cfg.brand,
		tagline: pick(cfg.tagline),
		short: pick(cfg.shortDescription),
		long: pick(cfg.elevatorPitch),
		features,
	}
	const listingRoot = path.join(dir, "listing")
	if (fs.existsSync(listingRoot)) {
		for (const langDir of fs.readdirSync(listingRoot)) {
			const loc = SITE_LOCALES.includes(langDir) ? langDir : LISTING_LOCALE_MAP[langDir.toLowerCase()]
			if (!loc || !SITE_LOCALES.includes(loc)) continue
			const ld = path.join(listingRoot, langDir)
			const readTxt = (f) => readTextSafe(path.join(ld, f))
			content[loc] = {
				name: readTxt("name.txt") || content.en.name,
				tagline: readTxt("tagline.txt") || content.en.tagline,
				short: readTxt("short-description.txt") || content.en.short,
				long: stripFrontmatter(readTxt("long-description.md")) || content.en.long,
				features,
			}
		}
	}

	let logo = copyLogo(
		[
			path.join(dir, "visual", "logo", "icon-512x512.png"),
			path.join(dir, "visual", "logo", "icon-512.png"),
			path.join(dir, "visual", "logo", "icon-source-180.png"),
			path.join(dir, "visual", "favicon", "icon-512x512.png"),
			path.join(dir, "visual", "favicon", "favicon-512.png"),
			path.join(dir, "visual", "favicon", "icon-192x192.png"),
		],
		destDir,
		webBase
	)
	let gradient = null
	if (!logo && cfg.brandKit && cfg.brandKit.iconSvg) {
		fs.mkdirSync(destDir, { recursive: true })
		fs.writeFileSync(path.join(destDir, "logo.svg"), cfg.brandKit.iconSvg, "utf8")
		logo = `${webBase}/logo.svg`
		gradient = Array.isArray(cfg.brandKit.gradient) ? cfg.brandKit.gradient : null
	}

	let shotFiles = discoverScreenshotFiles([path.join(dir, "visual", "screenshots")])
	if (!shotFiles.length && fs.existsSync(path.join(dir, "visual", "og", "og-1200x630.png")))
		shotFiles = [path.join(dir, "visual", "og", "og-1200x630.png")]
	const screenshots = await copyShots(shotFiles, [], destDir, webBase)

	const facts = readJsonSafe(path.join(dir, "meta", "facts.json"))
	const plans = facts && Array.isArray(facts.plans) ? facts.plans : undefined

	return {
		categoryLabel: cfg.category || "Web App",
		logo,
		gradient,
		screenshots,
		privacyMarkdown: readPrivacy(path.join(dir, "legal", "privacy-policy-en.md")),
		plans,
		content: fillFallback(content),
	}
}

// ---------- 游戏（game-store-kit，Steam 布局：sourceDir 指向 store/steam） ----------

export async function buildGame(item, destDir, webBase) {
	const dir = item.sourceDir
	const configPath = path.join(dir, "game-store-kit.config.json")
	if (!fs.existsSync(configPath)) {
		warn(`${item.slug}: 缺少 game-store-kit.config.json`)
		return null
	}
	const cfg = readJson(configPath)
	const facts = readJsonSafe(path.join(dir, "meta", "facts.json")) || {}

	const content = emptyContent()
	for (const [gameLoc, siteLoc] of Object.entries(GAME_LOCALE_MAP)) {
		const ld = path.join(dir, "listing", gameLoc)
		const readTxt = (f) => readTextSafe(path.join(ld, f))
		const features = (cfg.sellingPoints || []).map((p) => ({
			emoji: p.emoji || "",
			title: (p.title && (p.title[gameLoc] || p.title.en)) || "",
			desc: (p.desc && (p.desc[gameLoc] || p.desc.en)) || "",
		}))
		content[siteLoc] = {
			name: readTxt("name.txt") || (cfg.brandLocalized && cfg.brandLocalized[gameLoc]) || cfg.brand,
			tagline: readTxt("tagline.txt") || (cfg.tagline && (cfg.tagline[gameLoc] || cfg.tagline.en)) || "",
			short: readTxt("short-description.txt") || "",
			long: stripFrontmatter(readTxt("about.md") || ""),
			features,
		}
	}

	const iconDir = path.join(dir, "visual", "icon")
	const logo = copyLogo(
		[path.join(iconDir, "icon.png"), path.join(iconDir, "StoreLogo.png"), path.join(iconDir, "Square310x310Logo.png")],
		destDir,
		webBase
	)

	// 截图：capsule 头图作封面 + steam 英文截图
	const shotFiles = []
	const captions = []
	const header = path.join(dir, "visual", "capsule", "header-920x430.png")
	if (fs.existsSync(header)) {
		shotFiles.push(header)
		captions.push("")
	}
	const shotsDir = path.join(dir, "visual", "screenshots")
	if (fs.existsSync(shotsDir)) {
		const prefix = item.screenshotPrefix || "steam-en-"
		for (const f of fs.readdirSync(shotsDir).filter((f) => f.startsWith(prefix) && /\.(png|jpg|webp)$/i.test(f)).sort()) {
			shotFiles.push(path.join(shotsDir, f))
			captions.push("")
		}
	}
	const screenshots = await copyShots(shotFiles, captions, destDir, webBase)

	const genres = Array.isArray(facts.genres) ? facts.genres : cfg.genres || []

	return {
		categoryLabel: genres.slice(0, 3).join(" · ") || "Game",
		releaseStatus: cfg.releaseStatus || facts.releaseStatus || "",
		logo,
		gradient: (cfg.capsule && cfg.capsule.gradient) || null,
		screenshots,
		privacyMarkdown: readPrivacy(path.join(dir, "legal", "privacy-policy-en.md")),
		content: fillFallback(content),
	}
}

// ---------- 内嵌条目（文案写在 manifest 里；sanguo / coding / xeviora 品牌站等） ----------

export async function buildInline(item, destDir, webBase) {
	const content = emptyContent()
	for (const [loc, v] of Object.entries(item.content || {})) {
		if (!SITE_LOCALES.includes(loc)) continue
		content[loc] = {
			name: v.name,
			tagline: v.tagline || "",
			short: v.short || "",
			long: v.long || "",
			metaDescription: v.metaDescription || "",
			features: (v.features || []).map((f) => ({ emoji: f.emoji || "", title: f.title || "", desc: f.desc || "" })),
		}
	}
	if (!content.en || !content.en.name) {
		warn(`${item.slug}: inline 条目缺少英文文案`)
		return null
	}

	const dir = item.sourceDir || ""
	const logo = copyLogo((item.logoCandidates || []).map((c) => (path.isAbsolute(c) ? c : path.join(dir, c))), destDir, webBase)

	// 截图：manifest 里明确列出的文件（相对 sourceDir 或绝对路径）
	const files = []
	const captions = []
	for (const s of item.screenshots || []) {
		const abs = path.isAbsolute(s.src) ? s.src : path.join(dir, s.src)
		if (fs.existsSync(abs)) {
			files.push(abs)
			captions.push(s.caption || "")
		} else {
			// 兼容旧布局：scrn/ 子目录
			const alt = path.join(dir, "scrn", s.src)
			if (fs.existsSync(alt)) {
				files.push(alt)
				captions.push(s.caption || "")
			} else warn(`${item.slug}: 找不到截图 ${s.src}`)
		}
	}
	const screenshots = await copyShots(files, captions, destDir, webBase)

	const privacyMarkdown = item.privacyFile ? readPrivacy(path.join(dir, item.privacyFile)) : null

	return {
		categoryLabel: item.categoryLabel || "Project",
		logo,
		gradient: item.gradient || null,
		screenshots,
		privacyMarkdown,
		content: fillFallback(content),
	}
}
