// @ts-check
/**
 * Showcase 生成器 v2
 *
 * 数据源两路：
 *   1. xeviora 自动同步 —— 解析 xeviora.com 产品注册表（products-config.ts），
 *      17 个已发布产品全部自动进入，上新后重跑即可；
 *   2. data/portfolio-sources.json 的 items —— 注册表之外的显式条目
 *      （游戏 / 独立站扩展 / 客户案例 / 内嵌文案条目）。
 *
 * 输出：data/showcase.generated.json + public/assets/showcase/<slug>/（截图统一压缩为 webp）。
 *
 * 安全机制：先在 .showcase-build/ 临时目录完整构建，全部成功后一次性替换，
 * 不再先清空线上素材目录。某个条目的源缺失/构建失败时，沿用上一版 JSON 与素材
 * 并告警（跑 `--strict` 时改为报错退出）；只有从清单/注册表里主动移除的条目才会消失。
 *
 * 运行：npm run gen:showcase   （源路径是 Tiger 本机绝对路径，仅本机能跑；产物已提交，部署端无需再跑）
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { SITE_LOCALES, readJson, warn, warnings } from "./showcase/util.mjs"
import { harvestXeviora } from "./showcase/xeviora.mjs"
import { buildExtension, buildWebapp, buildGame, buildInline } from "./showcase/builders.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const SOURCES_FILE = path.join(ROOT, "data", "portfolio-sources.json")
const OUT_FILE = path.join(ROOT, "data", "showcase.generated.json")
const PUBLIC_DIR = path.join(ROOT, "public", "assets", "showcase")
const BUILD_DIR = path.join(ROOT, ".showcase-build")

const STRICT = process.argv.includes("--strict")

/** 上一版条目（slug → item），源缺失时用于沿用 */
function loadPrevious() {
	try {
		const prev = readJson(OUT_FILE)
		return new Map((prev.items || []).map((it) => [it.slug, it]))
	} catch {
		return new Map()
	}
}

/** 沿用上一版：拷回旧素材目录 + 复用旧 JSON */
function carryPrevious(slug, prevBySlug, stats) {
	const prev = prevBySlug.get(slug)
	if (!prev) {
		warn(`${slug}: 构建失败且没有上一版可沿用，条目丢失`)
		stats.lost.push(slug)
		return null
	}
	const oldAssets = path.join(PUBLIC_DIR, slug)
	if (fs.existsSync(oldAssets)) {
		fs.cpSync(oldAssets, path.join(BUILD_DIR, slug), { recursive: true })
	}
	warn(`${slug}: 源不可用，沿用上一版数据`)
	stats.carried.push(slug)
	return prev
}

/** 显式条目：结构字段来自 manifest，内容来自对应构建器 */
async function buildExplicitItem(item, prevBySlug, stats) {
	const destDir = path.join(BUILD_DIR, item.slug)
	const webBase = `/assets/showcase/${item.slug}`

	const sourceOk = !item.sourceDir || fs.existsSync(item.sourceDir)
	let built = null
	if (sourceOk) {
		if (item.type === "extension") built = await buildExtension(item, destDir, webBase)
		else if (item.type === "webapp") built = await buildWebapp(item, destDir, webBase)
		else if (item.type === "game") built = await buildGame(item, destDir, webBase)
		else if (item.type === "inline") built = await buildInline(item, destDir, webBase)
		else warn(`${item.slug}: 未知 type ${item.type}`)
	} else {
		warn(`${item.slug}: 源目录不存在（${item.sourceDir}）`)
	}

	if (!built) {
		if (STRICT) throw new Error(`--strict：${item.slug} 构建失败`)
		return carryPrevious(item.slug, prevBySlug, stats)
	}

	stats.built.push(item.slug)
	return {
		slug: item.slug,
		category: item.category,
		type: item.type,
		status: item.status || "live",
		pricing: item.pricing || "",
		platforms: item.platforms || [],
		techStack: item.techStack || [],
		links: item.links || {},
		installUrl: item.installUrl || "",
		...built,
		// manifest 可覆盖构建器给出的 categoryLabel
		categoryLabel: item.categoryLabel || built.categoryLabel,
	}
}

async function main() {
	const sources = readJson(SOURCES_FILE)
	const prevBySlug = loadPrevious()
	const stats = { built: [], carried: [], lost: [] }

	fs.rmSync(BUILD_DIR, { recursive: true, force: true })
	fs.mkdirSync(BUILD_DIR, { recursive: true })

	const items = []
	const seen = new Set()
	const push = (it) => {
		if (!it) return
		if (seen.has(it.slug)) {
			warn(`slug 重复：${it.slug}（后者被忽略）`)
			return
		}
		seen.add(it.slug)
		items.push(it)
	}

	// 1) xeviora 注册表自动同步
	if (sources.xeviora) {
		if (!fs.existsSync(sources.xeviora.portal)) {
			if (STRICT) throw new Error("--strict：xeviora portal 目录不存在")
			warn(`xeviora portal 目录不存在（${sources.xeviora.portal}），本批全部沿用上一版`)
			// 上一版里 xeviora 来源的条目无法精确识别，保守起见沿用所有非显式条目
			const explicitSlugs = new Set((sources.items || []).map((i) => i.slug))
			for (const [slug, prev] of prevBySlug) {
				if (!explicitSlugs.has(slug)) push(carryPrevious(slug, prevBySlug, stats))
			}
		} else {
			console.log("• 自动同步 xeviora 产品注册表…")
			const auto = await harvestXeviora(sources.xeviora, { buildDir: BUILD_DIR })
			for (const it of auto) {
				stats.built.push(it.slug)
				push(it)
			}
			console.log(`  ↳ ${auto.length} 个产品`)
		}
	}

	// 2) 显式条目
	for (const item of sources.items || []) {
		console.log(`• ${item.slug} (${item.type})`)
		push(await buildExplicitItem(item, prevBySlug, stats))
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

	// 全部成功 → 原子替换素材目录与 JSON
	fs.rmSync(PUBLIC_DIR, { recursive: true, force: true })
	fs.mkdirSync(path.dirname(PUBLIC_DIR), { recursive: true })
	fs.cpSync(BUILD_DIR, PUBLIC_DIR, { recursive: true })
	fs.rmSync(BUILD_DIR, { recursive: true, force: true })
	fs.writeFileSync(OUT_FILE, JSON.stringify(generated, null, "\t") + "\n", "utf8")

	console.log(`\n✔ 写入 ${path.relative(ROOT, OUT_FILE)}：${items.length} 个条目，${cats.length} 个分类`)
	console.log(`  新建/更新 ${stats.built.length}｜沿用上一版 ${stats.carried.length}｜丢失 ${stats.lost.length}`)
	if (stats.carried.length) console.log(`  沿用：${stats.carried.join(", ")}`)
	if (stats.lost.length) console.log(`  丢失：${stats.lost.join(", ")}`)
	if (warnings.length) console.log(`  ${warnings.length} 条告警（见上）`)
}

main().catch((e) => {
	console.error("生成失败：", e)
	process.exitCode = 1
})
