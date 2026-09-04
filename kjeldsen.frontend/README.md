# kjeldsen.frontend

Nuxt 4 + Tailwind 4 frontend for kjeldsen.dev, talking to Umbraco through the Delivery API.

This is V2 — a deliberate rewrite. See [knowledge/frontend-v2.md](../knowledge/frontend-v2.md)
for what was learned reading V1 and why this is shaped the way it is.

## Design

Dark only. The whole system lives in `app/assets/css/main.css`: tokens in `@theme`, then the
atmosphere, motion, chrome, surfaces, block grid, code windows and rich-text rules, each in a
labelled section. Components carry Tailwind utilities for layout and reach for the named classes
in that file for anything with a look of its own, so a block previews identically in the
backoffice (see below) and on the site.

- **Type.** Instrument Serif for titles, Inter for reading, JetBrains Mono for labels and code, all
  from Google Fonts with system fallbacks.
- **Emphasis.** Editors' `**bold**` and `--italic--` markers, and the editor's own bold and italic,
  are the same thing: bold is a warm gradient, italic swaps into the serif in lavender.
- **Motion.** All of it is CSS. Hero content rises on load (`.rise`); blocks fade up the first time
  they scroll into view (`v-reveal`, `app/plugins/reveal.ts`); images fade in when their bytes
  arrive; the aurora behind the page drifts; a hero picture drifts very slowly. Every one of these
  is off under `prefers-reduced-motion`, and scroll reveals are gated on `html.js` with a CSS
  safety so a browser without script still sees everything.
- **Pages.** `app/components/chrome/` holds the per-type chrome: the home page lifts its opening H1
  and paragraph into the hero (`app/utils/hero.ts`) and lists the newest posts; a post carries its
  date, author, reading time, a progress bar and a sticky outline; a container lists its children
  as cards with the newest featured.
- **Code.** Highlighted on the server (`server/utils/highlight.ts`, shiki's fine-grained core with
  its JavaScript engine and only the grammars the posts use) when a payload is fetched, so the
  browser receives coloured spans and never a highlighter. Editors paste Markdown fences; the
  language is read off the fence (`shared/fence.ts`).
- **Images.** Every CMS image is requested as WebP (`format=webp`, re-encoded by ImageSharp on
  the CMS, about a third of the JPEG bytes) at the crop sizes the media type defines, with a
  `sizes` hint derived from the grid columns the block spans (`app/utils/blocks.ts`): a
  half-width block never downloads a full-width picture. The media route signs `width`,
  `height`, `rxy`, `format` and `quality` and nothing else.
