#!/usr/bin/env node
// 建一篇新博客的骨架。
// 用法：node .claude/skills/blog/scripts/new-post.mjs <slug> ["Draft Title"]

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "../../../..")

const slug = process.argv[2]
const draftTitle = process.argv[3] || "TODO: title (<= 60 chars, must contain targetKeyword)"

if (!slug) {
	console.error("用法：node .claude/skills/blog/scripts/new-post.mjs <slug> [\"Draft Title\"]")
	process.exit(1)
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
	console.error(`slug 必须是 kebab-case：${slug}`)
	process.exit(1)
}

const dir = path.join(repoRoot, "content/blog", slug)
const file = path.join(dir, "en.md")

if (fs.existsSync(file)) {
	console.error(`已存在，不覆盖：${path.relative(repoRoot, file)}`)
	process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)

const body = `---
title: "${draftTitle}"
description: "TODO: 140-160 chars. Not a summary — the reason to click. Must contain targetKeyword."
date: ${today}
updated: ${today}
type: pitfall
targetKeyword: "TODO"
secondaryKeywords:
  - "TODO"
  - "TODO"
  - "TODO"
tags:
  - TODO
  - TODO
products: []
cover: /assets/blog/${slug}/cover.webp
draft: true
---

<!--
写之前先填这三条一手事实（只有 Tiger 才知道的）。填不出来就别写这篇。
1.
2.
3.
-->

TODO: 开场第一句必须是具体事实或具体场景。禁止 "In today's..."、修辞提问、定义开场。

## TODO: 具体的 H2，不要 Overview / Background

## TODO

## TODO

<!-- 结尾不做无信息总结。给下一步、仍未解决的问题，或一句干脆的判断。 -->
`

fs.mkdirSync(dir, { recursive: true })
fs.writeFileSync(file, body, "utf8")

console.log(`已创建 ${path.relative(repoRoot, file)}`)
console.log(`封面图放到 public/assets/blog/${slug}/cover.webp（1200x630）`)
console.log(`写完跑：node .claude/skills/blog/scripts/lint-post.mjs ${slug}`)
