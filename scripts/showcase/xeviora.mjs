// @ts-check
/**
 * Xeviora 站群自动采集：以 xeviora.com 的产品注册表为权威来源。
 *
 * 数据分三层 join：
 *   1. products-config.ts   → 结构（slug/url/category/pricing/webStoreId）
 *   2. portal messages/<locale>.json 的 products.<code> → 6 语言文案（name/tagline/描述/features/metaDescription）
 *   3. 各产品源目录（<root>/<code>/）的 store kit → 富化（emoji features、长文案、截图、图标、隐私政策、技术栈）
 *
 * xeviora 上新产品后重跑 gen:showcase 即自动进入 portfolio，无需手工维护清单。
 */

import fs from "node:fs"
import path from "node:path"
import {
	SITE_LOCALES,
	emptyContent,
	parseAllLanguages,
	parseListingEn,
	readJsonSafe,
	readPrivacy,
	copyLogo,
	copyScreenshot,
	discoverScreenshotFiles,
	discoverRootScreenshots,
	techFromPackages,
	warn,
} from "./util.mjs"

/** 解析 products-config.ts 里的 PRODUCTS 数组（对象字面量逐块正则提取） */
export function parseProductsConfig(portalDir) {
	const file = path.join(portalDir, "src", "lib", "products-config.ts")
	const src = fs.readFileSync(file, "utf8")
	const arrMatch = src.match(/PRODUCTS\s*:\s*ProductConfig\[\]\s*=\s*\[([\s\S]*?)\n\];/)
	if (!arrMatch) throw new Error("products-config.ts 里找不到 PRODUCTS 数组")
	const body = arrMatch[1]
	const products = []
	// 顶层对象块：以行首 tab+{ 开始、tab+} 结束
	const blockRe = /\{([\s\S]*?)\n\t\}/g
	let m
	while ((m = blockRe.exec(body))) {
		const block = m[1]
		const pick = (key) => {
			const mm = block.match(new RegExp(`${key}\\s*:\\s*"([^"]*)"`))
			return mm ? mm[1] : undefined
		}
		const pickBool = (key) => new RegExp(`${key}\\s*:\\s*true`).test(block)
		const p = {
			code: pick("code"),
			url: pick("url"),
			slug: pick("slug"),
			icon: pick("icon"),
			category: pick("category"),
			pricing: pick("pricing"),
			webStoreId: pick("webStoreId"),
			comingSoon: pickBool("comingSoon"),
		}
		if (p.code && p.slug) products.push(p)
	}
	return products
}

/** portal messages 的 products.<code> 六语言文案 */
function portalCopy(portalDir, code) {
	const out = {}
	for (const loc of SITE_LOCALES) {
		const msgs = readJsonSafe(path.join(portalDir, "messages", `${loc}.json`))
		const p = msgs && msgs.products && msgs.products[code]
		if (p) out[loc] = p
	}
	return out
}

/** 产品分类 → 站点分类 */
function siteCategory(cat) {
	if (cat === "extension") return "extension"
	if (cat === "game") return "game"
	return "webapp" // saas / creative
}

/**
 * 采集全部已发布产品，返回 showcase items。
 * @param {{root:string, portal:string, exclude?:string[]}} cfg
 * @param {{buildDir:string}} ctx
 */
export async function harvestXeviora(cfg, ctx) {
	const products = parseProductsConfig(cfg.portal)
	const exclude = new Set(cfg.exclude || [])
	const items = []

	for (const p of products) {
		if (exclude.has(p.code)) continue
		const item = await buildProduct(p, cfg, ctx)
		if (item) items.push(item)
	}
	return items
}

