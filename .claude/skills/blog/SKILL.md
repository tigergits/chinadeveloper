---
name: blog
description: chinadeveloper.net 博客写作管线——出选题、挖关键词、写英文 SEO 长文、去 AI 味、落盘到 content/blog/。当用户说“写篇博客/blog/文章”“帮我想选题”“这个坑写成文章”“查关键词”“润色去 AI 味”“发一篇 build in public”，或提到把某个产品/踩坑/对比写成文章时触发。本 skill 只服务于本仓库，产出必须落到 content/blog/<slug>/en.md。
---

# chinadeveloper.net 博客管线

给 Tiger Liu 的个人技术博客产出 SEO 文章。**语言只有英文**（决策见下）。
文章的核心竞争力不是写得好，是**只有他知道的一手事实**——真实报错、真实审核回复、真实数字、真实失败。
没有一手事实的选题不写。

## 已定死的约束（不要重新讨论）

- **单语英文**。内容只写 `content/blog/<slug>/en.md`，不翻译。用户已明确否决多语言方案（机翻多份有被判 low-value auto-generated content 的风险）。
  用户日后若主动要求翻译某篇，才做，且必须是重写级本地化而非直译。
- **URL**：`/en/blog/<slug>/`。扁平，无分类层级，分类靠 `tags`。
- **内容路径**：`content/blog/<slug>/en.md`，复用现有 `lib/content.ts` 管线（`getContentBySlug('blog', slug, 'en')`）。
- **产品事实只能来自 `references/products.md`**，不许凭印象描述产品功能、价格、平台。该文件由脚本从 `data/showcase.generated.json` 生成。
- 和用户沟通用中文；文章正文、frontmatter、slug、标签一律英文。

## 工作流

按用户的诉求进入对应分支，不要每次都跑全流程。

### 分支 1：出选题 / 想主意

1. 读 `references/topics.md`（选题库）和 `references/products.md`（产品弹药）。
2. 若是泛泛的“帮我想主意”，**先问用户最近在做什么/踩了什么坑**——一手事实是选题的前提，不要闭门造车凭产品列表硬编。
3. 每个候选选题给出：标题草案、目标关键词、文章类型、**这篇的一手事实是什么**（写不出来就划掉）、预计能内链到哪个产品。
4. 用户认可后追加到 `references/topics.md` 的 backlog 表。

选题优先级（站点权重还低，顺序不能乱）：
1. **pitfall 踩坑实录** — 竞争最低、收录最快、E-E-A-T 最强。前 3-6 个月主力。
2. **build-in-public** — 拉外链/HN/Reddit，抬全站权重。
3. **comparison 选型对比** — 商业意图高。
4. **listicle "Best X / X alternatives"** — 转化最直接，但**必须等站点攒够权重再打**，早写等于浪费。

### 分支 2：挖关键词

无联网关键词工具，用可执行的替代法：

1. 从**真实报错原文 / 审核拒信原文 / 用户提问原话**反推词——这是长尾词的最好来源，且天然低竞争。
2. 用 WebSearch 搜目标词，看前 10 名：谁在排、内容多深、有没有 SERP 空隙（比如全是泛泛而谈、没人贴真实报错）。没有空隙就换词。
3. 一篇一个 `targetKeyword` + 3-5 个 `secondaryKeywords`。不要一篇打多个主词。
4. 判断搜索意图：informational（踩坑/howto）还是 commercial（best/vs/alternative）。意图和文章类型必须匹配。
5. 结果写进 frontmatter，并在 `references/topics.md` 记录。

### 分支 3：写文章

1. **收集一手事实**——这是第一步，不是最后一步。向用户要：报错原文、截图、时间线、具体数字、版本号、当时怎么想错的。
   凑不出至少 3 条只有他知道的事实，**停下来告诉用户这篇写不了**，别硬写。
2. 读 `references/voice.md`（写作声音 + 去 AI 味硬规则）和 `references/seo.md`（frontmatter/结构/内链规范）。
3. `node .claude/skills/blog/scripts/new-post.mjs <slug>` 建骨架。
4. 先出**大纲**给用户确认（H2 列表 + 每节要放哪条一手事实），再写正文。
5. 写正文。严格按 `voice.md` 的禁令写，不是写完再改。
6. `node .claude/skills/blog/scripts/lint-post.mjs <slug>` 自检，修到全绿。
7. **生成封面图**（列表页和 OG 都用它）：

   ```
   node .claude/skills/blog/scripts/gen-cover.mjs <slug> --ledger "2026-01-01|Purple Potassium,..."
   ```

   封面渲染文章的**真实数据**，不做装饰。三选一：
   - `--ledger "左|右,..."` — 首选。带日期的记录列表（拒信、里程碑、版本），左列等宽字体，
     右列名称首个单词若是颜色词（purple/blue/yellow/red/green/orange）会自动配色圆点
   - `--stat "7|rejections"` — 只有一个关键数字时
   - `--chips "Plasmo,WXT"` — 无日期的并列项（对比类文章）

   都不给就只排标题。**列表页 featured 卡会整幅显示这张图**，所以图里别放会被裁掉的关键信息。

8. 报告：目标词、字数、内链了哪些产品、哪几条一手事实。

### 分支 4：去 AI 味 / 润色已有稿

1. 读 `references/voice.md`。
2. 跑 `lint-post.mjs` 拿到机器可查的命中项。
3. 机器查不到的部分人工过一遍：对称结构、无信息的总结段、句长方差、有没有真实细节。
4. **改写不是删词**。把 "leverage a robust solution" 改成 "used X" 才算改；换个同义词等于没改。

### 分支 5：产品事实卡刷新

产品有增改时跑 `node .claude/skills/blog/scripts/gen-products.mjs`，重新生成 `references/products.md`。
`npm run gen:showcase` 之后应当顺手跑一次。

## 发布前

- `lint-post.mjs` 全绿
- `npm run build` 能过（静态导出，构建期报错才发现就晚了）
- 博客基建（`lib/blog.ts` / `app/[locale]/blog/`）**尚未实现**。第一篇文章落盘后再照着真实 frontmatter 写渲染代码，避免返工。

## 文件

- `references/voice.md` — 写作声音、去 AI 味硬规则、禁用词表
- `references/seo.md` — frontmatter 规范、标题公式、结构、内链、JSON-LD
- `references/products.md` — 24 个产品事实卡（脚本生成，勿手改）
- `references/topics.md` — 选题库 backlog
- `scripts/new-post.mjs` — 建文章骨架
- `scripts/lint-post.mjs` — 校验
- `scripts/gen-products.mjs` — 重新生成产品事实卡
