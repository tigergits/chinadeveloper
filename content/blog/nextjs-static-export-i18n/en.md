---
title: "Next.js Static Export i18n Without a Locale Prefix"
description: "Next.js static export i18n breaks the usual rewrite trick for a prefix-free default locale. Here is the route-group layout I run on two live sites."
date: 2026-09-07
updated: 2026-09-07
type: howto
targetKeyword: "next.js static export i18n"
secondaryKeywords:
  - "next-intl static export"
  - "next.js rewrites not working"
  - "next.js default locale without prefix"
  - "next.js route groups i18n"
tags:
  - nextjs
  - i18n
  - static-export
products:
  - clearkit
  - bulk-image-downloader
  - scrncap
cover: /assets/blog/nextjs-static-export-i18n/cover.webp
draft: false
---

The rewrite sat in `next.config.ts` for a day and a half before I worked out that it was doing
nothing at all. No warning, no build error. Next.js static export i18n simply ignores the
`rewrites()` block, because there is no server left to run it on.

What I wanted is the arrangement most marketing sites use: English at `/privacy`, everything
else at `/es/privacy`. What I had was `/en/privacy` and a config file that looked correct.

Two of my sites ship this way now — [ClearKit](/en/portfolios/clearkit/) and
[Bulk Image Downloader](/en/portfolios/bulk-image-downloader/), nine languages each, both
prerendered to static HTML on Cloudflare Pages. Here is the layout that replaced the rewrite.

## Why rewrites fail in a Next.js static export i18n setup

The usual next-intl recipe for a prefix-free default locale puts a `beforeFiles` rewrite in the
config: requests for `/privacy` get rewritten internally to `/en/privacy`, the URL bar keeps the
short form, everyone is happy.

That rewrite is evaluated by the Next.js routing layer at request time. Under `output: "export"`
there is no request time. The build walks your routes, writes HTML files, and stops. Middleware
does not run either, which takes next-intl's own middleware off the table at the same moment.

Nothing tells you. You get `out/en/privacy.html` and no `out/privacy.html`, and you find out
when you open the site.

## The route-group layout that replaces the rewrite

Route groups — the `(folder)` syntax — affect the file tree without adding a URL segment. That
is enough to build the same URL shape by hand:

```
src/app/
  (en)/                 → /            /privacy      /guides/<slug>
    layout.tsx
    page.tsx
    privacy/page.tsx
    guides/[slug]/page.tsx
  (intl)/
    [locale]/           → /es          /es/privacy   /es/guides/<slug>
      layout.tsx
      page.tsx
      privacy/page.tsx
      guides/[slug]/page.tsx
```

Two trees, one URL scheme, no hosting features involved. It works the same on Cloudflare Pages,
Netlify, S3, or a folder you serve with `python -m http.server`.

The obvious objection is duplication, and it is a fair one. Both trees are thin: every page body
lives in `src/views/` and each route file is a wrapper that supplies the locale and the metadata.
When I add a page I touch two small files, not two page implementations.

## Wiring next-intl to two roots

next-intl normally reads the locale from the `[locale]` route segment. Half of these routes do
not have one, so the two trees feed it from different places:

```ts
// src/i18n/request.ts
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE
  return { locale, messages: (await import(`./messages/${locale}.json`)).default }
})
```

The `(intl)` tree resolves `requestLocale` from its `[locale]` segment as usual. The `(en)` tree
has nothing to resolve, so its layout says so outright:

```tsx
// src/app/(en)/layout.tsx
export default function EnLayout({ children }: { children: React.ReactNode }) {
  setRequestLocale(DEFAULT_LOCALE)
  return <RootShell locale={DEFAULT_LOCALE}>{children}</RootShell>
}
```

`setRequestLocale` is what makes the English tree work without a segment. Miss it and
`requestLocale` comes back undefined, the fallback quietly hands you English anyway, and you
never notice until you add a second default.

The `[locale]` tree then enumerates every locale except the default:

