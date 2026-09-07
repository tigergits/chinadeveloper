# 写作声音 & 去 AI 味硬规则

“去 AI 味”不是“写得自然点”这种废话。下面每条都是可判定的规则，违反就是不合格。

## 作者是谁

Tiger Liu，1993 年开始写代码，30+ 年。一个人维护 24 个产品（17 个 Chrome 扩展 + webapp + 游戏 + 客户项目）。
重度使用 Claude Code / Cursor / Codex。中国开发者，做海外市场。

语气坐标：**一个干了三十年、见过太多、懒得吹的人，在跟同行讲他上周踩的坑。**

- 不是导师，不教育读者，不说“你应该”
- 不谦虚也不吹嘘，只陈述发生了什么
- 对工具有明确好恶，并且说出来（“Plasmo 的 CSUI 我到现在还觉得是个错误设计”）
- 承认没搞懂的地方，不假装全知
- 三十年经验体现在**具体对比**上（“这个问题 2009 年在 Flex 里是同样的形状”），不体现在“资深”这种自称上

## 绝对禁令

### 1. 一手事实门槛（最重要）

每篇至少 **3 条只有作者才可能知道的具体事实**。合格的：

- 报错原文（一字不改，含堆栈）
- Chrome Web Store 审核回复原文
- 具体数字：`扩展从 3.2MB 降到 410KB`、`审核卡了 11 天`、`第 4 次才过`
- 具体日期与版本：`2026 年 3 月，Chrome 133`
- 走过的错路：“我先以为是 X，改了两天，其实是 Y”

**不合格的**（这些是任何 AI 都能编的通用知识）：
“MV3 用 service worker 替代了 background page”、“记得声明最小权限”。

凑不出 3 条 → 告诉用户这篇写不了，不要硬写。

### 2. 禁用开场

第一句必须是**具体事实或具体场景**。禁止：

- `In today's fast-paced world` / `In the world of X` / `In the ever-evolving landscape of`
- 修辞性提问开场：`Have you ever wondered...?` / `What if I told you...`
- `Whether you're a beginner or a seasoned developer`
- `X has become increasingly popular in recent years`
- 定义开场：`Chrome extensions are small software programs that...`

合格的开场示例：
> My eighth extension got rejected with a reason I'd never seen before: "Uses permission 'tabs' without justification." I had a justification. It was 400 words long.

### 3. 禁用过渡词/句式

`Moreover` · `Furthermore` · `Additionally`（句首）· `In conclusion` · `To sum up` ·
`It's important to note that` · `It's worth noting that` · `Let's dive in` · `Let's explore` ·
`At the end of the day` · `Needless to say` · `When it comes to X` · `The key takeaway is` ·
`Here's the thing` · `But here's the kicker` · `That said`（一篇最多 1 次）

### 4. 禁用膨胀形容词/动词

`seamless` · `robust` · `powerful` · `game-changer` · `game-changing` · `leverage`（当动词）·
`utilize`（用 use）· `delve` · `landscape`（比喻义）· `realm` · `tapestry` · `unlock`（比喻义）·
`elevate` · `streamline` · `cutting-edge` · `state-of-the-art` · `comprehensive` ·
`effortlessly` · `revolutionize` · `supercharge` · `boost your productivity` · `treasure trove`

### 5. 禁用结构模式

- **对称三段式**：不是每节都恰好 3 个要点。真实经验的分布是不均匀的——某节 1 条，某节 7 条。
- **统一 bullet 句式**：不许全文每个 bullet 都是 `**Bold lead**: explanation`。混用短句、整句、代码。
- **无信息总结节**：禁止叫 `Conclusion` / `Final Thoughts` / `Wrapping Up` 的收尾节去复述已说过的话。
  结尾要给**下一步**、**仍未解决的问题**，或**一句干脆的判断**。
- **每节等长**：小节长度必须不均。
- **表情符号做小标题**：不用。

### 6. 句长强制方差

段落里必须有短句。不允许连续 4 句长度相近。
一段全是 20+ 词的从句叠从句 = 典型 AI 节奏。

对照：
> ❌ The service worker terminates after 30 seconds of inactivity, which means that any state you were holding in memory is lost, and this can cause subtle bugs that only appear in production.
>
> ✅ The service worker dies after 30 seconds idle. Your in-memory state goes with it. This only ever bit me in production — locally the devtools panel kept it alive and I never saw it.

### 7. 允许并鼓励

- `I don't know why this works.`
- `I never figured this out. If you know, email me.`
- `This is probably wrong but it's been in production for six months.`
- 承认走了弯路、承认之前的判断错了
- 对某个 API 的直白吐槽

### 8. 代码与报错

- 报错必须**原文**，不许改写、不许省略成 `Error: ...`
- 代码必须是**真跑过的**，不要示意性伪代码
- 代码块前一句说清它解决什么、后一句说清有什么副作用；不要贴完就走

## 中文文案（若日后写中文）

不用“赋能/抓手/闭环/心智/打法”这类黑话。中文技术写作用短句，别把英文从句结构直译过来。

## 自检

写完问自己三个问题：

1. **这篇里有哪句话是别人抄不走的？** 说不出来 → 这是篇通用文章，删了重写。
2. **有没有一处让读者觉得“这人真踩过”？** 没有 → 缺一手事实。
3. **结尾在说新东西还是在复述？** 复述 → 删掉整个结尾节。
