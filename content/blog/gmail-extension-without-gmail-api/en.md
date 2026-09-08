---
title: "How to Build a Gmail Extension Without the Gmail API"
description: "A Gmail extension without the Gmail API: read whole threads from the print view, unread counts from the Atom feed, and skip restricted scopes entirely."
date: 2026-08-16
updated: 2026-08-16
type: howto
targetKeyword: "gmail extension without the gmail api"
secondaryKeywords:
  - "gmail restricted scope casa assessment"
  - "gmail print view view=pt"
  - "gmail atom feed unread count"
  - "gmail extension no oauth"
tags:
  - chrome-extensions
  - gmail
  - permissions
products:
  - mail-toolbox-for-gmail
cover: /assets/blog/gmail-extension-without-gmail-api/cover.webp
draft: false
---

[Mail Toolbox](/en/portfolios/mail-toolbox-for-gmail/) exports Gmail threads to PDF, DOCX and
EML, summarises them, and shows unread counts across accounts. It has never asked anyone for
access to their Google account, because it is a Gmail extension without the Gmail API — no
OAuth screen, no token, no scope.

Two endpoints make that possible, and both of them are Gmail's own pages, fetched with the
session the user already has.

## Why build a Gmail extension without the Gmail API

`gmail.readonly` and `gmail.modify` sit under
[Restricted scopes](https://developers.google.com/workspace/gmail/api/auth/scopes) in Google's
own list. Restricted is not a label about how much data you get. It is a label about what
Google requires of you before you may ship: OAuth verification plus an annual third-party
security assessment, run under the
[App Defense Alliance CASA](https://appdefensealliance.dev/casa) programme.

Annual. Third-party. For a one-person product with no revenue attached to it yet, the numbers
I found when I looked into it were four figures and several weeks of calendar time. I never
went through with it, so treat that as the reason I said no rather than an invoice I can show
you.

The upside of saying no turned out to be more than saved money. "It never asks for access to
your Google account" is the strongest line on the product page, and it is true in the literal
sense that there is no code path capable of asking.

The constraint that comes with it is absolute. It sits at the top of the project's
architecture notes: do not introduce the Gmail API for convenience later. One `getAuthToken`
call anywhere and the claim collapses, the store listing becomes a lie, and the CASA clock
starts.

## The print view hands you the entire thread

Gmail renders any thread as a clean, script-free HTML document for printing. A content script
running on `mail.google.com` is same-origin with it, so it can just fetch that URL and parse
the result.

```ts
function printUrl(ref: ThreadRef, account: number): string {
	const base = `https://mail.google.com/mail/u/${account}/`
	return ref.kind === "perm"
		? `${base}?view=pt&search=all&permthid=${encodeURIComponent(ref.id)}`
		: `${base}?ui=2&view=pt&search=all&th=${encodeURIComponent(ref.id)}`
}
```

Note that there are two id forms and they take different parameter names. A permanent thread
id goes in as `permthid` on the modern path; a legacy thread id goes in as `th` and needs
`ui=2`. Mixing them does not degrade — it 404s. I lost an afternoon to that before writing the
branch above.

The account index in the path matters too. `/mail/u/0/` is whoever signed in first, and a
user with three accounts open will get somebody else's mailbox if you hardcode it.

What comes back is the whole conversation, including the replies Gmail collapses in the UI.
That is the part that made this approach better than the alternative rather than merely
cheaper. The usual technique — the one most competing exporters use — is a hidden iframe
pointed at the same view, which means owning the iframe lifecycle and building a
cross-frame handshake to know when it is safe to read. Fetching the document instead skips
rendering and layout altogether, which is why bulk export of a hundred threads finishes in
the time an iframe approach takes to do a handful.

The parsed HTML goes through DOMPurify before anything is done with it. It is a document
built from mail other people sent; treating it as trusted markup because it came from
Gmail's own domain would be a mistake.

## The fallback parameter I copied from a competitor

Some accounts refuse the clean URL. Workspace tenants with basic HTML disabled return a 4xx for the request above. The fix is one
undocumented parameter:

```ts
for (const candidate of [url, `${url}&mb=1`]) {
```

Try it clean, fall back to `&mb=1`. I did not work that out from first principles — I found it
by reading how an existing to-PDF extension handled the same failure. Both requests carry the
user's cookies and neither one asks for anything new, so the fallback costs a round trip and
nothing else.

Failures here are typed, not swallowed. A passive overlay can afford to fail silently. This
ran because someone clicked a button, and a button owes an answer:

```ts
readonly code: "not_found" | "forbidden" | "network" | "unparseable"
```

## Unread counts come from an Atom feed nobody mentions

The second endpoint is `/mail/u/<N>/feed/atom`, optionally with a label appended. Request it
with the browser's existing cookies and Gmail returns unread counts plus sender, subject and
snippet for the most recent messages. No OAuth, no API console project, no scope.

It has been there for well over a decade and almost nobody writes about it. The one place I
had seen it used is Notifier for Gmail, which builds its whole multi-account notification
feature on the same route.

Two details decide whether the number you show is right:

```ts
/** 未读总数。取 `<fullcount>` 与 entry 条数的较大者 —— fullcount 偶尔滞后，
 *  而 entry 最多只给 20 条，两边都不能单独信。 */
fullcount: number
```

`<fullcount>` is the feed's own unread total and it sometimes lags. The entry list is
authoritative but capped at twenty. Trusting either alone gives you a badge that is wrong in
one direction or the other, so the count is the larger of the two. The feed title also carries
the account's email address, which is how the extension tells three signed-in mailboxes apart
without ever asking who the user is.

## You cannot use DOMParser in a service worker

The obvious way to read that XML is `DOMParser`. It is not available. The feed is fetched from the MV3 service worker, and a service worker
has no DOM. The same wall shows up whenever
background code wants to touch markup — it is the reason
[recording a tab needs an offscreen document](/en/blog/mv3-offscreen-tab-recording/).

An offscreen document would have worked here too, and would have been the wrong call for one
XML shape. The feed format has not changed in over ten years. So the parser is eighty lines of
hand-written string work that understands this one document and nothing else.
Pulling in a SAX library, or spinning up an offscreen page per poll, would both cost more
than they return.

It is a pure function over a string, so the tests feed it sample XML with no browser
involved at all.

## What this approach cannot do

Everything here is read-only by construction. There is no send, no label edit, no archive,
because the print view and the Atom feed only ever hand you a document. If the product ever
needs to modify a mailbox, none of this helps and the restricted-scope conversation starts
for real.

It is also undocumented, which means it can break without notice and without a deprecation
window. I accept that on the same terms as the other decision that shaped this product —
[exporting PDFs through the browser's own print pipeline](/en/blog/chrome-extension-pdf-export/)
instead of bundling a PDF library. Both trade a supported-looking dependency for one I can
actually reason about.

What I have not solved is detection. If Gmail changes the print view markup tomorrow, the
parser returns an empty thread and the user sees an export with nothing in it. There is no
version number on an HTML page to check against. The best idea I have is a canary — export one
known thread on a schedule and compare the shape of what comes back — and I have not built it.
