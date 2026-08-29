# Portfolio 自动化管线

作品集数据由 `npm run gen:showcase` 一条命令生成，来源、机制与维护方式如下。

## 数据流

```
xeviora 产品注册表（自动） ─┐
显式条目（manifest）      ─┼→ scripts/gen-showcase.mjs
                           │     ├→ data/showcase.generated.json      （24 个条目，6 语言）
                           │     └→ public/assets/showcase/<slug>/    （logo + webp 截图）
content/portfolios（旧 markdown，构建时合并进列表页）
                           ↓
lib/showcase.ts + lib/legacy-portfolio.ts → /[locale]/portfolios（搜索/筛选）+ 详情页
```

生成产物（JSON + public 素材）**已提交仓库**；源路径是本机绝对路径，只在本机能跑，部署端（Cloudflare Pages）只执行 `next build`。

## 三种新增项目的方式

1. **xeviora 上新（零操作）**：在 `D:/PROJs/xeviora/src/xeviora/frontend/src/lib/products-config.ts` 的
   `PRODUCTS` 注册表里加了产品、portal messages 写好文案后，本仓库重跑 `npm run gen:showcase` 即自动收录。
   采集内容：注册表结构字段 + portal 6 语言文案 + 产品目录的 store kit（图标 / CWS 截图 /
   13 语言长文案 / 隐私政策）+ package.json 技术栈。
2. **有 store kit 的独立项目**：在 `data/portfolio-sources.json` 的 `items` 里加一条，
   `type` 选 `extension`（plasmo-store-kit）/ `webapp`（webapp-store-kit）/ `game`（game-store-kit，
   sourceDir 指向 `store/steam`），并声明 `category/status/platforms/techStack/links/installUrl`。
3. **内嵌条目（无营销素材的项目）**：`type: "inline"`，6 语言文案直接写进 manifest 的 `content`
   （缺的语言回退英文），截图用 `screenshots`（相对 sourceDir 或绝对路径）显式列出，
   `logoCandidates` 指定图标候选。sanguo / coding 客户案例 / xeviora 品牌站都是这种。

旧企业项目继续放 `content/portfolios/<slug>/<locale>.md`，列表页构建时自动并入
"Client & Enterprise" 分类，不经过生成器。

## 安全机制

- 先在 `.showcase-build/`（已 gitignore）完整构建，成功后一次性替换线上素材目录；
- 某条目源缺失/构建失败 → **沿用上一版** JSON 与素材并告警，绝不静默丢条目；
  只有从注册表/manifest 主动删除的条目才会消失；
- `npm run gen:showcase -- --strict`：缺源改为报错退出（CI/自查用）；
- 截图统一压缩为 webp（宽 ≤1600，q80），24 个条目素材共约 6MB。

## slug 约定与重定向

- xeviora 产品用注册表里的 slug（如 `svg-forge`）；改名时在 `public/_redirects` 加 301。
- 现有 301：`svg-grabber`、`xeviora-svg` → `svg-forge`；`/portfolios/more` → `/portfolios`。

## 接单转化（Hire Me）

- `data/hire.json`：**Upwork / Fiverr 主页 URL 目前是占位空串**，填入后
  HireCta 卡片、联系页"接单平台"卡、JSON-LD `Person.sameAs` 全站自动生效。
- HireCta 出现在：作品集列表底部、每个详情页（showcase + 旧 markdown）底部；
  按钮带 `?project=<slug>`，联系页表单自动预填项目名。

## 联系表单（Cloudflare Pages Functions）

- 代码：`functions/api/contact.js`（Pages 自动识别仓库根 functions/，与 out/ 共存）。
- 需在 **Cloudflare Pages 控制台 → Settings → Environment variables** 配置：
  - `RESEND_API_KEY`（必需）：到 https://resend.com 注册取得。未配置时接口返回 503，
    前端自动降级为预填好的 mailto 链接——表单在任何状态下都可用；
  - `CONTACT_TO`（可选）：收件邮箱，默认 tiger.hu.liu@gmail.com；
  - `TURNSTILE_SECRET_KEY`（可选）：配置后启用 Turnstile 人机校验（前端还需接入 widget，
    当前先用蜜罐字段防垃圾）。
- 建议在 Resend 验证 chinadeveloper.net 域名后把发件人从 `onboarding@resend.dev`
  换成自有域名地址（`functions/api/contact.js` 里的 `from` 字段）。

## SEO 覆盖

- `app/sitemap.ts`：6 语言 ×（主页面 + 17 个旧详情 + 24 个 showcase 详情 + 扩展隐私页）；
- `app/[locale]/feed.xml`：RSS 含全部 showcase 与旧条目（已修复旧版空 feed 的 bug）；
- JSON-LD：列表页 `ItemList` + `BreadcrumbList`；详情页 `SoftwareApplication` /
  `VideoGame` / `WebApplication`（含 `offers` 定价）+ `BreadcrumbList`；联系页 `Person`（含 sameAs）。
- 详情页 meta description 使用采集的 6 语言 `metaDescription`（缺失回退 short）。