async function buildProduct(p, cfg, ctx) {
	const prodDir = path.join(cfg.root, p.code)
	const extStoreDir = path.join(prodDir, "extension", "store")
	const kit = readJsonSafe(path.join(extStoreDir, "store-kit.config.json"))
	const copy = portalCopy(cfg.portal, p.code)
	if (!copy.en) {
		warn(`xeviora/${p.code}: portal messages 里没有文案，跳过`)
		return null
	}

	const destDir = path.join(ctx.buildDir, p.slug)
	const webBase = `/assets/showcase/${p.slug}`

	// ---- 文案（6 语言，以 portal 为基底） ----
	const perLang = parseAllLanguages(path.join(extStoreDir, "listing-all-languages.md"))
	// 英文长文案常是“见 listing-en.md”的指针，改从 listing-en.md 取正文
	if (!perLang.en || !perLang.en.long || /listing-en\.md/.test(perLang.en.long)) {
		const enListing = parseListingEn(path.join(extStoreDir, "listing-en.md"))
		if (enListing.long) perLang.en = { ...(perLang.en || {}), long: enListing.long }
		else if (perLang.en && /listing-en\.md/.test(perLang.en.long || "")) perLang.en.long = ""
	}
	const content = emptyContent()
	for (const loc of SITE_LOCALES) {
		const c = copy[loc] || copy.en
		const listing = perLang[loc] || {}
		// features：portal 每语言 5 条字符串；en 优先用 kit 的 {emoji,title,desc}，其余语言配 kit 的 emoji
		let features
		const kitFeatures = (kit && kit.features) || []
		if (loc === "en" && kitFeatures.length) {
			features = kitFeatures.map((f) => ({ emoji: f.emoji || "", title: f.title || "", desc: f.desc || "" }))
		} else {
			features = (c.features || []).map((f, i) => ({
				emoji: (kitFeatures[i] && kitFeatures[i].emoji) || "",
				title: f,
				desc: "",
			}))
		}
		content[loc] = {
			name: c.name,
			tagline: c.tagline || "",
			short: c.description || "",
			long: listing.long || "",
			metaDescription: c.metaDescription || "",
			features,
		}
	}

	// ---- logo：扩展 PNG 图标 → Plasmo 主图标 → portal SVG ----
	const portalIcon = p.icon ? path.join(cfg.portal, "public", p.icon.replace(/^\//, "")) : null
	const logo = copyLogo(
		[
			path.join(extStoreDir, "icon", "icon-256.png"),
			path.join(extStoreDir, "icon", "icon-128.png"),
			path.join(extStoreDir, "icons", "icon-256.png"),
			path.join(extStoreDir, "icons", "icon-128.png"),
			path.join(prodDir, "extension", "assets", "icon.png"),
			portalIcon,
		],
		destDir,
		webBase
	)
	if (!logo) warn(`xeviora/${p.code}: 找不到 logo`)

	// ---- 截图：扩展 scrn/ → store 根编号图 → webapp visual/ → Play 商店图 → 根目录 hero 图 ----
	let shotFiles = discoverScreenshotFiles([path.join(extStoreDir, "scrn")])
	if (!shotFiles.length) shotFiles = discoverRootScreenshots(extStoreDir)
	if (!shotFiles.length)
		shotFiles = discoverScreenshotFiles([
			path.join(prodDir, "store", "visual", "screenshots"),
			path.join(prodDir, "store", "play", "graphics", "out", "screenshots", "phone", "en-US"),
		], 5)
	if (!shotFiles.length) {
		const heroes = fs.existsSync(prodDir)
			? fs.readdirSync(prodDir).filter((f) => /^home.*\.(png|jpg)$/i.test(f)).map((f) => path.join(prodDir, f))
			: []
		shotFiles = heroes.slice(0, 3)
	}
	const kitCaptions = (kit && Array.isArray(kit.screenshots) ? kit.screenshots : []).map((s) => s.caption || "")
	const screenshots = []
	for (let i = 0; i < shotFiles.length; i++) {
		const web = await copyScreenshot(shotFiles[i], path.join(destDir, "scrn"), `${String(i + 1).padStart(2, "0")}`, `${webBase}/scrn`)
		if (web) screenshots.push({ src: web, caption: kitCaptions[i] || "" })
	}
	if (!screenshots.length) warn(`xeviora/${p.code}: 没有可用截图`)

	// ---- 隐私政策 / 技术栈 / 链接 ----
	const privacyMarkdown = readPrivacy(path.join(extStoreDir, "privacy-policy.md"))
	const techStack = techFromPackages([
		path.join(prodDir, "extension", "package.json"),
		path.join(prodDir, "frontend", "package.json"),
	])
	const chromeStore = p.webStoreId ? `https://chromewebstore.google.com/detail/${p.webStoreId}` : ""
	const links = {}
	if (p.url) links.site = p.url
	if (chromeStore) links.chromeStore = chromeStore

	const platforms = []
	if (p.category === "extension") platforms.push("extension")
	else platforms.push("web")
	if (p.category !== "extension" && fs.existsSync(path.join(prodDir, "extension"))) platforms.push("extension")
	if (p.category === "extension" && fs.existsSync(path.join(prodDir, "frontend"))) platforms.push("web")
	if (fs.existsSync(path.join(prodDir, "rn"))) platforms.push("mobile")

	// plans：webapp kit 的 facts.json（svg 等）
	const facts = readJsonSafe(path.join(prodDir, "store", "meta", "facts.json"))
	const plans = facts && Array.isArray(facts.plans) ? facts.plans : undefined

	return {
		slug: p.slug,
		category: siteCategory(p.category),
		type: p.category === "extension" ? "extension" : "webapp",
		status: p.comingSoon ? "coming-soon" : "live",
		pricing: p.pricing || "",
		platforms,
		techStack,
		links,
		installUrl: chromeStore || p.url || "",
		categoryLabel: (kit && kit.category) || (p.category === "extension" ? "Extension" : "Web App"),
		logo,
		gradient: null,
		screenshots,
		privacyMarkdown,
		plans,
		content,
	}
}
