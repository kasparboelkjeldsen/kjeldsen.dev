# Caching and personalization

Design notes for V2. The problem: cache pages hard, personalize per visitor, and never let the page
visibly re-render to do it. Headless normally forces you to pick two.

Verified against a running Umbraco 18.1.1 / Engage 18.1.0 and the current Azure Front Door docs on
2026-08-29. Sources are the OpenAPI documents the CMS itself serves and Microsoft's public docs.

## What the platform will and will not do

### Front Door cannot vary a cache key by cookie. At all.

Checked, because the answer decides where personalization can live:

| | Supported |
|---|---|
| Cache key from **path** | yes |
| Cache key from **query string** | yes — ignore / use / include-listed / exclude-listed |
| Cache key from **cookie** | **no** |
| `Vary` header | **no** — `Vary` is not even forwarded to the origin when caching is on |
| `ETag` | **no**, `Last-Modified` only |

A **request cookies** *match condition* does exist in Standard/Premium, so a rule can branch on a
cookie. But branching is not keying: the only cache-key levers are path and query string. To vary
at the edge you would have to put the segment in the URL, which means every link carries it —
bad for canonicals, sharing and SEO, and it is roughly what V1's `?segmentbreak=true` was groping
toward.

**Conclusion: do not personalize at Front Door.** Let it cache only non-personalized responses.

Two Front Door details that matter more than they look:

- **`Set-Cookie` is stripped from any response Front Door considers cacheable.** If a personalized
  response is ever cacheable, the cookie carrying the segment silently disappears. Personalized
  responses must be `Cache-Control: private` — which Front Door honours *even over a Rules Engine
  override*, so it is a hard guarantee rather than a convention.
- **`X-Cache` is on every response** (`TCP_HIT`, `TCP_MISS`, `PRIVATE_NOSTORE`, `CONFIG_NOCACHE`).
  That is a real cache-status signal. V1 inferred cache status by comparing a timestamp against an
  8-second threshold; this replaces that guess with a fact.

### Engage already publishes the segment map

The enrichment we assumed we'd have to build already ships. Engage's headless API is a document at
`/umbraco/openapi/engage-api.json` — so it can be generated exactly like the delivery client — and
it exposes:

```
GET /umbraco/engage/api/v1/segmentation/content/segments          all segmented content
GET /umbraco/engage/api/v1/segmentation/content/segments/{path}   one page's segments
GET /umbraco/engage/api/v1/segmentation/content/activesegments/{path}   this visitor's active ones
GET /umbraco/engage/api/v1/segmentation/assets/item/{path}
```

`…/content/segments` returns **every content item that varies by segment, with the segments defined
on it** — content key, its URLs, and the segment list. Items with no segments are omitted.

That is the fragmentation lever, available today with no backend work: fetch it once, cache it, and
you know for any URL whether it is personalized at all. Most pages are not, and those need no
segment in their cache key and can go to the CDN.

Our own `engageextensions` endpoints appear in the same document, so one generated client covers
both.

### Segments: matched per visitor, resolved per page

This is the part that reshapes the design, and it is why V1 ended up probing every link.

- A visitor matches a **set** of segments — they can be "desktop user" *and* "returning visitor" at
  once.
- A page defines which of those segments it actually has a variant for, and those are **ranked**.
- The active segment for a page is the highest-ranked page variant whose segment is in the
  visitor's matched set. So **exactly one applies per page** — but *which* one differs page to page.

So the segment is not a visitor property. It is a function of (visitor's matched set, that page's
configured variants). V1 could not predict the next page's segment from a cookie holding the last
page's segment, which is precisely why it probed every link before the visitor clicked.

**But the two halves decompose.** The matched set is visitor-level and changes slowly. The page's
variants are content configuration and change only on publish. Both are cacheable, and the
resolution between them is a rank lookup:

```
segment(visitor, page) = first( page.rankedVariants ∩ visitor.matchedSet )
```

Carry the matched set in a cookie, hold the page→variants map from the endpoint above, and resolve
locally. **No Engage call on the request path.** That kills the N+1 link probing outright — not by
optimising it, but by removing the question it was asking.

Two axes, not one: A/B test assignment and personalization resolve independently, and a page can
have one of each simultaneously. The cache key needs both.

### What cannot be evaluated locally

Segment rules span: Browser, Device, Time of day, Location, Campaign, Number of sessions, Visited
pages, Customer journey, Persona, Goal, Page event, Member logged in, Member registered, and two
commerce rules.

Only the first handful are derivable from the request alone. The rest need visitor history that
lives server-side. **So do not try to ship the rules to the edge and evaluate them there** — that
gets the request-derived ones right and the behavioural ones wrong, which is worse than not trying.
Evaluate the *set* server-side, cache the *answer* in the cookie.

Personalization also supports control groups — a share of visitors deliberately held back from
personalization for measurement. Membership is per visitor and stored server-side, another reason
rule evaluation cannot be reproduced client-side. It resolves cleanly though: a control-group
visitor simply gets no segment, so they land on the default cache entry.

## The design

### Layering

