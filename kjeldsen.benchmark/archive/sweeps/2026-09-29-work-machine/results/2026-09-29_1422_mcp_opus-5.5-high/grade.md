# Grade: 2026-09-29_1422_mcp_opus-5.5-high

**99 / 100** · test: MCP · model: Opus 5.5 on **ultracode** (base effort high) · graded by Fable 5.1 on 2026-09-29

Run: 16:05 total (blog prompt 15:42), 118 requests (51 of them in workflow subagents), 121 tool calls in the main session (49 Umbraco MCP, 2 failed shell calls), 12,741,032 tokens, 539,993 excluding cache reads.

The run folder name ends in `-high` because the collector did not recognise ultracode when it created the folder. `metrics.json` says `effort: ultracode`, and the report and screenshots use that.

## Summary

A complete, working block-grid blog built through the Umbraco MCP server: a front page with hero, post list and intro text, and two substantive posts of 6 blocks each, rendered through the prescribed adapter > ViewComponent pipeline with the post query in a service and a clean Tailwind design. The only deduction is for the block model: no alt text property on the image block and no settings or layout options on any block.

## Scores

| Category | Score | Max |
|---|---|---|
| It works | 35 | 35 |
| Content modeling | 24 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 10 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **99** | **100** |

### It works (35/35)

- `dotnet build`: 0 errors, 0 warnings (5/5).
- `/` returns 200 and is the blog front page. Both cards show image, date, title, excerpt and a link, newest first, and both links resolve (10/10).
- Both posts render all 6 blocks, with no "Could not render component" or exception text (10/10).
- 5 Unsplash images imported with `create-media` into the media folder `Blog`, served through signed `GetCropUrl` URLs; 7/7 image requests load and none are hot-linked (5/5).
- Domain `/` is set on "The Model Context Blog" under WWW, and all 4 documents are published (5/5).

### Content modeling (24/25)

- Folders 8/8: 5 element types in Blocks, `blogFrontPage` and `blogPost` in Pages, `siteRoot` in Repositories.
- Block set 6/7: hero, rich text, image, quote and post list are reusable and sensible, and each page type has its own grid data type. `imageBlock` has no alt text property, no block has settings, areas or column span options, and the post title is typed twice (node name and hero heading).
- Structure 5/5: `siteRoot` is the only root type, `siteRoot` > `blogFrontPage` > `blogPost`, templates assigned, camelCase aliases, both grid data types in `/Custom/Umbraco.BlockGrid`.
- Hygiene 5/5: no compositions; `excerpt`, `listingImage` and `publishDate` are real properties on a Listing tab; nothing orphaned or duplicated.

### Code architecture & conventions (25/25)

- Pages 7/7: both page views call `Html.GetBlockGridHtmlAsync(Model, "blocks")`; the scaffold's `Views/Partials/blockgrid/*.cshtml` are unchanged.
- Adapters 6/6: five alias-named adapters with no markup. The post list adapter gets its posts from `BlogPostService` instead of querying itself. It still reads the current page from `UmbracoContext.PublishedRequest`; noted, not deducted.
- ViewComponents 7/7: one per block, default view lookup, plain models in `Models/Blocks/` and `Models/Blog/`, component views free of Umbraco types.
- Conventions 5/5: `Program.cs` untouched, no migrations, `BlogPostService` registered in `Composers/BlogComposer.cs`, friendly extensions and `GetCropUrl`, Tailwind pipeline used.

The automated check `code.appsettingsJsonUnchanged` fails, but it is a false positive. The only change to `appsettings.json` is the `Imaging:HMACSecretKey` that Umbraco writes on first boot. The file was last written at 12:22:24Z, before the run started at 12:22:45Z, and the transcript shows no edit of that file by the model.

### Content & presentation (10/10)

- Content 6/6: both posts are on topic, about 470 and 490 words, and spread over 6 blocks with headings, lists, a pull quote and a captioned image. One sentence in post 2 is imprecise about when ModelsBuilder regenerates models.
- Presentation 4/4: coherent design, proper card listing, readable post pages. Nit: the blocks use three different container widths, so left edges don't line up.

### Process & honesty (5/5)

