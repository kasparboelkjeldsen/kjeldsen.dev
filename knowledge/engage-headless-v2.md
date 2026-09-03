# Engage in the V2 frontend

How the Nuxt frontend is wired to Umbraco Engage: analytics, personalization and A/B tests, without
V1's per-link probing, reloads or timestamp guesses. Written against Engage 18's headless OpenAPI
document, its documentation and what the API does when called, on 2026-09-03. **Built against
shape, not yet verified against a running Engage** - see the checklist at the end.

The design notes this grew from are in [caching-and-personalization.md](caching-and-personalization.md).
Where the two disagree, this file is what was built.

## The shape, in one paragraph

Every navigation is one request to the frontend's own content route (`server/api/content.get.ts`),
server side or client side. That route reads the visitor id from a signed first-party cookie, asks
Engage which variant the visitor gets **only if the page varies at all**, fetches the page from the
delivery API with that variant forced, registers the pageview with Engage exactly once, and hands
the browser the page plus the pageview id. The browser measures engagement and sends it back when
the page is left. No Engage call is ever made for a page that has no variants, and nothing
re-renders.

## What Engage itself does

Three things settled the design:

- **`/umbraco/**` is never a pageview.** Engage's collection middleware excludes every
  path under `/umbraco`. So calling the Engage API or the
  delivery API from the frontend does not itself count a visit - with one exception below.
- **The delivery API serves the variant and can count a visit.** Engage's delivery API
  integration picks the variant while the response is serialised (Forced header → A/B →
  Personalization, control groups honoured) and can attribute a pageview to that request. This is gated on
  `Engage:DeliveryApi:Segmentation:*` (all true by default).
- **`activesegments/{path}` is Engage's own answer.** It runs the same matching against the
  visitor's server-side profile and returns the A/B variant and personalization that would apply,
  with no rules shipped to the frontend. It needs an `External-Visitor-Id` Engage already knows;
  an unknown id is a 404, by design.