```
Front Door     non-personalized pages only, long TTL, purged on publish
               personalized responses marked Cache-Control: private
Nitro cache    keyed path + abSegment + personalizationSegment,
               and only for paths the segment map says actually vary
Umbraco delivery API
```

Front Door never learns what a segment is.

### First paint

- **Returning visitor**: matched set is in the cookie, page variants are in the map, segment
  resolves locally, cache key is known before lookup. Personalized SSR, zero round trips.
- **New visitor**: no cookie, so no matched set. Serve `default` immediately and resolve their set
  in the background for next time. A visitor with no history matches almost nothing behavioural
  anyway, so the round trip V1 paid here was usually buying the answer "nothing".

Either way there is no blocking Engage call on first paint, and nothing re-renders.

### Navigation

After hydration every navigation is already a data fetch to our own Nitro route, which is talking to
Umbraco regardless. It returns the right variant *in that response* and refreshes the matched set
in the cookie as a side effect. Fresh content renders normally. There is no reload, because nothing
needs reloading — this is the case V1 solved with a synthetic link click and a full page reload.

### Be eventually consistent on purpose

If a visitor's matched set changes and they see the new variant one navigation later, nobody can
tell. V1 tried to be correct on the exact request where the segment flipped, and paid for it with
per-link probing, cache busting and page reloads. Being a beat late is invisible; a page that
reloads itself is not.

A/B testing is the exception — a late variant assignment corrupts the experiment. Assignment has to
be sticky from first touch.

### Invalidation

Content already carries `cacheKeys` (from the Kraftvaerk CacheKeys package) and publish already
purges Front Door. Two additions:

- The page→variants map needs invalidating when personalization config changes, not just on content
  publish.
- Purging a personalized path has to purge every segment variant of it, so the tag index must hold
  keys per segment.

## Strategy: warm every page and every variant

Once we accept that we cache **API payloads rather than rendered HTML**, a lazy cache stops being
the obvious choice. If the whole corpus fits in memory, hold all of it — every page and every
segment variation — and on publish *refresh* the affected entries instead of evicting them.

### It fits, comfortably

Measured against the real site on 2026-08-29: mean delivery payload **11.6 KB**, largest 31 KB.

| pages | ~entries | raw | gzipped |
|---|---|---|---|
| 200 | 260 | 2.9 MB | 0.7 MB |
| 1,000 | 1,300 | 14 MB | 3.6 MB |
| 10,000 | 13,000 | 144 MB | 36 MB |

At the scale this site will plausibly reach, the entire corpus with all variants is under a
megabyte compressed.

### Warming is a handful of requests, not thousands

The important measurement: `fetch=descendants:/` returns **full payloads in bulk**. The whole site
came back in **one request, 13 ms, 119 KB**. So a warm pass is `ceil(pages / take)` requests, not
one per page — roughly 100 requests for a 10,000-page site.

Segmented variants are fetched with the `Forced-Segment` header, which the delivery API accepts.
Don't force every segment across every page though: most pages have no variant for a given segment
and would just return the default payload again. Use `…/segmentation/content/segments` to get the
list of pages that actually vary and warm only those pairs. On this site that is one bulk pass plus
a few dozen item fetches.

### The reverse index comes for free

Every payload carries its own `cacheKeys`. So the warm pass builds `key → [(path, segment)]` as a
byproduct — warming *is* the indexing, and there is no separate index-maintenance code to write or
keep correct.

Publish then becomes: webhook hands over the changed keys, look up the affected entries, re-fetch,
swap. Refreshing rather than evicting means **no visitor ever pays for a miss**. With a lazy cache
somebody always eats the slow request after every publish.

Refresh all variants of an affected page rather than working out which variant changed. Segment
count per page is editorial configuration, not combinatorial, so it is a few extra requests — much
cheaper than the bookkeeping needed to be precise.

### The consequence worth naming

If every page × segment is resident, **Umbraco leaves the request path entirely**. It is touched on
publish and on warm, and nowhere else. The site serves from the store, and keeps serving when the
CMS is down. That is a strong property for a headless setup, and it falls out of this design rather
than costing anything extra.

### Sharp edges

- **No TTL is one missed webhook away from permanent staleness.** This is the real risk: a purely
  event-driven cache cannot self-heal. Needs a long TTL backstop *and* a periodic reconcile that
  re-enumerates and diffs `updateDate`. Cheap, given bulk enumeration.
- **Warming must not block boot**, or every deploy opens a cold window. Fill-on-miss while the warm
  pass runs behind it.
- **Two instances means two warm passes.** A shared store plus a warm lock fixes it; persisting the
  store across deploys turns warming into gap-filling.
- **`Forced-Segment` requires Engage to be enabled**, and personalization-prefixed forced segments
  are refused without the personalization licence. It will not work under the SQLite dev profile,
  where Engage is off — develop this against the `SqlServer` profile.
- **Publish is racy.** There is a window between "published" and "visible in the delivery API", so
  the refresh hook needs a retry rather than a single immediate fetch.
- **Draft and preview bypass the cache entirely.**

## Choosing the store

