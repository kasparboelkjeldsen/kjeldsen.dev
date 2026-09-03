# kjeldsen.frontend

Nuxt 4 + Tailwind 4 frontend for kjeldsen.dev, talking to Umbraco through the Delivery API.

This is V2 — a deliberate rewrite. Structure only: there is no design here yet, and the styling is
the minimum needed to keep a page readable. See [knowledge/frontend-v2.md](../knowledge/frontend-v2.md)
for what was learned reading V1 and why this is shaped the way it is.

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

## Layout

| Path | What it is |
|---|---|
| `server/api/content.get.ts` | Proxies one content item. Holds the delivery key. |
| `server/api/content-children.ts` | Children of a container page, projected to a summary. |
| `server/routes/api/[...].ts` | 404s unmatched `/api/` paths — see the note in the file. |
| `server/utils/delivery.ts` | The configured delivery client. |
| `app/composables/useContent.ts` | Path normalisation and the keyed fetch. |
| `app/components/content/` | Page and block resolvers, child listing. |
| `app/components/blocks/` | One component per block type, async-loaded. |
| `types/content.ts` | Hand-written property types. |

The browser never talks to Umbraco directly. Every CMS call goes through a Nitro route so the
delivery key stays server-side.

## Not here yet

Umbraco Engage — no personalization, segmentation or analytics. V1's approach is described in the
knowledge note, including what its round trips cost; it is getting a fresh design rather than a
port. Also absent by choice: caching, preview, sitemap, image optimisation, SEO tags beyond
`<title>`.