- **First paint.** The stylesheet is inlined into the HTML (`features.inlineStyles`), and
  `server/plugins/font-preload.ts` reads the inlined `@font-face` rules and preloads the latin
  regular weight of each family (plus the serif's italic), so the fonts start with the HTML
  rather than after layout. No hashed file name is written anywhere by hand. Nothing is fetched
  from a second origin - there is no second origin.
- **Script after picture.** `server/plugins/defer-scripts.ts` takes the client bundle and its
  modulepreload hints out of the head and puts them back from a few bytes of inline script once
  the browser reports its largest-contentful-paint entry (or after two seconds, whichever is
  first). Every page is server-rendered
  and links are ordinary anchors, so the bundle only adds client-side navigation and the entrance
  animations; on a slow connection it no longer shares bandwidth with the hero picture and the
  fonts. `DEFER_SCRIPTS=0` in the environment switches it off without a rebuild.
- **Warm after deploy.** The pipeline's last stage crawls the pages and fetches every image
  variant they reference, so the one-time WebP encode on the CMS (eight seconds cold for a hero
  picture on the S0 tier) and Front Door's edge fill happen before a visitor arrives. ImageSharp's
  cache lives in blob storage, so an encode is paid once per variant, ever.
- **Pictures the CMS has none of** - the home page when no background is set, listing pages, the
  error page - come from Unsplash, addressed by photo id in `app/utils/images.ts`.

## Running it

The CMS has to be up first — the frontend has no content of its own.

```bash
cd kjeldsen.backend && dotnet run
```

Then, in another terminal:

```bash
npm install --prefix kjeldsen.frontend && npm run --prefix kjeldsen.frontend dev
```

The frontend is on http://localhost:3000, the CMS on https://localhost:44375.

`.env` holds `CMSHOST` and `DELIVERY_KEY`. It is gitignored and must stay that way — this
repository is public.

## Regenerating the API client

```bash
npm run --prefix kjeldsen.frontend gen
```

Reads `https://localhost:44375/umbraco/openapi/delivery.json`, so **the CMS must be running**. That
is why generation is a separate command and not part of `build`.

Two things about this worth knowing:

- Umbraco 18 serves OpenAPI at `/umbraco/openapi/{document}.json`. On 17 it was
  `/umbraco/swagger/{document}/swagger.json`, which is now a 404.
- The document is OpenAPI **3.1.1**, so generation uses `@hey-api/openapi-ts`. The old
  `openapi-typescript-codegen` is archived and handles 3.0 only.

Everything under `server/delivery-api/` is generated. Do not edit it.

## Types

Content types are **generated**, not hand-written. Umbraco 18 emits a schema per document, element
and media type into the delivery document when
`Umbraco:CMS:DeliveryApi:OpenApi:GenerateContentTypeSchemas` is on (it is, in `appsettings.json`),
so the client gets a union discriminated on `contentType` with typed `properties`.

Narrow with a plain check — `if (content.contentType === 'homePage')` — and TypeScript does the
rest. `types/content.ts` only aliases the generated names and holds the `gridOf` helper. When a
doctype changes, run `npm run gen`.

## Listing pages

A container page (`blogPostContainerPage`, `writerContainerPage`) renders its children through
`ChildList.vue`, which reads a summary from `server/api/content-children.ts` rather than the
documents themselves — a full fetch put every child's block grid into the SSR payload, measured at
108KB for four links.

The card fields come from the `seoComposition` on the child's type: `seoTitle`, `seoDescription`,
`seoListImage`, `seoPublishingDate`, plus the author from the `writer` picker. They are null on
children whose type has no such composition, so a listing falls back to the document name.

**Ordering happens in the endpoint, not the component.** The delivery API sorts on built-in fields
only — `createDate`, `updateDate`, `name`, `sortOrder` — and a post's date is a property, so `sort`
in the query only decides which 100 children are taken and the real ordering is done after. Newest
`seoPublishingDate` first, falling back to `updateDate` so containers without dates keep a stable
order. Above 100 children this needs revisiting.

Thumbnails ask `/api/media` for a width by number rather than by crop alias, because that route
signs any width up to 2000. The `width`/`height` attributes describe the image that arrives, not the
original — one list image is 4000x6000, and using its size reserves a 1050px-tall box before it
loads.

## Block preview in the backoffice

`Kraftvaerk.Umbraco.Headless.BlockPreview` renders each block in the editor by asking this app what
the block looks like. For every block on the page it POSTs one serialised `IApiElement` to
`HeadlessBlockPreview:Host` + `:Api` (`/__blockpreview`), scrapes the element matching `:Selector`
(`#__preview`) out of the HTML that comes back, wraps it in `:Template`, and drops the fragment into
a shadow root beside the block. The block being edited is unsaved, so the payload on the request is
the only place its content exists — there is nothing to fetch by id.

Two consequences follow from that shadow root, and they are the whole reason the two pieces below
exist:

**The CSS has to be one self-contained file.** Nothing on the backoffice page reaches into a shadow
root, so the fragment is styled solely by the `<link>` in `:Template`, which resolves against the
CMS. `npm run build:cms-css` runs the Tailwind CLI over the same entry the app uses and writes
`kjeldsen.backend/wwwroot/css/cms.css`. Re-run it whenever a component starts using a utility class
it did not use before — the CLI only emits what it finds in the source.

That is also why site-wide rules like `.rte` live in `app/assets/css/main.css` rather than in a
component's `<style scoped>`: a scoped rule's `data-v-` hash is a build artifact, and the bundle's
copy would have to match whichever server rendered the preview.

**Images have to point at the CMS.** Media is addressed `/api/media/...` and served by this app, but
inside the backoffice a root-relative URL resolves against the CMS instead. Pointing them back here
does not work either — the CMS is https and the frontend is http in development, so the browser
drops the image as mixed content. `server/plugins/block-preview-media.ts` rewrites them to the CMS's
own `/media/...`, signed exactly as `server/api/media/` signs them.

`HeadlessBlockPreview:Debug` and `:EnableOutputCaching` are set for local work in
`appsettings.Development.json`: debug logging on, and the 24-hour cache of previews keyed on the
posted JSON off, because it otherwise hides component edits.

## Layout

| Path | What it is |
|---|---|
| `server/api/content.get.ts` | Proxies one content item. Holds the delivery key. |
| `server/api/content-children.ts` | Children of a container page, ordered and projected to a card summary. |
| `server/routes/api/[...].ts` | 404s unmatched `/api/` paths — see the note in the file. |
| `server/utils/delivery.ts` | The configured delivery client. |
| `server/utils/media.ts` | Which image commands get signed, and how. |
| `server/middleware/block-preview.ts` | Takes the posted block off the backoffice's request. |
| `server/plugins/block-preview-media.ts` | Repoints media at the CMS for previews only. |
| `app/pages/__blockpreview.vue` | Renders that one block, no layout. |
| `app/composables/useContent.ts` | Path normalisation and the keyed fetch. |
| `app/components/content/` | Page and block resolvers, block grid, post cards, listing, outline. |
| `app/components/chrome/` | What surrounds the grid on each page type. |
| `app/components/site/` | Header, footer, hero, reading progress. |
| `app/components/blocks/` | One component per block type, async-loaded. |
| `app/plugins/reveal.ts` | The `v-reveal` scroll-entrance directive. |
| `app/utils/` | Emphasis markers, hero lifting, slugs, dates, image URLs. |
| `app/error.vue` | The 404 and error page. |
| `types/content.ts` | Aliases over the generated content union, plus `gridOf`. |

The browser never talks to Umbraco directly. Every CMS call goes through a Nitro route so the
delivery key stays server-side.

## Umbraco Engage

Analytics, personalization and A/B tests go through the content route: one pageview registered
per navigation, the variant resolved by Engage only for pages that actually vary, and engagement
data sent back from the browser when a page is left. The whole design, the Engage behaviour it
relies on, and the list of things still to verify against a running Engage are in
[knowledge/engage-headless-v2.md](../knowledge/engage-headless-v2.md).

`npm run gen:engage` regenerates `server/engage-api/` from `/umbraco/openapi/engage-api.json`.
`ENGAGE_ENABLED=false` turns every Engage call off.

## Caching and delivery

Two caches, both in memory, both dropped by the CMS's purge:

- **Query cache** (`server/utils/cache/store.ts`): delivery API payloads keyed by what the route
  asked for (path and segment, or a container's children), indexed by the `cacheKeys` each
  payload carries. A purge drops every entry depending on one of the posted keys, and every
  listing.
- **Output cache** (`server/utils/cache/output.ts`, `server/middleware/output-cache.ts`,
  `server/plugins/render.ts`): rendered HTML per path, stored pre-compressed, served by the
  middleware before Nuxt renders anything. Bypassed for a visitor who has a segment on a page
  that varies, never filled by anything but a plain 200, and emptied entirely on any purge.
  `X-Output-Cache: hit|miss` says which happened.

The CMS posts affected keys to `/__nuxt_multi_cache/purge/tags` on publish, unpublish and move to
the recycle bin. An hour's TTL backs both caches up.

Engage's pageview registration is off the render path: the client plugin posts to
`/api/engage/pageview` after hydration and on each navigation, which is where the visitor cookie
and pageview id come from.

Front Door caches only `/_nuxt/*`, `/_fonts/*` and `/api/media/*` at the edge, all of which are
immutable per URL (build assets and fonts carry a content hash; media is keyed by its resize
parameters). Pages and API responses go to the origin every time, compressed there: Brotli for
the server-rendered HTML (`server/plugins/compression.ts`) and for API JSON when the browser asks
for it (`server/utils/compress.ts`), precompressed `.br`/`.gz` for static assets. Fonts are
downloaded at build time by `@nuxt/fonts` and served from this origin; nothing loads from Google.

## Not here yet

Full-page preview, sitemap, image optimisation. Block preview is here; the page preview flow
(`HeadlessPreview:Url`, still pointed at `/api/init-preview`) is not.
