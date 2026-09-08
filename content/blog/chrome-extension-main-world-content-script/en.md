---
title: "Chrome Extension MAIN World Content Script: Nothing on Load"
description: "A Chrome extension MAIN world content script can patch the page's own fetch. Here is why mine saw nothing on the first screen, and where the fix went."
date: 2026-08-27
updated: 2026-08-27
type: pitfall
targetKeyword: "chrome extension main world content script"
secondaryKeywords:
  - "monkey patch fetch content script"
  - "plasmo world main"
  - "content script isolated vs main world"
  - "intercept xhr chrome extension"
tags:
  - chrome-extensions
  - manifest-v3
  - content-scripts
products:
  - pinlens
cover: /assets/blog/chrome-extension-main-world-content-script/cover.webp
draft: false
---

The top two rows of Pinterest cards had no badges on them. Everything I scrolled down to
after that did.

[PinLens](/en/portfolios/pinlens/) lays save counts and a speed-adjusted score over every pin.
It gets those numbers from a Chrome extension MAIN world content script that monkey-patches
`fetch` and `XMLHttpRequest`, reads Pinterest's own API responses as they come back, and never
sends a request of its own. That worked everywhere except the part of the page you look at
first.

It took me until August 2026 to work out why, and the fix turned out not to be in the
interceptor at all.

## What a Chrome extension MAIN world content script buys you

A normal content script runs in an isolated world. It shares the DOM with the page and
nothing else — different `window`, different globals. Patch `window.fetch` in there and you
have patched your own private copy. The page's requests still go out through the page's
`fetch`, which you never touched.

`world: "MAIN"` puts the script in the page's own JavaScript context, where that patch
actually lands:

```ts
export const config: PlasmoCSConfig = {
	matches: [
		"https://*.pinterest.com/*",
		"https://*.pinterest.co.uk/*",
		// 20 country domains in total
	],
	run_at: "document_start",
	world: "MAIN",
}
```

Those twenty country domains are not thoroughness for its own sake. Pinterest runs
`pinterest.de`, `pinterest.co.uk`, `pinterest.jp` and the rest as separate origins, and a
match pattern that stops at `.com` leaves every non-US user staring at a feed with no badges
at all. Each one is also a host permission I declare, and unused permissions are the single
violation I have been [rejected by Chrome Web Store](/en/blog/chrome-web-store-rejected/) for
most often — so the list has to be exactly the domains the script really runs on, no wider.

`document_start` is not decoration. The page's bundle grabs a reference to `fetch` early, and
once it has one, replacing `window.fetch` afterwards changes nothing for the calls that
matter.

What you give up is every `chrome.*` API. A MAIN world script cannot read storage, cannot
message the service worker, cannot do anything the extension platform offers. It is a script
on someone else's page. So it throws its findings over the wall:

```ts
window.postMessage({ source: PAGE_MSG, pins }, window.location.origin)
```

and the isolated-world half filters what comes back:

```ts
if (event.source !== window) return
if (!data || data.source !== PAGE_MSG || !Array.isArray(data.pins)) return
```

Pinning the target origin to `window.location.origin` rather than `"*"` matters here — this
message carries data scraped off a logged-in page, and `"*"` would hand it to any frame
listening.

## Patching fetch without breaking the page

One rule before I wrote a line of it: if this code throws, Pinterest still has to work.
Everything swallows its own errors, and I mean everything.

```ts
const origFetch = window.fetch
window.fetch = function pinlensFetch(this: unknown, input: RequestInfo | URL, init?: RequestInit) {
	const promise = origFetch.call(this ?? window, input as RequestInfo, init)
	try {
		const url =
			typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url
		if (url && isResourceUrl(url)) {
			promise
				.then((res) => {
					// clone 后台解析，绝不动原响应
					res
						.clone()
						.json()
						.then(emit)
						.catch(() => {})
				})
				.catch(() => {})
		}
	} catch {
		// 参数形态出乎意料：放过
	}
	return promise
} as typeof window.fetch
```

The original promise goes back to the caller untouched — the page never waits on my parsing.
And `res.clone()` is load-bearing: a `Response` body can be read once, so reading it directly
would leave the page with an already-consumed stream and a very confusing bug.

XHR takes more work, because the URL arrives in `open()` and the response in `send()`. I keep
them together in a `WeakMap` rather than stashing a property on the request object, since the
page owns those objects and can enumerate them:

```ts
const urlMap = new WeakMap<XMLHttpRequest, string>()
```

