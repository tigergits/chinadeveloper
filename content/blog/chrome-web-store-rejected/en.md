---
title: "Chrome Web Store Rejected Me 7 Times in 9 Months"
description: "Chrome Web Store rejected my extensions seven times in nine months. Every notice, the exact code and copy they flagged, and what I changed to pass."
date: 2026-09-07
updated: 2026-09-07
type: pitfall
targetKeyword: "chrome web store rejected"
secondaryKeywords:
  - "chrome extension violation reference id"
  - "purple potassium chrome extension"
  - "blue argon manifest v3"
  - "chrome extension unused permission"
tags:
  - chrome-extensions
  - manifest-v3
  - chrome-web-store
products:
  - scrncap
  - ai-chat-exporter
  - reelcap
  - web-to-markdown
cover: /assets/blog/chrome-web-store-rejected/cover.webp
draft: false
---

On July 8, 2026, ScrnCap got rejected for shipping remotely hosted code. I had fixed that
exact problem six days earlier and resubmitted. Chrome Web Store rejected it anyway — same
violation, same reference ID, different file.

That was the day I understood something about the review process that nobody had told me.

Seven of my submissions were rejected between January 1 and September 3, 2026, across five
extensions. Every notice carries a violation reference ID: a color plus an element name.
Purple Potassium. Blue Argon. Yellow Argon. Red Nickel. Google's
[troubleshooting page](https://developer.chrome.com/docs/webstore/troubleshooting/) lists
what they mean in the abstract. Below is what they looked like when they landed in my inbox.

One note before the table: the notices arrive in your account language. Mine come in Chinese,
and the fine print says only the English policy text is binding. The flagged content itself —
your code, your copy — is quoted verbatim, untranslated. That part I can reproduce exactly.

## Every Chrome Web Store rejected notice I got, in one table

| Date | Extension | Reference ID | Flagged |
| --- | --- | --- | --- |
| 2026-01-01 | ServicesMon (now Pulse) | Purple Potassium | `storage` requested, not used |
| 2026-06-11 | Web to Markdown | Purple Potassium | `scripting` requested, not used |
| 2026-07-02 | ScrnCap | Blue Argon | remote code in `tabs/preview.aaf0be18.js` |
| 2026-07-08 | ScrnCap | Blue Argon + Red Nickel | remote code in `tabs/batch.c1e045f4.js`; "Free" on a Small tile |
| 2026-08-10 | AI Chat Exporter | Yellow Argon | keyword spam in the description |
| 2026-08-11 | AI Chat Exporter | Yellow Argon | keyword spam, after I rewrote it |
| 2026-09-03 | ReelCap | Purple Potassium | `downloads` requested, not used |

Three of the seven are the same violation on three different extensions, nine months apart.
That one is the easiest to avoid and I kept doing it anyway.

## Purple Potassium is a permission you forgot to delete

The notice names the permission. That is the whole diagnosis:

> Requested but not used: `storage`

For ServicesMon in January it was `storage`. For [Web to Markdown](/en/portfolios/web-to-markdown/)
in June it was `scripting`. For [ReelCap](/en/portfolios/reelcap/) in September it was `downloads`.

None of those were speculative grabs. Each one was real at some point. I declared it, wrote
code against it, later changed how that part worked, and never went back to the manifest. The
permission outlived the code that needed it.

The current manifests tell the rest of the story:

```jsonc
// reelcap — downloads is gone
["tabCapture", "offscreen", "activeTab", "scripting", "tabs", "storage", "unlimitedStorage"]

// web2md — scripting is gone
["activeTab", "tabs", "sidePanel", "downloads", "storage", "clipboardWrite"]

// pulse (formerly ServicesMon) — storage is gone, one permission left
["tabs"]
```

Pulse ended up with a single permission, and it does the same job it did with two.

Whatever the review runs is static analysis, and it is good at it. If a permission string
never appears in a `chrome.*` call anywhere in your bundle, they find it. Grepping your own
build output for each permission you declare would have caught all three of these before
submission.

## Blue Argon: they report one instance, not the list

ScrnCap's PDF preview built an iframe and pointed a `<script>` tag at cdnjs. On July 2 the
notice quoted this:

```
tabs/preview.aaf0be18.js: "https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js"
```

One file, one URL. I removed it, rebuilt, resubmitted. On July 8 the notice quoted this:

```js
var i = "https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js",
    a = ' integrity="sha512-4ze/a9/4jqu+tX9dfOqJYSvyYd5M6qum/3HpCLr+/Jqf0whc37VUbkpNGHR7/8pSnCFw47T1fmIpwBV7UySh3g==" crossorigin="anonymous"';
e.pdfObjectUrl && (i = e.pdfObjectUrl, a = "");
var o = '<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;} </style><body><script src="' + i + '"' + a + '>'
```

Different file — `tabs/batch.c1e045f4.js`. Same CDN URL, same library, a second call site I
had not touched because the first notice had not mentioned it.

**The rejection notice is a sample, not an audit.** It quotes what the reviewer's scan
surfaced. Fixing exactly what the email names and resubmitting is how you spend two review
cycles on one bug.

Note the filenames. `preview.aaf0be18.js` and `batch.c1e045f4.js` are Parcel output — this is
Plasmo's build. The scan runs against the packaged bundle, so searching your `src/` directory
for `https://` is not enough. Search `build/chrome-mv3-prod/`.

I did not bundle pdfobject locally. I rewrote the preview on top of `jspdf`, which was already
a dependency. [ScrnCap](/en/portfolios/scrncap/) ships with no reference to pdfobject anywhere
in its source or its dependency list now.

## Yellow Argon: rewriting the spam as prose changed nothing

This is the one that cost me the most time, because my first fix was the obvious one and it
was wrong.

The August 10 notice quoted the description of [AI Chat Exporter](/en/portfolios/ai-chat-exporter/):

> OpenAI, Anthropic, Google, xAI, DeepSeek or Perplexity Markdown, TXT, JSON, CSV, HTML,
> JSONL, DOCX, PNG and ZIP OpenAI, Anthropic, Google, xAI, DeepSeek or Perplexity ChatGPT,
> Claude, Gemini, Grok, DeepSeek and Perplexity chats to PDF, DOCX, Markdown, JSON and more
> [...] English, 简体中文, 繁體中文, Español, Français, Deutsch, Italiano, Português (Brasil),
> Русский, 日本語, 한국어, हिन्दी, العربية.

Six vendors, six products, thirteen export formats, thirteen UI languages. Every one of those
is true, and the extension does all of it. I read that as a formatting problem — comma-delimited
lists look like keyword stuffing, so I would write it as English sentences instead.

The August 11 notice, twenty-three hours later, quoted my rewrite:

> It works on ChatGPT and Claude, on Gemini and Grok, and on DeepSeek and Perplexity — one panel,

Same reference ID. Yellow Argon again.

The count is what gets flagged, not the punctuation. Prose that names six platforms is six
mentions. The description that eventually shipped names zero:

> Save any AI chat as a document you own — pick the turns, keep the code and sources, export
> as PDF or Markdown.

Zero vendors, two formats. The platform names moved into the extension title, where three of
them plus "& more" is apparently fine:

> AI Chat Exporter: Save ChatGPT, Claude, Gemini & more as PDF, Word & more

Three named, the rest implied. The rule of thumb that gets repeated in the
[chromium-extensions group](https://groups.google.com/a/chromium.org/g/chromium-extensions/) is
to name your top three integrations and put the full list behind a link or in a promo image.
That is roughly where I landed, two rejections later.

## Red Nickel: the word "Free" on a promo tile

Bundled into the second ScrnCap rejection, and the shortest notice of the seven:

> The following assets are intended to imitate ranking, performance, status or promotional
> information: "Small tile" "Free"

ScrnCap is free. That is a factual statement about the product. It is still not allowed on
store artwork, alongside "Featured", "Best", "#1", "New" and anything else that reads as a
badge. The policy is about what the asset looks like in a grid of other extensions, not about
whether the claim is true.

I redrew the tile instead of erasing the word from the existing one.

## What I run before I hit submit now

Four checks, in this order, and they take a few minutes:

- Grep the production build — not `src/` — for every permission string in the manifest. No
  `chrome.*` call, no permission.
- Grep the same directory for `https://` and `http://`, then read every hit. CDN script tags
  hide in library helpers you never wrote.
- Count the proper nouns in the store description. More than three named platforms or
  vendors and I cut it down.
- Open every promo tile and look for words that could read as a badge.

The one habit that changed the most: when a notice names a file, I now assume there are more
files. I search for the pattern across the whole bundle before resubmitting, because a second
rejection for the same reference ID costs another review cycle and there is no partial credit.

One thing I still cannot measure: how long a review actually takes. The only intervals I have
are between two rejection emails — five days and nineteen hours for ScrnCap, twenty-three
hours for AI Chat Exporter — and both of those include however long I spent fixing the thing
in between. The dashboard never showed me when a review started. So I have seven data points
about why submissions fail and none about how long they take, which is the number I actually
wanted.