```ts
export const PREFIXED_LOCALE_CODES = LOCALE_CODES.filter((c) => c !== "en")

export function generateStaticParams() {
  return PREFIXED_LOCALE_CODES.map((locale) => ({ locale }))
}
```

Eight trees get prerendered. English is not among them, because it already exists at the root.

## The guard that stops /en from becoming a duplicate

If `en` ever leaks into the `[locale]` params you get `/en/privacy` and `/privacy` serving
identical HTML at two indexable URLs. One line prevents it:

```tsx
if (!isLocale(locale) || locale === "en") notFound()
```

Under static export this can only fire during local development, since the build sees exactly
what `generateStaticParams` returned. I keep it because typing `/en/` by hand while developing
should 404 rather than render a half-English page that looks fine.

## One function for links, hreflang and canonical

The part that actually bites is links. Every internal link, every `hreflang`, and every canonical
has to know that English is the tree without a prefix. Spread that rule across components and
you will get it wrong in one of them.

It lives in one function:

```ts
export function localizedPath(locale: string, path: string): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`
  if (locale === DEFAULT_LOCALE) return clean || "/"
  return `/${locale}${clean}`
}
```

Canonical and `hreflang` are built from the same function, so they cannot disagree:

```ts
export function alternatesFor(locale: string, path: string) {
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l.hreflang] = `${SITE_URL}${localizedPath(l.code, path)}`
  languages["x-default"] = `${SITE_URL}${localizedPath(DEFAULT_LOCALE, path)}`
  return { canonical: `${SITE_URL}${localizedPath(locale, path)}`, languages }
}
```

`x-default` points at the prefix-free English URL. The language switcher calls `localizedPath`
too — it is a server component built on `<details>` and nine real `<a>` links, so it ships no
JavaScript and gives every page nine internal links to its own translations.

One catch worth knowing: a layout cannot read the current path, so the logical path
(`"/"`, `"/privacy"`) has to be passed down from each page. Put the switcher in the layout and
you will have nothing to hand it.

## trailingSlash, and the 308 you do not want

I left `trailingSlash` at its default of `false`. The export writes `out/privacy.html`;
Cloudflare Pages serves that at `/privacy`; the canonical says `/privacy`. All three agree and
nothing redirects.

Turn it on and you get `out/privacy/index.html`, requests to `/privacy` answer with a 308 to
`/privacy/`, and every canonical, sitemap entry and internal link has to carry the slash or you
are feeding crawlers a redirect hop. Either setting is fine. Mixing them is not, and it is easy
to mix them without noticing — this very blog runs `trailingSlash: true`, and its sitemap still
emits URLs without the slash.

## Why there is no Accept-Language redirect

Sniffing `Accept-Language` and redirecting is the reflex, and I skipped it deliberately.
Googlebot crawls almost entirely as `en-US` from US IPs. Redirect on language and it lands on
the English page every time, whatever URL it asked for, and the other eight versions never get
indexed. Language is decided by the URL and changed by the switcher. Nothing else touches it.

## When to undo all of this

This layout is a workaround for a missing routing layer, so it should go away the moment you
have one. In September 2026 both [ScrnCap](/en/portfolios/scrncap/) and ReelCap moved from static
export to full-stack on Vercel — they needed accounts, checkout and an entitlement endpoint for
the extension, which is a different story and partly a consequence of
[how their store reviews went](/en/blog/chrome-web-store-rejected/).

With a server back in the picture, `rewrites()` started working again. Both sites collapsed the
two trees back into a single `app/[locale]/` and put the rewrite in the config. Every public URL
stayed byte-identical, so there was nothing to redirect and no ranking to lose. That is the
useful property of building the URL shape out of the file tree: it does not depend on how the
site is hosted, and moving off it costs nothing.

What still bothers me is that the failure is silent. A `rewrites()` block under
`output: "export"` is dead configuration, and the build is happy to print "Export successful"
over the top of it. If you take one thing from this: after any change to routing config, look at
what landed in `out/` before you look at anything else.
