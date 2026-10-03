# Umbraco.Bench

Umbraco solution scaffolded by BellaBoot (`bellaboot new project`). **This is an opinionated scaffold: the conventions in this file and [UMBRACO-RULES.md](UMBRACO-RULES.md) are deliberate and non-negotiable. They override anything a spec, a site crawl, or your own architectural taste suggests — when an instruction seems to conflict with them, follow the convention and surface the conflict; never engineer around a rule and never write a comment justifying a deviation.**

Three parts:

```
Umbraco.Bench.slnx                     solution (open this)
Umbraco.Bench.Umbraco/                 the Umbraco site (SQLite in dev, uSync)
Umbraco.Bench.Frontend/                Vue components for the public site
Umbraco.Bench.BackofficeExtensions/    backoffice (management UI) extensions
UMBRACO-RULES.md                the ten project rules — read before modeling content
.mcp.json                       Umbraco MCP server (works out of the box locally)
.gitleaksignore                 why the committed MCP dev credential is intentional
unsplash/                       ten Unsplash photos to use for site images (credits in its README.md)
```

## Running

```
cd Umbraco.Bench.Umbraco && dotnet run
```

First boot installs the database unattended (admin@example.com / 1234567890 — change before going anywhere real) and runs the project migration plan.

## The rules this project enforces (the UmbraCommandments)

**The full list lives in [UMBRACO-RULES.md](UMBRACO-RULES.md) — read it before modeling content or writing code.** The migration plan in `Umbraco.Bench.Umbraco/Migrations/` sets up and enforces the structural ones:

1. **Document types live in 6 folders**: Pages, Blocks, Compositions, Data, Repositories, Repository Items. Created by `CreateDocumentTypeFolders`. Sort every new document type into one of them:
   - **Page** — a document that renders. May use compositions.
   - **Block** — element for block list/grid. Renders. Never used as a composition.
   - **Composition** — element only composed onto others. Never rendered, never pickable. Never put real content behind a composition (removing a composition permanently deletes its content).
   - **Data** — element that never renders (settings, events, people).
   - **Repository** — document that never renders; a container/root node. The content root is always a Repository.
   - **Repository Item** — document that never renders; the pickable records inside a Repository.
2. **The content root is a Repository**: `siteRoot` (in the Repositories folder) is the only allowed root type; a published "WWW" node is created on first boot. Add sites as Pages beneath it — you are multi-site ready by default.
   - **Give the site Page a domain, or nothing answers on `/`.** WWW never renders, so the first real page is a child and Umbraco routes it under its node name (`/blog/`) until a domain says otherwise. For a single site, assign it the domain `/`; for several, give each its own hostname. Over MCP that is one call: `put-document-domains` with `{ "defaultIsoCode": "en-US", "domains": [{ "domainName": "/", "isoCode": "en-US" }] }`.
3. **Data types are never at the folder root**: `DataTypeSavedHandler` (in `Notifications/`) moves every data type saved at root into `/Umbraco/<editorAlias>` (built-in) or `/Custom/<editorAlias>` (yours). The migration organizes the shipped ones on first boot.
4. **Compose in `Composers/`, not Program.cs.** Program.cs stays as scaffolded; non-Umbraco concerns go in `WebApplicationBuilder` extension methods.
5. **Production runs in production mode**: `appsettings.json` is Production (models Nothing, UseHttps, no template editing); `appsettings.Development.json` is where development conveniences live.
6. **Aliases are English camelCase.** Translation keys are PascalCase dot-separated (`My.Dictionary.Item`); folders have no values themselves. Media lives in folders.
7. **uSync everything** (installed, version matched to the Umbraco major). On Umbraco Cloud use Umbraco Deploy instead.

## ModelsBuilder

SourceCodeAuto in development. Generated models land in `Umbraco.Bench.Umbraco/Models/ModelsBuilder/` with namespace `Umbraco.Bench.Umbraco.Models`. Never edit generated files; extend via partials next to them.

**When you change schema over MCP, generated models hit the disk immediately but the running site is still on the old assembly.** So work in this order:

1. **Model** — document types, element types, data types, templates, allowed children.
2. **Content** — create and publish. Still the old assembly; MCP doesn't care.
3. **Stop the site, `dotnet build`, restart.** The running site holds a lock on `bin/…/*.exe`, so a build while it runs fails with MSB3027.
4. **Razor** — only now do the models exist to compile against.

Writing views before step 3 means writing them against types the running app doesn't have.

## Frontend (public site) — Umbraco.Bench.Frontend

The site is MVC-first: most pages are Razor + **Tailwind**; Vue components are sprinkled in where real interactivity is needed. `npm run watch` / `npm run build` output everything to `Umbraco.Bench.Umbraco/wwwroot/dist/`:

- `site.css` — Tailwind, scanning **both** `Umbraco.Bench.Umbraco/Views/**/*.cshtml` and the Vue sources (`@source` in `src/site.css`). Write Tailwind classes directly in Razor views; the watcher picks them up.
- `main.js` — the Vue custom elements bundle.