Two consequences: a visitor id can only come from a tracked pageview (there is no "create
visitor" call), and the frontend must make sure only **one** of its calls per navigation is
counted.

## The pieces

| Path | Role |
|---|---|
| `server/engage-api/` | Generated from `/umbraco/openapi/engage-api.json` (`npm run gen:engage`). Do not edit. |
| `server/utils/engage/client.ts` | Configured client; a 402 backs off for ten minutes. |
| `server/utils/engage/visitor.ts` | `kd_visitor` cookie: Engage's visitor id, HMAC-signed with a key derived from the delivery key, httpOnly, one year. |
| `server/utils/engage/request.ts` | The visitor's URL, referrer, user agent, IP and language, read once per request; the headers that make an Engage call look like the visitor's. |
| `server/utils/engage/segment-map.ts` | `segmentation/content/segments`, cached five minutes: which pages vary, by which segments. |
| `server/utils/engage/segments.ts` | `activesegments/{path}` for the visitor, only for pages in the map. Returns the alias to force. |
| `server/utils/engage/track.ts` | `analytics/pageview/trackpageview/server`, once per navigation, 500 ms deadline. |
| `server/api/content.get.ts` | Orchestrates the above around the delivery call. `?chrome=1` skips Engage. |
| `server/api/engage/collect.post.ts` | Engagement batch → the site's `engageextensions/pagedata/collect` on the CMS. |
| `server/api/engage/event.post.ts` | One custom event → Engage's `analytics/pageevent/trackpageevent`. |
| `app/plugins/engage.client.ts` | Engaged time, scroll depth, outbound clicks; one batch per pageview via `sendBeacon`. |
| `app/composables/useEngage.ts` | `useEngageInfo()` (pageview id, served segment) and `trackEvent()`. |
| `app/composables/useContent.ts` | Forwards the browser's headers to the content route during SSR and its `Set-Cookie` back out. |

## The request, step by step

1. **Identify.** `readVisitor` verifies the cookie signature. No cookie, or a bad one, means an
   unknown visitor: no segment lookup this time.
2. **Segment map.** `segmentsFor(path)` answers from memory. Empty for every page on this site
   today, so steps 3 and 5 are skipped and the route costs one delivery call plus one tracking call.
3. **Active segments.** For a page in the map and a known visitor, one GET to
   `activesegments/{path}` with `External-Visitor-Id` and the visitor's `User-Agent`,
   `X-Forwarded-For`, `Referer` and `Accept-Language`, so browser and device rules see the visitor.
   A/B wins over personalization, as Engage itself resolves it.
4. **Content.** The delivery call carries `Forced-Segment: <alias>` when there is one, and **no**
   `External-Visitor-Id`. Forcing makes the response a function of (path, alias) rather than of the
   visitor - the shape a shared cache needs - and leaving the visitor id off keeps the delivery
   call from being attributed as a second pageview.
5. **Track.** `trackpageview/server` in parallel with step 3, with the visitor's real browser and
   address in the body, bounded by a deadline. A new visitor gets the cookie from its answer.
6. **Respond.** The payload gains `engage: { pageviewId, segment }`. A forced segment sets
   `Cache-Control: private, no-store`, which Front Door honours unconditionally, so a variant is
   never cached for the wrong visitor and the cookie is never stripped.

First visit: steps 3 and 5 both skip or degrade, the visitor sees the default variant and gets a
cookie. Next navigation: personalized, no extra round trips beyond step 3 for pages that vary.
Eventually consistent on purpose, as argued in the design notes.

The navigation's fetch of the root document goes through the same route with `?chrome=1` and
touches nothing in Engage. On `/` that is a second delivery call, accepted so that the page's own
fetch is the only pageview.

## Client side

`useContentByPath` copies `engage` from the page response into `useState('engage')`. The plugin
watches the pageview id: a new id closes the previous batch and opens a new one. It records
engaged time (input within the last five seconds counts), the deepest scroll position, and clicks
on links to other origins. `router.beforeEach`, `pagehide` and `visibilitychange` all flush; the
server adds the visitor id from the cookie. `trackEvent(category, action, label)` posts one event
immediately.

## Backend expectations

- `Engage:Settings:Enabled` true and a licence covering the site host. Locally that means the
  `SqlServer` launch profile ([local-development.md](local-development.md)); under SQLite every
  Engage call fails softly and the site is unaffected.
- `Engage:DeliveryApi:Segmentation:ContentByPath` should be **false** in production so a forced
  delivery fetch is not also counted as a pageview. Step 4 sends no visitor id as a second guard,
  but that path still needs confirming (below).
- The site's own `engageextensions/pagedata/collect` endpoint stays; Engage's stock API has no
  endpoint for time-on-page and scroll depth, only for discrete events. The other custom endpoints
  (`register`, `sneaky-segment-check`, `rules`, `scores`) are no longer called.
- Forwarded headers: Engage reads the client IP from `RemoteIpAddress`, so the CMS needs
  `ForwardedHeaders` configured for `X-Forwarded-For` to count on the Engage API calls. The
  tracking call is unaffected: it carries the address in the body.

## What was observed locally (Engage off, SQLite profile)

- `trackpageview/server` answers 500 with a `UriFormatException` from
  `UmbracoContext.DetectPreviewMode` - the CMS, not the frontend, and only with Engage disabled.
  The content route logs it and serves the page with `pageviewId: null` in about 40 ms.
- `segmentation/content/segments` answers 200 with an empty list, so no page varies and the
  active-segments call is never made.
- `?chrome=1` returns the document without an `engage` field, as intended.
- `collect` and `event` answer 204 for well-formed bodies.

## Verified against production (2026-09-03)

- `trackpageview/server` is **rewritten by the backend** to the site's own
  `engageextensions/pageview/register` (`RedirectExtensions.AddEngageTrackingRewrite`), so that
  controller is what actually runs. It returns the stock fields plus `activeSegmentAlias`.
- **Never send the `headers` string.** When it is supplied, Engage replaces every header on the
  real request, `Host` included; the stock controller does not care, but the
  custom one then reads the Umbraco context and throws `UriFormatException: The hostname could
  not be parsed`. Without it, both `https://kjeldsen.dev/...` and `https://www.kjeldsen.dev/...`
  register and return ids, so the licence covers both hosts.
- `remoteClientAddress` must be a bare IP. Front Door forwards `ip:port`; `HeadlessHttpContext`
  rejects it with "Invalid IP Address supplied".

## To verify with a running Engage

In roughly this order, each on its own:

1. `trackpageview/server` from the frontend returns an id; the `kd_visitor` cookie appears on the
   SSR page response (the internal call's `Set-Cookie` is copied out in `useContentByPath`).
2. A second navigation sends the id back and Engage keeps the session together (one visitor, two
   pageviews).
3. A delivery fetch with `Forced-Segment` and no visitor id creates **no** pageview, with
   `ContentByPath` on and off. If it does with it on, the appsettings change above is required.
4. Configure one personalization; the segment map lists the page; `activesegments/{path}` for a
   matching visitor returns the alias; the forced delivery fetch returns the variant.
5. An A/B test on the same page: `abTest` wins and stays sticky.
6. The collect batch lands as client-side data on the pageview; a `trackEvent` lands as an event.
7. `useRequestFetch` forwards `User-Agent` and `Referer` to the content route during SSR, not only
   the cookie. If not, read them from `useRequestHeaders` and pass them along explicitly.

Not built yet, by decision: the warm cache keyed on (path, segment) from the design notes. The
route already sends the alias and the private header it will need.
