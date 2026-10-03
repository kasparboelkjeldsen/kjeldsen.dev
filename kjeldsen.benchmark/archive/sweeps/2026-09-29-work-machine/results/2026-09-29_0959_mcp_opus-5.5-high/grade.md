# Grade: 2026-09-29_0959_mcp_opus-5.5-high

**97 / 100** · test: MCP · graded by Fable 5.1 on 2026-09-29

Run: 7:33 total (blog prompt 7:10), 42 requests, 87 tool calls (34 Umbraco MCP, 1 failed shell call), 164,228 tokens excluding cache reads.

## Summary

A complete, working blog built through the Umbraco MCP server: a front page with hero and post list, and two published posts composed of hero, rich text and image blocks, rendered through the prescribed adapter > ViewComponent pipeline with a clean Tailwind design. The only real flaws are small: query logic in the post list adapter, no alt text property on the image block, and posts that are on the short side.

## Scores

| Category | Score | Max |
|---|---|---|
| It works | 35 | 35 |
| Content modeling | 24 | 25 |
| Code architecture & conventions | 24 | 25 |
| Content & presentation | 9 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **97** | **100** |

### It works (35/35)

- `dotnet build`: 0 errors, 0 warnings (5/5).
- `/` returns 200 and is the blog front page. Both cards show image, date, title, teaser and a link, and both links resolve (10/10).
- Both posts render every block, with no "Could not render component" or exception text (10/10).
- 6 Unsplash images imported into the media folder `Blog`, served through signed `GetCropUrl` URLs; 7/7 image requests load and none are hot-linked (5/5).
- Domain `/` is set on the Blog page under WWW, and all 4 documents are published (5/5).

### Content modeling (24/25)

- Folders 8/8: 4 element types in Blocks, `blogFrontPage` and `blogPost` in Pages, `siteRoot` in Repositories.
- Block set 6/7: hero, rich text, image and post list are reusable and sensible. `imageBlock` has no alt text property, and no block has settings.
- Structure 5/5: `siteRoot` is the only root type, `siteRoot` > `blogFrontPage` > `blogPost`, templates assigned with a shared `layout` master, camelCase aliases, block grid data types in `/Custom/Umbraco.BlockGrid`.
- Hygiene 5/5: no compositions; `publishDate`, `teaser` and `thumbnail` are real properties; nothing orphaned or duplicated.

### Code architecture & conventions (24/25)

- Pages 7/7: both page views call `Html.GetBlockGridHtmlAsync(Model, "blocks")`; the scaffold's `Views/Partials/blockgrid/*.cshtml` are unchanged.
- Adapters 5/6: four alias-named adapters with no markup, but `blogPostListBlock.cshtml` does the content query itself.
- ViewComponents 7/7: one per block, default view lookup, plain models in `Models/Blocks/`, component views free of Umbraco types.
- Conventions 5/5: `Program.cs` untouched, no migrations, friendly extensions and `GetCropUrl`, Tailwind pipeline used.

The automated check `code.appsettingsJsonUnchanged` fails, but it is a false positive. The only change to `appsettings.json` is the `Imaging:HMACSecretKey` that Umbraco writes on first boot, and the transcript shows no edit of that file by the model.

### Content & presentation (9/10)

- Content 5/6: both posts are on topic and accurate, spread over 4 and 5 blocks, but short (about 300 words each) with generic stock imagery.
- Presentation 4/4: coherent design, proper card listing, readable post pages.

### Process & honesty (5/5)

- Channel 3/3: 34 MCP calls (24 writes) and nothing through the Management API, uSync, the database, a browser or migrations. Razor was written after Umbraco was stopped. No memory access and no reads outside the project.
- Report 2/2: accurate, and it discloses its own limitations.

## Issues

| Severity | Issue | Where |
|---|---|---|
| minor | The post list adapter does the content query and reads `UmbracoContext.PublishedRequest` instead of only mapping, so the block depends on the page being requested. Disclosed in the report. | `Umbraco.Bench.Umbraco/Views/Partials/blockgrid/Components/blogPostListBlock.cshtml` |
| minor | `imageBlock` has no alt text property; the adapter falls back to the caption or the media name. | `Umbraco.Bench.Umbraco/Views/Partials/blockgrid/Components/imageBlock.cshtml` |
| minor | Both posts are short, about 300 words each, with generic tech stock photos. | `/one-protocol-to-connect-them-all/`, `/this-blog-was-built-by-an-agent/` |
| minor | The site name in the header and title suffix is the front page's node name "Blog", not a site name property. Disclosed in the report. | `Umbraco.Bench.Umbraco/Views/layout.cshtml` |
| minor | `code.appsettingsJsonUnchanged` fails as a false positive (Umbraco's own HMAC key). No points deducted. | `Umbraco.Bench.Umbraco/appsettings.json` |

## What it built

**Document types**

| Type | Folder | Kind | Properties |
|---|---|---|---|
| `siteRoot` | Repositories | document | none; allows `blogFrontPage` |
| `blogFrontPage` | Pages | document | `blocks` (block grid); allows `blogPost` |
| `blogPost` | Pages | document | `blocks` (block grid), `publishDate`, `teaser`, `thumbnail` |
| `heroBlock` | Blocks | element | `heading`, `intro`, `backgroundImage` |
| `richTextBlock` | Blocks | element | `text` |
| `imageBlock` | Blocks | element | `image`, `caption` |
| `blogPostListBlock` | Blocks | element | `heading` |

**Data types:** `Block Grid - Blog Front Page` (all four blocks) and `Block Grid - Blog Post` (hero, rich text, image), both 12 columns, with 12 and 6 column spans for rich text and image.

**Templates:** `layout` (master), `blogFrontPage`, `blogPost`.

**Content:** WWW > Blog (domain `/`) > "One Protocol to Connect Them All" (15 September 2026) and "This Blog Was Built by an Agent" (29 September 2026). Six Unsplash images in the media folder `Blog`.

**Code:** four adapters in `Views/Partials/blockgrid/Components/`, four ViewComponents in `ViewComponents/`, five plain models in `Models/Blocks/`, component views in `Views/Shared/Components/<Name>/Default.cshtml`, and block grid layout plus rich text styles added to `Umbraco.Bench.Frontend/src/site.css`.

**Front page:** a header with the site name, a dark hero with a circuit board photo ("The MCP Blog"), and a "Latest posts" section with two cards side by side, newest first. Each card has an image, date, title, teaser and a "Read post" link.

![Front page](../../screenshots/opus-5.5-high-2026-09-29_0959-frontpage.png)

**Blog post:** a back link and date, a hero with the title and intro, then rich text sections in a narrow reading column, a full-width image with caption, and a closing blockquote. The second post also places an image and text side by side in a 6/6 split.

![Blog post](../../screenshots/opus-5.5-high-2026-09-29_0959-blogpost.png)
