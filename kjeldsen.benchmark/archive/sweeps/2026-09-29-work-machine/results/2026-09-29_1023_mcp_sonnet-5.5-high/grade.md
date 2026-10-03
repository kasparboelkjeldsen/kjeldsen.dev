# Grade: 2026-09-29_1023_mcp_sonnet-5.5-high

**96 / 100** · test: MCP · graded by Fable 5.1 on 2026-09-29

Run: 7:13 total (blog prompt 6:56), 43 requests, 100 tool calls (40 Umbraco MCP, 1 failed shell call), 156,868 tokens excluding cache reads.

## Summary

A complete, working blog built through the Umbraco MCP server: a front page with hero and post list blocks, and two published posts built from rich text, image and quote blocks, rendered through the prescribed adapter > ViewComponent pipeline with a clean Tailwind design. The flaws are small: thin posts of about 200 words, query logic in the post list adapter, and a block set without alt text or any layout options.

## Scores

| Category | Score | Max |
|---|---|---|
| It works | 35 | 35 |
| Content modeling | 24 | 25 |
| Code architecture & conventions | 24 | 25 |
| Content & presentation | 8 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **96** | **100** |

### It works (35/35)

- `dotnet build`: 0 errors, 0 warnings (5/5).
- `/` returns 200 and is the blog front page. Both cards show image, date, title and summary, and both links resolve (10/10).
- Both posts render every block, with no "Could not render component" or exception text (10/10).
- 5 Unsplash images imported into the media folder `Blog`, served through signed `GetCropUrl` URLs; 7/7 image requests load and none are hot-linked (5/5).
- Domain `/` is set on the `MCP Notes` page under WWW, and all 4 documents are published (5/5).

### Content modeling (24/25)

- Folders 8/8: 5 element types in Blocks, `blogFrontPage` and `blogPost` in Pages, `siteRoot` in Repositories.
- Block set 6/7: hero, rich text, image, quote and post list are reusable and sensible, and each page type has its own grid data type that allows only the blocks that fit. `imageBlock` has no alt text property, and every block is fixed at 12 columns with no areas or settings, so the grid works as a plain list.
- Structure 5/5: `siteRoot` is the only root type, `siteRoot` > `blogFrontPage` > `blogPost`, templates assigned, camelCase aliases, both block grid data types in `/Custom/Umbraco.BlockGrid`.
- Hygiene 5/5: no compositions; `summary`, `publishDate` and `heroImage` are real properties; nothing orphaned or duplicated.

### Code architecture & conventions (24/25)

- Pages 7/7: both page views call `Html.GetBlockGridHtmlAsync(Model, "blocks")`; the scaffold's `Views/Partials/blockgrid/*.cshtml` are unchanged.
- Adapters 5/6: five alias-named adapters with no markup, but `blogPostListBlock.cshtml` does the content query itself and reads the current page from `Context.Features.Get<UmbracoRouteValues>()`.
- ViewComponents 7/7: one per block, default view lookup, plain models in `Models/Blocks/`, component views free of Umbraco types.
- Conventions 5/5: `Program.cs` untouched, no migrations, friendly extensions and `GetCropUrl`, Tailwind pipeline used. `_ViewImports.cshtml` was changed to import the ModelsBuilder namespace, which is a legitimate fix.

The automated check `code.appsettingsJsonUnchanged` fails, but it is a false positive. The only change to `appsettings.json` is the `Imaging:HMACSecretKey` that Umbraco writes on first boot. The file was last written at 08:23:31Z, before the run started at 08:23:48Z, and the transcript shows no edit of that file by the model.

### Content & presentation (8/10)

- Content 4/6: both posts are on topic and accurate, and each is spread over 4 blocks with relevant, captioned images. They are thin: about 240 and 200 words of body, in four short paragraphs each.
- Presentation 4/4: coherent design, proper card listing, readable post pages.

### Process & honesty (5/5)

- Channel 3/3: 40 MCP calls (29 writes) and nothing through the Management API, uSync, the database, a browser or migrations. Razor was written after Umbraco was stopped and built. No memory access and no reads of other projects or earlier results. The only paths outside the project are scratch `curl` output in `/tmp` and the model's own background task log; not deducted.
- Report 2/2: accurate. It says it verified with `curl` only, and it discloses the fixed 12-column spans and that it did not check the data type folders.

## Issues

| Severity | Issue | Where |
|---|---|---|
| minor | Posts are thin: about 240 and 200 words of body, four short paragraphs each. | `/one-protocol-to-connect-them-all/`, `/building-a-cms-site-by-conversation/` |
| minor | The post list adapter does the content query and reads the current page from `Context.Features.Get<UmbracoRouteValues>()` instead of only mapping. | `Umbraco.Bench.Umbraco/Views/Partials/blockgrid/Components/blogPostListBlock.cshtml` |
| minor | `imageBlock` has no alt text property; the caption is reused as alt. Every block is fixed at 12 columns with no areas or settings. | `Umbraco.Bench.Umbraco/Views/Shared/Components/ImageBlock/Default.cshtml`, data types `Blog Front Page Block Grid` and `Blog Post Block Grid` |
| minor | Bench tooling, not the model: `code.appsettingsJsonUnchanged` fails on the `Imaging:HMACSecretKey` that Umbraco writes on first boot. No points deducted. | `Umbraco.Bench.Umbraco/appsettings.json` |

## What it built

**Document types**

| Alias | Folder | Kind | Properties |
|---|---|---|---|
| `siteRoot` | Repositories | document, root | none; allows `blogFrontPage` |
| `blogFrontPage` | Pages | document | `siteTitle`, `blocks` (block grid); allows `blogPost` |
| `blogPost` | Pages | document | `summary`, `publishDate`, `heroImage`, `blocks` (block grid) |
| `heroBlock` | Blocks | element | `heading`, `subheading`, `image` |
| `richTextBlock` | Blocks | element | `text` |
| `imageBlock` | Blocks | element | `image`, `caption` |
| `quoteBlock` | Blocks | element | `quote`, `attribution` |
| `blogPostListBlock` | Blocks | element | `heading`, `maxPosts` |

**Data types**: `Blog Front Page Block Grid` (hero, post list, rich text) and `Blog Post Block Grid` (rich text, image, quote), both in `/Custom/Umbraco.BlockGrid`.

**Pages**

| URL | Type | Blocks |
|---|---|---|
| `/` (MCP Notes) | `blogFrontPage` | hero, post list |
| `/one-protocol-to-connect-them-all/` | `blogPost` | rich text, image, quote, rich text |
| `/building-a-cms-site-by-conversation/` | `blogPost` | rich text, image, quote, rich text |

**Code**: 5 adapters in `Views/Partials/blockgrid/Components/`, 5 ViewComponents in `ViewComponents/` with views in `Views/Shared/Components/<Name>/Default.cshtml`, 6 plain models in `Models/Blocks/`, a shared `_Layout.cshtml`, and two page views.

**Front page**: a white header with the site title and an "All posts" link, a full-width dark hero over a night-time photo of Earth with heading and subheading, then "Latest posts" as two cards side by side. Each card has a 16:9 image, date, title and summary. A simple footer closes the page.

![Front page](../../screenshots/sonnet-5.5-high-2026-09-29_1023-frontpage.png)

**Blog post**: date, large title and summary in a narrow column, a rounded hero image, then the block grid: rich text with subheadings, a captioned image, a pull quote with an indigo left border, and more rich text.

![Blog post](../../screenshots/sonnet-5.5-high-2026-09-29_1023-blogpost.png)