- Channel 3/3: 49 MCP calls (31 writes) and nothing through the Management API, uSync, the database, a browser or migrations. Order followed: model, content, stop, build, Razor, restart. No memory access and nothing read from the bench's results, tests or baseline.
- The run used one Workflow with 7 subagents (3 audits, 4 verifiers) to review the finished site. They read project files and `~/.nuget`, made read-only MCP calls and fetched pages.
- Not deducted: logs, page dumps and screenshots went to the session's own scratchpad in the temp folder and to `/tmp`, and the model read its own workflow journal under `~/.claude/projects`.
- Report 2/2: accurate. It discloses the layout path mistake, the bug its review found and fixed, and the far-left focal point on the images.

## Issues

| Severity | Issue | Where |
|---|---|---|
| minor | `imageBlock` has no alt text property; the caption is used as alt text, so it is read twice and never describes the image. The model's own review flagged this and its verifier dismissed it. | `Umbraco.Bench.Umbraco/Views/Partials/blockgrid/Components/imageBlock.cshtml` |
| minor | No block has settings, areas or column span options, so the grid works as a plain list. The post title is entered twice. | Data types `Blog Front Page Grid`, `Blog Post Grid`; `heroBlock` |
| minor | The post list adapter takes the current page from `UmbracoContext.PublishedRequest`, so the block depends on the page being requested. Not deducted. | `Umbraco.Bench.Umbraco/Views/Partials/blockgrid/Components/blogPostListBlock.cshtml` |
| minor | All 5 media items are stored with focal point left 0. Current crops only trim top and bottom, so nothing shows it. Disclosed, not fixed. | Media folder `Blog` |
| minor | Post 2 says ModelsBuilder only regenerates models when the site restarts, which is imprecise for this project. | `/i-built-this-blog-by-talking-to-umbraco/` |
| minor | Blocks use three different container widths, so left edges don't line up. | `/` |
| minor | Cost of ultracode: about twice the time and three times the fresh tokens of the Opus 5.5 high run (7:33, 164,228), for a review that found one low-severity bug. | `metrics.json` |
| minor | Bench tooling, not the model: `code.appsettingsJsonUnchanged` fails on the key Umbraco writes on first boot. | `check.json` |
| minor | Bench tooling, not the model: the collector labelled the run "high" and skipped the workflow subagents' tokens. It was patched and the metrics re-collected. | `bench/lib/transcript.mjs` |

## What it built

**Document types**

| Type | Folder | Kind | Properties |
|---|---|---|---|
| `siteRoot` | Repositories | document, only root type | allows `blogFrontPage` |
| `blogFrontPage` | Pages | document, template `blogFrontPage` | `blocks` (Blog Front Page Grid); allows `blogPost` |
| `blogPost` | Pages | document, template `blogPost` | `blocks` (Blog Post Grid), `excerpt`, `listingImage`, `publishDate` |
| `heroBlock` | Blocks | element | `heading`, `subheading`, `backgroundImage` |
| `richTextBlock` | Blocks | element | `text` |
| `imageBlock` | Blocks | element | `image`, `caption` |
| `quoteBlock` | Blocks | element | `quote`, `attribution` |
| `blogPostListBlock` | Blocks | element | `heading`, `maxItems` |

**Data types:** `Blog Front Page Grid` (hero, post list, rich text) and `Blog Post Grid` (hero, rich text, image, quote), both in `/Custom/Umbraco.BlockGrid`.

**Pages**

| Page | URL | Blocks |
|---|---|---|
| The Model Context Blog | `/` | hero, post list, rich text |
| MCP Is the USB-C Port for AI | `/mcp-is-the-usb-c-port-for-ai/` | hero, rich text, image, rich text, quote, rich text |
| I Built This Blog by Talking to Umbraco | `/i-built-this-blog-by-talking-to-umbraco/` | hero, rich text, quote, rich text, image, rich text |

**Code:** 5 adapters, 5 ViewComponents with `Default.cshtml` views, 5 block models plus `BlogPostCardModel`, `BlogPostService`, `BlogComposer`, a shared `_Layout.cshtml`, and block grid and rich text styles in the Tailwind source.

**Front page:** a sticky white header with the site name, a full-width hero over a photo of city lights from orbit, a "Latest posts" section with two cards side by side (image, date, title, excerpt, "Read the post"), an "About this blog" text section and a footer crediting Unsplash.

![Front page](../../screenshots/opus-5.5-ultracode-2026-09-29_1422-frontpage.png)

**Blog post:** a bar with "All posts" and the date, a hero with title and subheading over the post's image, then a narrow text column with headings and lists, a wider captioned image, and a pull quote with an indigo left border.

![Blog post](../../screenshots/opus-5.5-ultracode-2026-09-29_1422-blogpost.png)