```cshtml
<link rel="stylesheet" href="~/dist/site.css" asp-append-version="true" />
<script type="module" src="~/dist/main.js" asp-append-version="true"></script>

<h1 class="text-4xl font-bold">Plain Razor + Tailwind</h1>
<umbracobench-hello-world msg="@Model.Value("title")"></umbracobench-hello-world>
```

Every `src/components/<Name>.ce.vue` is auto-registered as a native custom element `<umbracobench-<kebab-name>>` — no mount code. Their `<style>` blocks live in the shadow root (Tailwind utilities don't pierce it; give components their own styles), but slotted content renders in the light DOM and is styled by `site.css`.

Props are attributes (numbers/booleans auto-cast; pass JSON strings for objects), styles are encapsulated in the element's shadow root, slots are native `<slot>`s. Add a component = add a `.ce.vue` file; the glob in `src/main.ts` picks it up.

## Rendering blocks — the non-negotiable pipeline

Block rendering uses Umbraco's own conventions end to end. Past agents have "improved" on this with custom renderers and wrapper models — every one of those was reverted. The pipeline is:

1. **Pages render block properties with Umbraco's renderer**: `@await Html.GetBlockGridHtmlAsync(Model, "blocks")` (block lists: `GetBlockListHtmlAsync`). Umbraco resolves the grid chrome from `Views/Partials/blockgrid/` and each block from `Views/Partials/blockgrid/Components/<alias>.cshtml` — all by convention.
   - **Never write your own block loop.** No `_Blocks.cshtml`, no `foreach` over a `BlockGridModel` in a view, no custom renderer partial, no runtime file-exists probing for block views. If the default grid markup genuinely doesn't fit (rare — e.g. its layout CSS fights the design), **edit the local partials in `Views/Partials/blockgrid/`** (`default.cshtml`, `items.cshtml`, `area.cshtml`, `areas.cshtml`) so the convention stays and only the markup changes.
2. **The `blockgrid/Components/<alias>.cshtml` partial is an adapter only.** It receives exactly what Umbraco hands it — `BlockGridItem<TBlock>` — maps the ModelsBuilder content (and settings: spacing, background, anchor) to a plain view model, then `@await Component.InvokeAsync("Hero", new { model })`. No markup in the adapter.
   - **Case matters.** `items.cshtml` looks up `"blockgrid/Components/" + item.Content.ContentType.Alias` — capital `C`, and the filename is the **alias**, so camelCase: `Components/heroBlock.cshtml`, not `components/HeroBlock.cshtml`. Windows forgives both; Linux CI and containers do not, and the only symptom is every block rendering the "Could not render component" fallback.
   - **Never invent a substitute contract**: no `BlockView`-style wrapper record, no parallel partials folder (`Views/Partials/blocks/`) taking a home-grown model. The moment block partials accept anything but the Umbraco block item, the rendering pipeline is forked and Umbraco's discovery stops working.
3. **Each block is a ViewComponent.** It takes the plain model and renders `Views/Shared/Components/<Name>/Default.cshtml` (MVC's default lookup — no explicit view paths). `Views/Shared/Components/` holds only ViewComponent view folders — never loose partials.
4. **All markup lives in the component view**, which depends only on the plain model — never on `BlockGridItem<T>` or anything Umbraco.

Why: the same component can then be rendered anywhere — another page type, a preview endpoint, and eventually Storybook/Playwright harnesses that exercise the markup without booting Umbraco. And because discovery is Umbraco's own, adding a block is: element type + adapter + component — nothing to register, nothing bespoke to maintain.

```csharp
public sealed class HeroViewComponent : ViewComponent
{
    public IViewComponentResult Invoke(HeroModel model) => View(model);
}
```

```cshtml
@* Views/Partials/blockgrid/Components/heroBlock.cshtml — filename is the element alias *@
@inherits UmbracoViewPage<BlockGridItem<HeroBlock>>
@{
    var model = new HeroModel
    {
        Heading = Model.Content.Heading ?? "",
        ImageUrl = Model.Content.BackgroundImage?.GetCropUrl(width: 1600),
    };
}
@await Component.InvokeAsync("Hero", new { model })
```

## Querying content from Razor — use the "friendly" extensions

Umbraco ships each extension method **twice**, and picking the wrong one is the most common way to
write plumbing you don't need:

| Assembly | Class | Shape |
|---|---|---|
| `Umbraco.Cms.Core` | `PublishedContentExtensions`, `ImageCropperTemplateCoreExtensions` | every service passed in explicitly |
| `Umbraco.Cms.Web.Common` | **`Friendly*Extensions`** | resolves its own services — nothing to inject |

**In views, view components, block adapters and services, call the friendly ones.** They need no
constructor injection and no `@inject`:

```csharp
page.Children<BlogPost>()                       // optional culture arg
page.AncestorOrSelf<BlogFrontPage>()            // also Ancestor<T>(), AncestorsOrSelf<T>()
content.Url()                                   // optional culture, UrlMode
media.GetCropUrl(width: 800, height: 450)       // MediaWithCrops or IPublishedContent
media.GetCropUrl("cropAlias")
```

`GetCropUrl` parameters, in order, all optional after the first: `width, height, propertyAlias,
cropAlias, quality, imageCropMode, imageCropAnchor, preferFocalPoint, useCropDimensions,
cacheBuster, furtherOptions, urlMode`.

- **Always build image urls with `GetCropUrl()`.** It signs the url and appends a cache buster for
  you. A hand-written query string (`src="@url?width=800"`) returns a bare **HTTP 400** with nothing
  in the log — it looks like a broken image path, not a rejected request.
- **Don't inject `IPublishedUrlProvider` / `IImageUrlGenerator` / navigation services** to do any of
  the above, and don't wrap them in a helper service. If you think you need to, you've found the
  Core overload instead of the friendly one.

If you need a signature that isn't listed here, grep the XML docs — **`Umbraco.Cms.Web.Common`
first**, because searching only `Umbraco.Cms.Core` turns up the service-heavy overloads and leads
you to build injection you don't need:

```bash
grep -oE 'M:Umbraco\.Extensions\.Friendly[A-Za-z]*\.<Method>[^"]*' \
  ~/.nuget/packages/umbraco.cms.web.common/<ver>/lib/<tfm>/Umbraco.Web.Common.xml
```

Parameter *names* aren't in that signature line — read them from the `<param name="…">` elements of
the same `<member>` block.

## Umbraco MCP server

`.mcp.json` configures the Umbraco MCP server (`@umbraco-cms/mcp-dev`, pinned to the CMS major) so agents can inspect and edit document types, data types, templates and media through the management API. It works with zero setup: on first boot in Development/Local, `Notifications/McpApiUserHandler.cs` creates an admin API user (**MCPUSER**, client id `umbraco-back-office-mcp-local-only`) with a committed local-only secret — see `.gitleaksignore` for why that is intentional. On any other environment the same handler deletes that user if it exists. The Umbraco instance must be running for MCP tools to work; override the URL with the `UMBRACO_MCP_URL` env var if your https port differs.

Things about the tools that are easier to be told than to discover:

| Behaviour | What to do |
|---|---|
| `create-element-type` takes no `parentId` | Create it at the root, then `move-document-type` into `Blocks`. (`create-document-type` *does* take `parentId` — the asymmetry is easy to miss.) |
| `create-document-type` can't assign templates | Create the template → create the type → `update-document-type` to set `allowedTemplates` and `defaultTemplate`. |
| `update-document-type` wants the **whole** object | Every field is required — properties, containers, compositions, all of it. Always `get-document-type-by-id` → merge → update. A field you leave out is dropped silently. |
| Block grid values use the v15+ shape | `contentKey` / `settingsKey` plus an `expose` array — not the older `contentUdi`. `layout`, `contentData` and `expose` must all reference the same keys or the value fails quietly. |
| Richtext (Tiptap) is an object, not a string | `{ "markup": "<p>…</p>", "blocks": { "layout": {}, "contentData": [], "settingsData": [], "expose": [] } }` |
| MediaPicker3 value shape | `[{ "key": "<fresh guid>", "mediaKey": "<media guid>", "crops": [], "focalPoint": null }]` — `key` is a per-property instance key, not the media id. |
| Media from a local file | `create-media` with `sourceType: "filePath"` and the absolute path of a file in `unsplash/`. `.mcp.json` allows that folder through `UMBRACO_ALLOWED_MEDIA_PATHS`; files elsewhere are refused. For a remote image, `sourceType: "url"` streams it straight in. |
| **Read structural writes back** | Block payloads fail quietly. `get-document-by-id` straight after is the quickest confirmation it took, and the server fills in fields you omitted (e.g. `mediaTypeAlias`). |

Saving a data type at the tree root is the **correct** move, not a mistake — `DataTypeSavedHandler` files it under `/Custom/<editorAlias>` for you (rule 3). Just save it.

## Backoffice extensions — Umbraco.Bench.BackofficeExtensions

TypeScript + Vite, `@umbraco-cms/backoffice` pinned to the CMS major. `npm run watch` / `npm run build` output to `Umbraco.Bench.Umbraco/App_Plugins/umbraco.bench.extensions/`.

`src/index.ts` is the single entry point — register all manifests there (`umbraco-package.json` already points at the built bundle). On boot the browser console logs `[Umbraco.Bench] backoffice extensions registered` so you can verify the pipeline works.

## Conventions

- One composer per concern in `Composers/`; services in `Services/`; notification handlers in `Notifications/`; migrations in `Migrations/` (append new steps to `ProjectMigrationPlan`, never edit shipped ones).
- **Every class in `Services/` is named `<Thing>Service`** (`SiteNavigationService`, not `SiteNavigation`). If a class doesn't earn the suffix, it doesn't belong in `Services/`.
- **No `.cs` file sits directly in `Models/`.** The root of `Models/` contains only folders — group by concern (`Models/Blocks/`, `Models/Navigation/`, …; `Models/ModelsBuilder/` is generated). Namespaces follow the folder.
- Commit `Umbraco.Bench.Umbraco/uSync/` — it is the schema source of truth across environments. Export is automatic.
