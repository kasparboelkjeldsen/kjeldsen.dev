# kjeldsen.dev

The source of [www.kjeldsen.dev](https://www.kjeldsen.dev): headless Umbraco 18 with Umbraco
Engage, a Nuxt 4 frontend that renders on the server, Azure Front Door in front of two B1 App
Service plans, and the infrastructure as Pulumi. It is a personal site, kept deliberately cheap,
and written up as it goes so it doubles as a worked example of running headless Umbraco on plain
Azure.

Each part has its own README; this one is the map.

| Part | What it is | Read next |
|---|---|---|
| `kjeldsen.backend/` | Umbraco 18.1 on .NET 10 with Engage 18, the Delivery API, uSync, blob-backed media and image cache, and the custom code that talks to the frontend | [knowledge/](knowledge/README.md) |
| `kjeldsen.frontend/` | Nuxt 4, Tailwind 4, a generated Delivery API client, two caches, server-side syntax highlighting, an RSS feed | [kjeldsen.frontend/README.md](kjeldsen.frontend/README.md) |
| `kjeldsen.infra/` | Pulumi in C# against a local file backend, adopted from the live resources, plus the Azure Pipelines YAML | [kjeldsen.infra/README.md](kjeldsen.infra/README.md) |
| `knowledge/` | Working notes: the reasons behind decisions that look odd without context, the traps that cost time, and how the model-drawn illustrations work | [knowledge/README.md](knowledge/README.md) |

## How it fits together

- **Front Door** (`kjeldsen-dev` endpoint) terminates TLS for `www.kjeldsen.dev` and
  `umbraco.kjeldsen.dev`. It caches only build assets, fonts and resized media at the edge. Pages
  and API responses go to the origin every time and are compressed there, because a page can vary
  per visitor.
- **The frontend** never lets the browser talk to Umbraco. Every content call goes through a Nitro
  route that holds the Delivery API key. Rendered HTML sits in an output cache and delivery
  payloads in a query cache, both in memory, both dropped when the CMS posts the affected cache
  keys on publish, unpublish or move to the recycle bin.
- **Umbraco** stores media in blob storage and ImageSharp's cache next to it, so a resized WebP is
  encoded once, ever. Engage does analytics, personalization and A/B tests; the frontend registers
  one pageview per navigation and asks Engage for a variant only on pages that vary.
- **Block preview** in the backoffice asks the frontend to render each block, so an editor sees the
  block exactly as the site shows it.

## Running it locally

The CMS first, then the frontend. A local run shares the production Azure SQL database - one
environment, by choice; see [knowledge/local-development.md](knowledge/local-development.md) for
what that implies.

```bash
cd kjeldsen.backend && dotnet run
```

```bash
npm install --prefix kjeldsen.frontend && npm run --prefix kjeldsen.frontend dev
```

The frontend is on http://localhost:3000, the CMS on https://localhost:44375. The frontend reads
`CMSHOST`, `DELIVERY_KEY` and `IMAGE_HMAC_KEY` from `kjeldsen.frontend/.env`, which is gitignored
and must stay so: this repository is public. Backend secrets live in .NET user secrets locally and
in Key Vault in production.

## Shipping it

One Azure Pipelines definition, [kjeldsen.infra/pipelines/umbraco.yaml](kjeldsen.infra/pipelines/umbraco.yaml),
triggered by pushes to `main` that touch the backend or the frontend:

1. **Detect changes** decides which of the two to build.
2. **Frontend**: `npm ci`, `nuxt build`, deploy the output as a run-from-package zip.
3. **Backend**: `dotnet publish` for Linux, then a clean, asynchronous zip deploy polled until Kudu
   reports it done.
4. **Warm**: crawl every page and fetch every image variant they reference, so the first visitor
   after a deploy never waits for an encode or an edge fill.

What went wrong on the way to production, and how each was fixed, is in
[knowledge/production-deploy.md](knowledge/production-deploy.md).

## Cost

Two B1 App Service plans with Always On, one S0 SQL database, a Standard_LRS storage account and
Front Door Standard. The point of the exercise is that this lands near a low-tier Umbraco Cloud
plan while serving fonts, images and pages from the cheapest Azure that will do it well.

## Reuse

Take what is useful. The site is a reference implementation, not a framework; the notes in
`knowledge/` say why things are the way they are, which is usually the part worth copying.
