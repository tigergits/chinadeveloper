# 任务

> **2026-08-29 已完成 v2 改造**：本文件记录的是最初的 showcase 需求（已实现并升级）。
> 现行方案见 [portfolio-pipeline.md](portfolio-pipeline.md) ——
> xeviora 注册表 17 个产品自动同步、游戏/客户案例显式条目、旧 markdown 并入统一
> 可搜索筛选的 /portfolios 网格、SEO/RSS/sitemap 全覆盖、Hire CTA + 联系表单。
> 下面列的 browserexts 源目录已失效（源码迁移到了 D:\PROJs\xeviora\src\<code>\extension）。
重建 Portfolio 页面，当前 Portfolio 页面改到 more 里面。
为了迎接AI开发时代, Portfolio 页面分为 WEB APP（或者是SAAS，看用哪个比较正规？），浏览器插件(extension)，APP（暂时没有），游戏（Games），然后还有一个more（链到当前Portfolio页面中的应用 - 老应用）
分类如果没有Items,就暂不显示

要求支持多语言，要求有代码能够自动更新，整个界面要漂亮（要有logo, scrn, 名称，短说明，长说明，下载或者安装按钮等，如果是extension，要有对应的privacy页-只需要英文）

## 数据来源

browser extensions
收集对应目录里面的各种物料文档(同时生成英文的privacy页)

- D:\PROJs\browserexts\src\clear\store
- D:\PROJs\browserexts\src\qrcode\store
- D:\PROJs\browserexts\src\reelcap\store
- D:\PROJs\browserexts\src\scrncap\store
- D:\PROJs\webs\myiplocation.org\src\extension\store
- D:\PROJs\xeviora\src\svg\extension\store
- D:\PROJs\browserexts\src\imgdown\store
- D:\PROJs\webs\pagerankstatus.org\extension\store

web app

- D:\PROJs\xeviora\src\xeviora\store

Games 

- D:\PROJs\games\cultivation\store

Apps

- 暂无