This design does not really want a cache *library*. Warming and refreshing are ours; what is needed
underneath is a keyed store with a reverse index. Nitro's storage layer is exactly that primitive,
and it has a Redis driver, which settles the earlier `nuxt-multi-cache` question: not needed.

**Start in-process.** At 200 pages the whole corpus is under a megabyte, and a `Map` is both free
and faster than a network hop. Reach for Redis when there is a second instance or when warm state
should survive a deploy — not because of size.

When that time comes, the cheapest Azure option is **Azure Managed Redis, Balanced B0, ~$11.68/mo**.
Note that the older *Azure Cache for Redis* Basic/Standard/Premium tiers are **retiring on
30 September 2028** (Enterprise on 31 March 2027) and are disabled the day after — so Basic C0 at
~$16.06/mo is both more expensive and a dead end. Provision Managed Redis directly.

Two things about Managed Redis that affect the client: instances are **clustered by default** (a
non-clustered option exists up to 25 GB), so a Node client needs cluster-aware configuration; and it
is built around Entra ID rather than access keys, which suits this repository being public.

One structural call underpinning all of the above: **cache the delivery API response, not the
rendered HTML.** The slow part is the hop to Umbraco; Vue SSR is cheap. Caching data makes segment
fragmentation far cheaper to store and lets variants that differ in one block share most of their
data.

## What is built (2026-09-03)

Steps 3 and 5 below, plus the refresh hook in a simpler form:

- `kjeldsen.frontend/server/utils/cache/store.ts` - an in-process query cache keyed by
  `item:<path>:<segment>` and `children:<path>`, with a reverse index from every payload's
  `cacheKeys` to the entries that depend on them, a one-hour TTL and a 5000-entry cap.
- `/__nuxt_multi_cache/purge/tags` - the purge endpoint, on the URL and header the backend has
  called since V1, authenticated with the delivery key. The backend calls it on publish, unpublish
  and move to the recycle bin (`ContentPublishedCacheKeyLogger`, `ContentUnpublishedCacheKeyLogger`).
  A purge also drops the Engage segment map.
- Purge rather than refresh: an affected entry is dropped, and the next request refetches it. The
  warm pass and refresh-on-publish from the section above are still to do; at this size the miss
  after a publish costs one delivery call.
- Front Door caches `/_nuxt/*`, `/_fonts/*` and `/api/media/*` only. Pages and API responses are
  `CONFIG_NOCACHE` by the `noContentCache` rule and compressed at the origin instead, since Front
  Door only compresses what it caches.

Measured before this: Umbraco answered a 41 KB post in 150 ms; the frontend's render was about
300 ms warm and seconds cold. Always On is now enabled on both plans (free on B1).

## Where to start

Roughly in dependency order, each step useful on its own:

1. **Switch local dev to the `SqlServer` profile** and configure one personalization in the
   backoffice, so there is something for `Forced-Segment` to actually return. Nothing below can be
   verified without it.
2. **Confirm `Forced-Segment` end to end.** It is absent from Umbraco 18's delivery OpenAPI document
   (it came from Engage on 17), so it has to be sent as an extra header and proven by hand before
   anything is built on it.
3. **A store interface** — `get/set/delete(path, segment)` plus `keysFor(cacheKey)` — behind which
   an in-process `Map` sits today and Redis sits later. Everything else talks only to this.
4. **The warm pass**: enumerate with `fetch=descendants:/`, page through, store defaults, build the
   reverse index from each payload's `cacheKeys`. Then read the segment map and warm the varying
   pairs. Run it in the background, non-blocking.
5. **Serve from the store**, falling back to a live fetch on miss, so a cold or half-warm cache is
   never a failure — only slower.
6. **The refresh webhook**: backend posts changed `cacheKeys` on publish, frontend re-fetches those
   entries and swaps them. Authenticated the way the multi-cache purge API was.
7. **The reconcile sweep** last, as the backstop for a dropped webhook.

Steps 3–5 are worth having before personalization enters the picture at all; they work with a single
`default` segment and stay correct when segments arrive.

## Open questions

- Does a Front Door rules-engine **URL rewrite** change the cache key, or is the key computed from
  the inbound URL? If rewrite happens first, a cookie match plus rewrite could get the segment into
  the key after all. The docs do not say. Needs a real test before anyone relies on it — and the
  design above deliberately does not.
- How expensive is `…/content/segments` on a large site, and how do we know when to refetch it?
- What is the actual memory ceiling on Azure Managed Redis B0? Third-party pricing listings give the
  price but not the size. Irrelevant at this site's scale — the whole corpus is under a megabyte —
  but confirm on the Azure pricing page before assuming headroom.
- Does a forced-segment fetch return a payload byte-identical to the default when the page has no
  variant for that segment? If so, dedupe those to the default entry instead of storing twice.
- Does the matched set need to be signed? It is in a cookie and it selects content. V1 encrypted the
  segment (JWE) for this reason. A tampered set only lets a visitor see another segment's published
  content, so the risk is low, but it should be a decision rather than an oversight.

## A note on sources

The observable API surface above comes from the OpenAPI documents the CMS serves and from Microsoft's
public documentation. Engage's internals are under NDA and are deliberately not reproduced here —
this repository is public.
