# Frontend V2

Notes taken while reading the V1 frontend, before discarding it. V1 is `kjeldsen.frontend`
(Nuxt 4, Tailwind 3, `openapi-typescript-codegen`). The rebuild keeps the *pattern* — a generated
client, SSR, segment-aware caching — and drops the accumulated experiments.

Everything below was verified against a running Umbraco 18.1.1 on 2026-08-29, not assumed.

## The one finding that changes the build: OpenAPI moved

Umbraco 18 no longer serves Swagger where V1 expects it. Probed against a live 18.1.1:

| URL | 18.1.1 |
|---|---|
| `/umbraco/swagger/index.html` | **404** |
| `/umbraco/swagger/delivery/swagger.json` | **404** (this is what V1's `npm run gen` points at) |
| `/umbraco/swagger/management/swagger.json` | 404 |
| `/umbraco/openapi/delivery.json` | **200** |
| `/umbraco/openapi/management.json` | 200 |
| `/umbraco/openapi` | 301 to `/umbraco/openapi/index.html` (the UI still exists, new home) |

So the document is there, the path changed: **`/umbraco/swagger/{doc}/swagger.json` became
`/umbraco/openapi/{doc}.json`**. Swashbuckle is still in the dependency tree
(`Swashbuckle.AspNetCore.Swagger 10.0.1`), so this is a routing/hosting change, not a removal.

### It is OpenAPI 3.1.1, and that forces a new generator

```
openapi: 3.1.1
info.title: Umbraco Delivery API Latest
8 paths, 10 schemas
```

V1 generates with `openapi-typescript-codegen@0.29.0`. That project is archived and targets
OpenAPI **3.0** — it does not understand 3.1 constructs, and this document is full of them
(every nullable field is written as a `["null", "string"]` union, which is 3.1 syntax; 3.0 used
`nullable: true`).

Use **`@hey-api/openapi-ts`** instead. It is the maintained successor to exactly that package,
supports 3.1, and emits the same shape of client (typed operations + models + a configurable base
URL), so the V1 call-site pattern survives:

```
npx @hey-api/openapi-ts -i https://localhost:44375/umbraco/openapi/delivery.json -o server/delivery-api
```

Keep `NODE_TLS_REJECT_UNAUTHORIZED=0` on the generate script — the local CMS uses the dev cert.
Keep generation as an explicit `npm run gen`, never a build step: the CMS has to be running, and a
CI box will not have one.

## Typed per-doctype models: Umbraco 18 does this itself now

V1 got its ~90 typed model files from **`Umbraco.Community.DeliveryApiExtensions`**, which walked
the doctypes and wrote a schema per content type into the Swagger document. That package stops at
**17.0.1** — there is no v18, and it could not work on 18 anyway: it hooks Swashbuckle's
`ISchemaFilter`/`IDocumentFilter`, and 18 generates its documents with
**Microsoft.AspNetCore.OpenApi** instead. `Umbraco.Cms.Api.Common` only references
`Swashbuckle.AspNetCore.SwaggerUI` now — the UI, not the generator.

**The feature moved into core.** `Umbraco.Cms.Api.Delivery` ships
`OpenApi.Transformers.ContentTypeSchemaTransformer`, which does the same job against the new
pipeline — and rather better, since it handles circular references, repairs the framework's
discriminator mapping refs, and models compositions properly. It is **off by default**:

```jsonc
"Umbraco": { "CMS": { "DeliveryApi": {
  "OpenApi": { "GenerateContentTypeSchemas": true }
} } }
```

Measured effect on this site: the delivery document went from **10 schemas to 105**, and
`IApiContentResponseModel` became a real discriminated union:

```jsonc
"IApiContentResponseModel": {
  "oneOf": [ { "$ref": "HomePageContentResponseModel" }, … ],
  "discriminator": { "propertyName": "contentType", "mapping": { "homePage": "…", … } }
}
```

which `@hey-api/openapi-ts` turns into a TypeScript union that narrows on `contentType`:

```ts
export type IApiContentResponseModel =
  | ({ contentType: 'homePage' } & HomePageContentResponseModel)
  | ({ contentType: 'blogPostPage' } & BlogPostPageContentResponseModel)
  | …
```

Compositions come through as intersections (`HomePageContentPropertiesModel =
HeadlessCompositionContentPropertiesModel & NavigationCompositionContentPropertiesModel & { … }`),
so shared properties are typed once.

Two consequences for how this repo is written:

- `types/content.ts` is **not** hand-written. It only aliases generated names and holds `gridOf`.
  When a doctype changes, run `npm run gen`; nothing there needs editing.
- The setting must be **identical locally and in production**. The client is generated against the
  local document, so a mismatch would mean shipping types the live API does not honour. It lives in
  `appsettings.json`, not `appsettings.Development.json`, for exactly that reason.

Note that `properties` is optional on the generated element models (`properties?: …`), so component
code needs `block.properties?.foo`.

### The API key became a security scheme

On 17 the key was an ordinary per-operation parameter, so V1 passes `apiKey` into every call. On 18
it is declared once as an OpenAPI security scheme and applied to every operation:

```json
"securitySchemes": { "ApiKeyAuth": { "type": "apiKey", "name": "Api-Key", "in": "header" } }
```

The generated SDK therefore emits `security: [{ name: 'Api-Key', type: 'apiKey' }]` per operation
and expects the value from the client's `auth` option — set once at client construction, not passed
per call. This is a nicer arrangement; it just is not the V1 arrangement.

Two headers V1 relied on are **not in the 18 document at all**: `Forced-Segment` and
`External-Visitor-Id`. Those were contributed by Engage's headless package on 17. The endpoints
still accept them, but the generated types will not know about them — pass them as extra headers
when Engage work resumes.

## How V1 actually gets content, and what to keep

The flow is worth preserving because it is sound:

```
app/pages/[...slug].vue          catch-all route
  -> usePageContentFromRoute()   composable, useFetch('/api/content/<slug>')
    -> server/api/content/[...slug].ts    Nitro route, holds the API key
      -> DeliveryClient.getContentItemByPath20({ apiKey, path, acceptSegment, externalVisitorId })
        -> GET /umbraco/delivery/api/v2/content/item/{path}
  -> pageResolverComponent       switch on contentType -> page component
    -> blockModule / blocks/resolverComponent   switch on contentType -> block component
       (defineAsyncComponent per block, so blocks stay out of the main chunk)
```

Keep:

- **The Nitro proxy route.** The delivery API key never reaches the browser. `deliveryKey` lives in
  private `runtimeConfig`, `cmsHost` in `runtimeConfig.public`. Do not collapse this into a direct
  client-side fetch.
- **Resolver-by-`contentType`** for both pages and blocks, with async block components.
- **The catch-all `[...slug]`**, with Umbraco owning the routing.
- **Rejecting paths containing a dot** before they reach the CMS — a cheap guard that stops
  static-asset paths being treated as content.

Drop: the `funTimeWeb*` blocks, the murder-mystery API, the EKG block, `chart.js`, `shiki`
highlighting, the Application Insights browser SDK, the `inspectChunks`/visualizer rig, and
`cms.css` / `.tmp-tailwind.css` (a 62KB build artifact that got committed). None of it is needed to
prove content flows.

### Small trap in the V1 code

`server/api/content/navigation.ts` fetches `path: ''` — the root — and the layout reads
`properties.links` off it. So "navigation" is just the home page's own document requested a second
time. Every page render therefore makes **two** delivery calls for what is one document. In V2,
fetch the root once and read both from it, or use `expand` to pull the navigation composition into
the page response.

## Personalization round trips — the part to redo properly later

Not implementing Engage in V2 yet. But V1's design is the thing being replaced, so here is what it
costs, read off the code.

The problem V1 solves: pages are cached per segment, but a visitor's segment can change mid-session,
and a cache **hit skips the middleware that would notice**.

V1's answer has four moving parts:

1. **Identify inside `buildCacheKey`.** `server/multiCache.serverOptions.ts` calls
   `identifyVisitor()` during cache *lookup*, because `buildCacheKey` runs before middleware. The
   key is `path::seg:<segment>`. This is a genuinely good idea and worth keeping: a first-time
   visitor with no cookie can still hit an existing segment's cache. The response is stashed on
   `event.context._engageResponse` so the middleware does not repeat the call.
2. **Cookies** carry the state afterwards: `engage_visitor` (1y), `engage_pv` (30m),
   `engageSegment` (7d, feeds the cache key), `segTok` (7d, the segment encrypted with JWE
   `dir` / `A256GCM` under a SHA-256 of the delivery key — `server/utils/seg-crypto.ts`).
3. **"Sneaky" link pre-checking** — `app/plugins/sneak-segmentation.client.ts`. On every mount and
   every route change it waits 500ms, walks **every anchor on the page**, and fires
   `/api/engage/sneak?path=<href>` per link, each of which POSTs to the CMS endpoint
   `/umbraco/engageextensions/pageview/sneaky-segment-check` to ask "would this visitor get a
   personalized version of that page?". If yes it rewrites the href to add `?segmentbreak=true`,
   which forces a cache miss and re-identification on the next navigation.
4. **Staleness heuristic** — a `<meta name="engage-server-gen">` timestamp is injected server-side;
   the client assumes anything older than 8 seconds came from cache and fires a catch-up pageview.

**This is the expensive part, and the reason for a new stab.** Item 3 is an N+1 over links: a page
with 20 links issues 20 SSR-proxied POSTs to Umbraco *per navigation*, and the 500ms timer races
hydration. Item 4 infers cache state from a wall-clock difference, which is a guess rather than a
signal. Items 1 and 2 are the sound half.

When it is time: prefer the CMS telling the edge what varies (a response header the cache keys on,
or a single batched "which of these paths are personalized for me" call) over the client probing
link by link. And prefer an explicit cache-status signal over a timestamp heuristic.

The endpoints these rely on are **custom**, written in `kjeldsen.backend/code/engage/` — they are
not part of Engage: `/umbraco/engageextensions/pageview/register` and `.../sneaky-segment-check`.
Both still exist on 18. Note that `server/utils/middleware/engageRules.ts` rewrites analytics URLs
to a licensed domain: the MVP licence allows 3 domains and no wildcards, so `www.kjeldsen.dev` is
normalised to `kjeldsen.dev`.

Also relevant: Engage is currently **off** in local development
(`Engage:Settings:Enabled: false` in `appsettings.Development.json`) because on SQLite its
star-generation reporting cannot be translated. Use the `SqlServer` launch profile for a local
Engage that actually works. See [engage-on-sqlite.md](engage-on-sqlite.md).

## Delivery API surface worth knowing

Request headers the delivery endpoints accept (all optional except the key):

| Header | Use |
|---|---|
| `Api-Key` | Authorises the request |
| `Accept-Language` | Language variant |
| `Accept-Segment` | Segment variant — the personalization hook |
| `Start-Item` | Root content item, by segment or GUID |
| `Preview` | Draft content |
| `Forced-Segment` | Override segmenting (Engage) |
| `External-Visitor-Id` | Override the cookie-based visitor (Engage) |

Query parameters: `fetch`, `filter`, `sort`, `skip`, `take`, `expand`, `fields`. `expand` is the
one that matters for cutting round trips.

## Config and secrets

- `cmsHost` = `https://localhost:44375` locally, from `CMSHOST`.
- `DELIVERY_KEY` is the `Api-Key` value. The delivery API is public
  (`Umbraco:CMS:DeliveryApi:PublicAccess: true`), so the key is not the only gate, but keep it
  server-side regardless.
- `kjeldsen.frontend/.env` is **gitignored** and holds the real key — confirmed, it has never been
  committed. `secrets-keys.json` *is* committed and only maps Key Vault secret names to env var
  names, which is fine.
- `scripts/generate-env.mjs` pulls those secrets at build time with a service principal and then
  purges Front Door. Worth keeping the idea; note the Front Door endpoint resource id is now also a
  Pulumi stack output (`frontDoorEndpointResourceId`), not just a Key Vault secret.

## A trap worth remembering: unmatched /api/ paths recurse

Hit while building V2, and it cost real time because the symptom is nothing like the cause.

A Nitro catch-all route at `server/api/content/[...slug].ts` does **not** match the root request
`/api/content/` — there is no segment for the catch-all to bind. And an unmatched `/api/**` request
does not 404: it falls through to the **page renderer**. So SSR of `/` fetched `/api/content/`,
which rendered the catch-all page, whose layout fetched `/api/content/`, which rendered the page…

The failure surfaces as:

```
Worker terminated due to reaching memory limit: JS heap out of memory
```

with no stack pointing anywhere useful, and every subsequent request returning 500 against a dead
worker. Two defences, both now in V2:

- Address content with a **query parameter** (`/api/content?path=`) rather than a path segment, so
  there is no empty-segment case.
- A low-priority `server/routes/api/[...].ts` that throws 404. Nitro prefers more specific routes,
  so real handlers still win; this only catches what nothing else matched, and turns a routing miss
  back into a 404 instead of a render.

Related: a page that cannot find its content must `throw createError({ statusCode: 404, fatal: true })`.
Rendering a "not found" message while returning HTTP 200 makes every typo'd URL look like real
content to crawlers and to the CDN.

## Success criteria for V2

Umbraco starts, the frontend starts, and real content comes through the delivery API. Verified
baseline for this note — 10 published items are reachable on the local SQLite database:

```
homePage               /
blogPostContainerPage  /blog/
blogPostPage           /blog/the-culture-of-kindness/   (and 3 more)
contentPage            /umbraco-packages/
writerContainerPage    /writers/
writer                 /writers/kaspar-boel-kjeldsen/
```
