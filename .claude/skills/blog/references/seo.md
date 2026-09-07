# SEO 规范

## Frontmatter（必填字段不可省）

```yaml
---
title: "Chrome Web Store Rejections: Every Reason My 17 Extensions Got Rejected"
description: "The exact rejection emails I got from Chrome Web Store review, what each one actually meant, and the change that got the extension approved."
date: 2026-09-07
updated: 2026-09-07
type: pitfall
targetKeyword: "chrome web store rejected"
secondaryKeywords:
  - "chrome extension rejected permission"
  - "chrome web store review time"
  - "manifest v3 rejection"
tags:
  - chrome-extensions
  - manifest-v3
products:
  - bookmark-commander
cover: /assets/blog/chrome-web-store-rejections/cover.webp
draft: false
---
```

| 字段 | 规则 |
|---|---|
| `title` | ≤ 60 字符（SERP 截断线）。必须含 `targetKeyword`。不用副标题冒号堆砌。 |
| `description` | 140–160 字符。含 `targetKeyword`。**不是摘要，是点击理由**——说明读者能拿到什么具体东西。 |
| `date` | 首发日期 `YYYY-MM-DD` |
| `updated` | 每次实质修改都要更新；Google 看这个判新鲜度 |
| `type` | `pitfall` \| `comparison` \| `listicle` \| `build-in-public` \| `howto` |
| `targetKeyword` | 有且只有一个 |
| `secondaryKeywords` | 3–5 个 |
| `tags` | 2–4 个，kebab-case，从已有 tag 里挑，不要每篇造新 tag |
| `products` | 内链到的产品 slug，必须存在于 `data/showcase.generated.json` |
| `cover` | `/assets/blog/<slug>/cover.webp`，1200×630（同时当 OG 图） |
| `draft` | `true` 时不进 sitemap / RSS / 列表页 |

## 标题公式（按类型）

- **pitfall**：`<报错或现象>: <我实际做了什么>` — 如 `MV3 Service Worker Keeps Dying: What Actually Kept Mine Alive`
- **comparison**：`<A> vs <B> for <具体场景>` — 场景一定要具体，泛比拼不过大站
- **listicle**：`<N> <品类> for <人群/场景> (<年份>)` — 数字要奇数，别用 10
- **build-in-public**：带真实数字 — `17 Chrome Extensions in 12 Months: The Actual Numbers`
- **howto**：`How to <具体结果>` — 结果要可验证，不是 "How to improve X"

## 正文结构

- **首段 100 词内出现 `targetKeyword` 一次**，自然出现，不硬塞
- **至少一个 H2 含 targetKeyword 或其变体**
- H2 用具体的话，不用 `Overview` / `Background` / `Getting Started` 这种空标题
- H3 只在 H2 内容确实分层时才用，不要为了层级而层级
- 关键词密度**不要刻意控制**。写具体了自然就够了；堆密度是 2010 年的打法，现在只会伤害可读性
- 字数按类型：pitfall 1200–2000，comparison 1800–3000，listicle 1500–2500，build-in-public 1000–2500
- **有表格就用表格**。对比类必须有一张对比表——AI 引用和精选摘要都优先抓表格

## 内链（很重要，站内权重全靠这个）

每篇至少 3 条内链：

1. **≥1 条指向产品页** `/en/portfolios/<slug>/` —— 锚文本用产品名 + 它解决的问题，不用 "click here"
2. **≥1 条指向另一篇博客** —— 新文章发布后，回头去老文章里补一条指向新文章的链接（这步经常被忘）
3. 相关的话链到 `/en/services/` 或 `/en/about/`

产品植入的规矩：**只在真的相关时提，且必须说明它在这个场景下解决什么**。
禁止在无关文章结尾硬塞 "Check out my extensions"——转化率是 0，还伤内容质量。

## 外链

- 引用官方文档、GitHub issue、Chrome 开发者公告时**给真实链接**，这是 E-E-A-T 信号
- 外链一律 `rel="noopener"`；竞品链接不加 nofollow（自然引用更可信）
- 不要凭记忆写 URL，用 WebFetch 核实链接可达

## JSON-LD

详情页要输出 `Article`（`headline` / `datePublished` / `dateModified` / `author` / `image` / `mainEntityOfPage`）
+ `BreadcrumbList`（Home → Blog → 文章）。
FAQ 型内容额外加 `FAQPage`——**只在页面上真有 Q/A 可见时才加**，否则违反 Google 结构化数据政策。

（渲染代码待实现，见 SKILL.md「发布前」。）

## AI 搜索引擎引用优化

ChatGPT / Perplexity / Google AI Overview 抓取时偏好：

- **问题即小标题**，答案紧跟在标题后第一段，别铺垫
- 关键结论用**独立短段落**，不埋在长段中间
- **具体数字和版本号**极大提高被引用概率
- 对比表格是最容易被整块引用的形式

## 发布后

1. Google Search Console 提交 URL
2. 值得分享的（build-in-public / 硬核 pitfall）发 Reddit 对口 sub、Hacker News、X
3. 回头给相关老文章补内链
4. 30 天后看 GSC 的 query 报告——真实曝光词往往和预设 `targetKeyword` 不同，按实际词补写小节
