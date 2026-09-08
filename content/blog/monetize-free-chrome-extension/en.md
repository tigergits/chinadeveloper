---
title: "How to Monetize a Free Chrome Extension With 101,347 Users"
description: "My 2015 extension has 101,347 users and has never earned a cent. Why you can't monetize a free Chrome extension with a Pro version, and what I did instead."
date: 2026-09-08
updated: 2026-09-08
type: build-in-public
targetKeyword: "monetize a free chrome extension"
secondaryKeywords:
  - "chrome web store duplicate functionality"
  - "chrome extension pro version policy"
  - "free chrome extension no revenue"
  - "chrome web store spam and abuse policy"
tags:
  - chrome-extensions
  - chrome-web-store
  - monetization
products:
  - bulk-image-downloader
  - pinlens
cover: /assets/blog/monetize-free-chrome-extension/cover.webp
draft: false
---

This morning an extension with six users got a paying subscriber. $5.90 a month.

Yesterday I posted the install count for a different one of mine: 101,347 users. That one
has never earned a cent, and the gap between those two numbers is not a marketing problem.

I spent August trying to work out how to monetize a free Chrome extension that already has
six figures of installs. The short answer is that I can't — at least not the way the shape
of the problem suggests, which is to publish a paid version of the same thing. Here is what
stopped me, with the policy text and the prices I checked it against.

## The extension with 101,347 users has no way to take money

[Bulk Image Downloader](/en/portfolios/bulk-image-downloader/) shipped in 2015. It previews
every image on a page — or across every open tab — lets you filter by size and file type,
and saves the selection in one go. It is free. It has never had a paywall, a plan, or an
account.

That isn't a pricing decision that went badly. There was never a mechanism. The comment at
the top of its site config still reads:

```ts
// 本站是站群里的**纯静态展示站**：没有数据库、没有账号、没有 Paddle
// "This is a purely static showcase site: no database, no accounts, no Paddle."
```

No database, no auth, no billing. To charge those 101,347 people I would have to build all
three, and then find something to put behind them.

## Why I can't just ship a Pro version to monetize a free Chrome extension

The obvious move is to leave the free one alone and publish a second, paid extension. I
worked through that on August 12, 2026 and wrote up the whole thing before deciding against
it.

Chrome Web Store's
[Spam and Abuse policy](https://developer.chrome.com/docs/webstore/program-policies/spam-and-abuse)
says this, verbatim:

> We don't allow any developer, related developer accounts, or their affiliates to submit
> multiple extensions that provide duplicate experiences or functionality on the Chrome Web
> Store. Extensions should provide value to users through the creation of unique content or
> services.

Free version plus Pro version is that pattern. The test is duplicate experience or
functionality — not duplicate name — so renaming it, reshooting the screenshots and
rewriting the description gets you nowhere. The policy also reaches related developer
accounts and affiliates, which closes the other obvious workaround. There is a further round
of [policy updates that took effect on August 1, 2026](https://developer.chrome.com/blog/cws-policy-updates-2026),
already live by the time I was looking at this.

The part that actually killed it isn't the risk to the new extension. It's the risk to the
old one.

I've been [rejected by Chrome Web Store seven times in nine months](/en/blog/chrome-web-store-rejected/).
Every rejection cost me days, sometimes a rewrite. Not one of them ever put an existing
listing in danger. An enforcement action for duplicate functionality is a different
category: it lands on the developer account, and the 101,347-user listing sits on that same
account. I would be staking a ten-year-old asset on a product with zero validated demand.
That trade doesn't compute in any direction I run it.

## The price ceiling on the word "downloader"

Suppose the policy allowed it. The shelf still doesn't pay.

| Product | What it's sold as | Price |
| --- | --- | --- |
| ImgHunt Pro | image downloader | $2.99/mo, $19.99/yr |
| Jungle Scout | Amazon seller research | from $49/mo |
| Helium 10 | Amazon seller research | $99–129/mo |

ImgHunt's Pro tier gates one thing: unlimited resizes. Twenty dollars a year is roughly
where this category tops out.

The seller tools do a lot of the same mechanical work — pull images and numbers off pages in
bulk, sort them, hand you a file — for thirty times the money. The code is not thirty times
better. What differs is which line of the buyer's budget it lands on. One is a tool you
decide whether you can afford. The other is cost of goods, and nobody agonises over cost of
goods.

That comparison is the thing that changed what I build, more than any of the policy reading.

## The rule I used instead

I have thirty products live or in flight and the capacity to actually push two, maybe three.
The rest go into maintenance this month. I had no per-product revenue broken out to decide
with, so I shortlisted on one question:

**Is it built for someone who already pays for tools?**

Not *would they pay*. Already pays — with a budget, a card on file, and an existing habit of
buying software for this exact job.

That question cut most of the catalogue. The first thing it cut was the extension with
101,347 users. Bulk Image Downloader is built for people like me: developers and power users
who install ten things a week and pay for none of them. It is a wonderful, useless asset.

[PinLens](/en/portfolios/pinlens/) survived the cut. It scores Pinterest pins by dividing
saves by the days since a pin went up, so a two-week breakout stops hiding behind a
four-year-old workhorse, and it files everything you scroll past into a library on your own
machine. Pinterest sellers and creators are already spending money on their business. That
was the entire thesis.

## Six users. One of them pays.

PinLens shipped on August 25, 2026. As of yesterday's snapshot it had six users. This
morning one of them subscribed at $5.90 a month.

Six users. One of them pays.

I'm not turning that into a percentage. One out of six is two small integers, not a
conversion rate, and dividing them would be dressing noise up as signal.

The structural difference between the two products is not that one is better. PinLens was
built with accounts, a database and Paddle from the first commit, because I decided at the
start who it was for. The 2015 extension was built with none of those, because in 2015 I
wasn't deciding anything — I was just shipping a thing I wanted. Monetization turned out to
be a construction decision I made years before there was anyone to charge.

One subscriber is not a business. It's a data point, and I'd be embarrassed to present it as
more than that.

Two things I still can't answer. I don't know where the 101,347 came from — I have never
marketed that extension, not once, and I can't tell you which query or which link built it.
And I don't know who the subscriber is or how they found PinLens. Neither product has ever
been instrumented well enough to say.

Both of those get instrumented this week. The next post with numbers in it should be able to
answer at least one of them.
