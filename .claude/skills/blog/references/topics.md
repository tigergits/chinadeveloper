# 选题库

状态：`idea` 待验证 → `ready` 一手事实已齐可开写 → `drafting` → `published`

**开写前必须确认「一手事实」那栏填得出来。** 填不出来就还是 `idea`，不要开写。

## 发布顺序原则

站点权重还低，顺序不能乱：

1. **先写 pitfall（踩坑实录）3-6 个月** — 竞争最低、收录最快、E-E-A-T 最强
2. **穿插 build-in-public** — 拉外链抬全站权重
3. **再打 comparison** — 商业意图高，需要一点权重打底
4. **最后打 listicle（Best X / alternatives）** — 转化最直接，但没权重时写了也排不上，等前三类跑起来再说

---

## Backlog

### A. pitfall — 优先级最高，先写这批

| 状态 | 标题草案 | targetKeyword | 一手事实（写不出就别开写） | 内链产品 |
| --- | --- | --- | --- | --- |
| idea | Every Reason Chrome Web Store Rejected My Extensions | `chrome web store rejected` | 需要：历次拒信**原文**、被拒次数、每次改了什么、过审耗时 | 多个 |
| idea | MV3 Service Worker Keeps Dying: What Actually Kept Mine Alive | `mv3 service worker keeps dying` | 需要：试过的几种保活方案、哪个失败了、线上才暴露的现象 | 待定 |
| idea | The chrome.storage.sync Quota That Broke My Sync | `chrome.storage.sync quota exceeded` | 需要：报错原文、撞限时的数据量、最终的分片方案 | bookmark-commander |
| idea | Writing Chrome Permission Justifications That Pass Review | `chrome extension permission justification` | 需要：真实提交过的 justification 文本、被打回的版本 vs 通过的版本 | 多个 |
| idea | Plasmo CSUI Isn't Injecting: What I Got Wrong | `plasmo csui not working` | 需要：具体版本号、报错、排查过程 | 待定 |
| idea | Next.js output:export on Cloudflare Pages — The Parts That Bit Me | `next.js output export cloudflare pages` | 需要：本站真实踩的坑（trailingSlash / next-intl / 动态路由） | — |
| idea | When You Actually Need an Offscreen Document in MV3 | `chrome extension offscreen document` | 需要：哪个扩展被迫用了、不用会怎样 | 待定 |

### B. build-in-public — 拉外链

| 状态 | 标题草案 | targetKeyword | 一手事实 | 内链产品 |
| --- | --- | --- | --- | --- |
| idea | 17 Chrome Extensions in 12 Months: The Actual Numbers | `shipping chrome extensions solo` | 需要：真实安装量、收入、时间线、哪几个是失败的 | xeviora |
| idea | One Monorepo, Seventeen Extensions: The Layout | `chrome extension monorepo` | 需要：真实目录结构、共享了什么、哪次重构做错了 | xeviora |
| idea | 30 Years In, Here's Where Claude Code Actually Fails Me | `claude code workflow` | 需要：具体失败案例，**不能是软文**——负面细节才是可信度来源 | — |

### C. comparison — 攒够权重再打

| 状态 | 标题草案 | targetKeyword | 一手事实 | 内链产品 |
| --- | --- | --- | --- | --- |
| idea | Plasmo vs WXT: I Shipped With Both | `plasmo vs wxt` | 需要：两个都真用过的项目、迁移成本、各自的坑 | 待定 |
| idea | Paddle vs Lemon Squeezy vs Stripe for Extension Paywalls | `paddle vs lemon squeezy` | 需要：真实接入经验、费率、税务处理、审核耗时 | xeviora |
| idea | RevenueCat vs Direct StoreKit for a Solo Dev | `revenuecat vs stripe` | 需要：真实接入过的项目 | lifechapter |
| idea | Cloudflare Pages vs Vercel for a Static Multilingual Site | `cloudflare pages vs vercel` | 需要：本站的真实迁移/选型过程、成本数字 | — |

### D. listicle — 最后打

| 状态 | 标题草案 | targetKeyword | 一手事实 | 内链产品 |
| --- | --- | --- | --- | --- |
| idea | Bookmark Manager Extensions That Handle 5,000+ Bookmarks | `best bookmark manager extension` | 需要：真测过竞品、在大数据量下的实测表现 | bookmark-commander |
| idea | How to Export a ChatGPT or Claude Conversation | `export chatgpt conversation` | 需要：各方案的实际限制 | ai-chat-exporter |
| idea | Turning a Webpage Into Clean Markdown: 5 Ways Compared | `webpage to markdown` | 需要：同一批页面的实测输出对比 | web-to-markdown |
| idea | Full-Page Screenshot Extensions, Tested on Broken Pages | `full page screenshot extension` | 需要：在懒加载/固定头部页面上的实测 | scrncap, reelcap |
| idea | Bulk Downloading Images From a Page Without Getting Blocked | `bulk image downloader chrome` | 需要：限流实测 | bulk-image-downloader |

---

## 已发布

（暂无）

---

## 关键词线索池

随手记下真实遇到的报错和问题，这是长尾词最好的来源——比任何关键词工具都准，因为它就是别人会去搜的原话。

- （待补充：粘贴真实报错原文、审核拒信、用户提问）
