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

## Choosing the cache

`nuxt-multi-cache` is no longer the only option. Nitro's `defineCachedEventHandler` has a `getKey`
hook, which is the capability that made V1's approach work, and it is native. What multi-cache adds
is tag-based invalidation, which we do need.

Leaning: Nitro-native, with a small tag→keys index, because V2's cache surface is two API routes
rather than V1's sprawl. Revisit if component-level caching becomes necessary. Decide separately
whether we scale out — shared Redis matters then, a single instance does not.

One structural call: **cache the delivery API response, not the rendered HTML.** The slow part is
the hop to Umbraco; Vue SSR is cheap. Caching data makes segment fragmentation far cheaper to store
and lets variants that differ in one block share most of their data.

## Open questions

- Does a Front Door rules-engine **URL rewrite** change the cache key, or is the key computed from
  the inbound URL? If rewrite happens first, a cookie match plus rewrite could get the segment into
  the key after all. The docs do not say. Needs a real test before anyone relies on it — and the
  design above deliberately does not.
- How expensive is `…/content/segments` on a large site, and how do we know when to refetch it?
- Does the matched set need to be signed? It is in a cookie and it selects content. V1 encrypted the
  segment (JWE) for this reason. A tampered set only lets a visitor see another segment's published
  content, so the risk is low, but it should be a decision rather than an oversight.

## A note on sources

The observable API surface above comes from the OpenAPI documents the CMS serves and from Microsoft's
public documentation. Engage's internals are under NDA and are deliberately not reproduced here —
this repository is public.