Both paths run through one filter, so I'm not parsing every JSON response on the site:

```ts
export function isResourceUrl(url: string): boolean {
	return /\/resource\/[A-Za-z]+Resource\/get\/?/.test(url)
}
```

## Two scripts, two worlds, one store

The interceptor is only half the extension. A second content script — isolated world,
`document_idle`, the same twenty match patterns — receives what the first one finds, keeps
an in-memory index, batches writes to the background service worker, and hangs the badges
on the cards.

Splitting it that way is forced by the platform, but it also puts every DOM decision in the
half that can be careful about it. Badges mount only on Pinterest's stable test attributes,
`[data-test-pin-id]` and `[data-test-id="pinWrapper"]`, never on generated class names.
The overlay's own class names carry a suffix so they cannot collide with the page:

```ts
const NS = `pinlens-${chrome.runtime.id}`
```

And filtered-out pins are dimmed with `opacity`, not removed. Removing a card from a masonry
grid makes the whole column jump, which reads as a broken site rather than a filter doing its
job.

## The intercepted payload is missing the field you need

The score PinLens shows divides saves by the days since a pin was published, which means it
needs a publish date. Grid responses do not carry one. Feed, search and board payloads all
come back with save counts and no `created_at`.

So a pin can be intercepted perfectly and still have no grade. The overlay handles that by
collecting the visible pins that are missing dates and asking the background worker to fill
them in, then re-mounting the badge in place when the answer arrives. Pins outside the
viewport are left alone — enriching everything the user scrolled past would mean a request
per card, which is exactly the traffic pattern the passive design exists to avoid.

That constraint is worth checking before you build anything on intercepted data: having the
response is not the same as having the fields.

## The first screen never makes a request

Here is what I had missed for months. Pinterest server-renders the first screen of pins
straight into the HTML document:

```html
<script id="__PWS_DATA__" type="application/json">
```

That element is north of 80KB on the home feed, and before you scroll, the page issues zero
resource requests. Nothing to intercept. An interceptor cannot intercept a request that was
never made.

That is why exactly the cards above the fold — the ones every screenshot and every first
impression is made of — were the ones with no badges.

## The fix lives in the other world

The two worlds have separate globals but share one DOM. So the isolated-world overlay reads
the embedded JSON out of the document itself, and the interceptor stays out of it entirely:

```ts
const EMBEDDED_IDS = ["__PWS_DATA__", "__PWS_INITIAL_PROPS__"]
/** 同一段 JSON 不重复解析（SPA 换路由时长度会变，变了才重解析） */
const embeddedSeen = new Map<string, number>()

function readEmbeddedPins(): void {
	for (const id of EMBEDDED_IDS) {
		const text = document.getElementById(id)?.textContent ?? ""
		if (!text || embeddedSeen.get(id) === text.length) continue
		embeddedSeen.set(id, text.length)
		try {
			ingest(collectPins(JSON.parse(text)))
		} catch {
			// 结构变了 / 不是合法 JSON：静默，翻页的 XHR 仍然兜得住
		}
	}
}
```

The dedupe key is `textContent.length`, not a hash. Pinterest is a single-page app: changing
route swaps the payload under the same element id, so I need to re-parse on change but not on
every scroll tick. Comparing lengths costs nothing against 80KB of JSON. It is wrong only if
two different payloads land on the identical byte length, which I have not seen and would not
notice if it happened.

So the final shape is two sources feeding one store. Embedded JSON covers the first screen.
The interceptor covers everything after it. Neither one is sufficient alone, and I shipped
for weeks believing the second one was.

## What I'd check first next time

Before writing an interceptor at all, open the page with JavaScript disabled and search the
HTML for the data. If it is already in the document, a MAIN world script is a lot of
machinery for a problem `document.getElementById` solves — and unlike a fetch patch, it
cannot break the host page.

The silent-catch discipline is the part I would not change. Same instinct as
[asking for host permissions at runtime](/en/blog/chrome-extension-runtime-host-permissions/)
instead of at install: on someone else's page, the extension is a guest, and a guest that
throws is worse than a guest that shows nothing.

What I still don't have is a way to know when the parsing quietly stops working. Every
`catch` in this code is empty by design, which means the day Pinterest renames a field, the
badges just disappear and nobody tells me — least of all my own error reporting, since
nothing errors. I would find out from a one-star review. That is the next thing to fix, and
I don't yet know what the fix looks like without breaking the rule that made the rest of it
safe.
