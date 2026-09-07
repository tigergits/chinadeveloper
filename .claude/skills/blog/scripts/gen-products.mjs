#!/usr/bin/env node
// 从 data/showcase.generated.json 生成 references/products.md 产品事实卡。
// 写文章时只能引用这个文件里的事实，不许凭印象描述产品。
// 用法：node .claude/skills/blog/scripts/gen-products.mjs

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const skillDir = path.resolve(here, "..")
const repoRoot = path.resolve(here, "../../../..")

const srcPath = path.join(repoRoot, "data/showcase.generated.json")
const outPath = path.join(skillDir, "references/products.md")

if (!fs.existsSync(srcPath)) {
	console.error(`找不到数据源：${srcPath}\n先跑 npm run gen:showcase`)
	process.exit(1)
}

const data = JSON.parse(fs.readFileSync(srcPath, "utf8"))
const items = Array.isArray(data) ? data : data.items || []

const esc = (s) => String(s ?? "").replace(/\s+/g, " ").split("|").join("&#124;").trim()

const lines = []
lines.push("<!-- 本文件由 scripts/gen-products.mjs 生成，请勿手改。产品有增改时重新跑一次。 -->")
lines.push("")
lines.push("# 产品事实卡")
lines.push("")
lines.push(`数据源：\`data/showcase.generated.json\`（generatedOn: ${data.generatedOn || "unknown"}）`)
lines.push(`共 ${items.length} 个产品。**写文章提到产品时，事实只能取自这里。**`)
lines.push("")
lines.push("## 速查表")
lines.push("")
lines.push("| slug | 名称 | 类型 | 状态 | 定价 | 一句话 |")
lines.push("| --- | --- | --- | --- | --- | --- |")
for (const it of items) {
	const c = (it.content && it.content.en) || {}
	lines.push(
		`| \`${it.slug}\` | ${esc(c.name) || it.slug} | ${it.type || "-"} | ${it.status || "-"} | ${it.pricing || "-"} | ${esc(c.tagline || c.short).slice(0, 70)} |`
	)
}
lines.push("")
lines.push("---")
lines.push("")
lines.push("## 详情")
lines.push("")

for (const it of items) {
	const c = (it.content && it.content.en) || {}
	lines.push(`### ${esc(c.name) || it.slug}`)
	lines.push("")
	lines.push(`- **slug**: \`${it.slug}\`　**站内页**: \`/en/portfolios/${it.slug}/\``)
	lines.push(`- **类型**: ${it.type || "-"}　**分类**: ${it.categoryLabel || "-"}　**状态**: ${it.status || "-"}　**定价**: ${it.pricing || "-"}`)
	if (it.platforms?.length) lines.push(`- **平台**: ${it.platforms.join(", ")}`)
	if (it.techStack?.length) lines.push(`- **技术栈**: ${it.techStack.join(", ")}`)
	const links = Object.entries(it.links || {}).filter(([, v]) => v)
	if (links.length) lines.push(`- **链接**: ${links.map(([k, v]) => `${k}: ${v}`).join(" · ")}`)
	if (it.plans?.length) lines.push(`- **套餐**: ${it.plans.map((p) => `${p.name} ${p.price}`).join(" · ")}`)
	if (c.tagline) lines.push(`- **Tagline**: ${esc(c.tagline)}`)
	if (c.short) lines.push(`- **一句话**: ${esc(c.short)}`)
	if (c.features?.length) {
		lines.push(`- **功能点**:`)
		for (const f of c.features) lines.push(`  - ${esc(f.title)} — ${esc(f.desc)}`)
	}
	if (it.screenshots?.length) {
		lines.push(`- **截图说明**（这些 caption 是真实功能描述，可作为写作素材）:`)
		for (const s of it.screenshots) lines.push(`  - ${esc(s.caption)}`)
	}
	lines.push("")
}

fs.writeFileSync(outPath, lines.join("\n"), "utf8")
console.log(`已生成 ${path.relative(repoRoot, outPath)}（${items.length} 个产品，${lines.length} 行）`)
