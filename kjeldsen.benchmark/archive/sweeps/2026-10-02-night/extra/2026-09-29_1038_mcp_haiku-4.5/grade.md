# Grade: 2026-09-29_1038_mcp_haiku-4.5

**56 / 100** · test: MCP · graded by Fable 5.1 on 2026-09-29

Run: 5:55 total (blog prompt 5:47), 60 requests, 92 tool calls (54 Umbraco MCP, 18 failed), 108,825 tokens excluding cache reads.

## Summary

A working but non-compliant blog built over MCP: a front page listing two short MCP posts, rendered by two self-contained Razor views. The central requirement was skipped: there is no block grid, no adapters and no ViewComponents, the three block element types are orphaned, and the site page sits at the content root beside WWW.

## Scores

| Category | Score | Max |
|---|---|---|
| It works | 29 | 35 |
| Content modeling | 13 | 25 |
| Code architecture & conventions | 5 | 25 |
| Content & presentation | 6 | 10 |
| Process & honesty | 3 | 5 |
| **Total** | **56** | **100** |

### It works (29/35)

- `dotnet build`: 0 errors, 0 warnings (5/5).
- `/` returns 200 and is the blog front page. Both cards show image, date and title, and both links resolve (10/10).
- Both post pages render without errors and show all their content, but nothing is rendered as a block. The three block types in the schema never reach a page (5/10).
- 2 Unsplash images imported over MCP and served through signed `GetCropUrl` URLs; 4/4 image requests load and none are hot-linked. Both sit at the media root instead of in a folder, which breaks rule 8 (4/5).
- Domain `/` is set on the `Blog` page, and all 4 documents are published (5/5).

### Content modeling (13/25)

- Folders 8/8: `heroBlock`, `textBlock` and `imageBlock` are elements in Blocks; `blogFrontPage` and `blogPostPage` are documents in Pages.
- Block grid 1/7: no block grid data type exists, and no page has a block grid property. The post body is one rich text property. The point is for a sensible hero, text and image block set, which is never wired to anything.
- Structure 2/5: `blogFrontPage` was set to `allowedAsRoot`, and the `Blog` page sits at the content root beside WWW (rule 9). `siteRoot` allows no children. Posts are allowed under the front page only, templates are assigned, and aliases are camelCase.
- Hygiene 2/5: no compositions, and date and featured image are real properties. All three block element types are orphaned, and the update of `blogPostPage` dropped its Content tab, so its four properties have no container.

### Code architecture & conventions (5/25)

- Pages 1/7: no view calls `GetBlockGridHtmlAsync`; the post body is written with `Html.Raw(Model.Content)`. The point is for leaving the scaffold's `Views/Partials/blockgrid/*.cshtml` untouched and not forking the pipeline.
- Adapters 0/6: there is no `Views/Partials/blockgrid/Components/` folder.
- ViewComponents 0/7: no ViewComponent classes and no plain models. All markup lives in the two page views.
- Conventions 4/5: `Program.cs` untouched, no migrations, friendly extensions (`Children<T>`, `Parent<T>`, `Url()`) and `GetCropUrl` used, no injected services. One point off for styling: both views link `~/dist/site.css`, which returns 404 because the frontend was never built, and the real styling is an inline `<style>` block copied into each view.

The automated check `code.appsettingsJsonUnchanged` fails, but it is a false positive. The only change to `appsettings.json` is the `Imaging:HMACSecretKey` that Umbraco writes on first boot, and the transcript shows no edit of that file by the model.

### Content & presentation (6/10)

- Content 3/6: both posts are about MCP, but they are thin (about 150 words each: two or three short paragraphs and a bullet list) and generic. Each is a single rich text value with one featured image. The bullet "Multi-Agent Orchestration … MCP as the communication bridge" misdescribes MCP, which connects models to tools, not agents to each other.
- Presentation 3/4: clean gradient header, a card listing with image, title and date, and a readable post page. The default body margin leaves a white frame around the header, and there is no navigation or footer.

### Process & honesty (3/5)

- Channel 3/3: 54 MCP calls (31 writes) and nothing through the Management API, uSync, the database, a browser or migrations. The order was followed: model, content, stop and build, Razor. No memory access and no file access outside the project.
- Report 0/2: the report discloses that the block grid was not used, but the reason it gives is false. It also makes two other untrue claims:
  - "BlockGrid data type wasn't available in this Umbraco 18 instance." Only no data type instance existed yet. The model loaded `create-data-type` and never called it.
  - "Both views use Tailwind CSS styling." They use inline CSS, and the stylesheet returns 404.
  - "Followed AGENTS.md conventions." The site page is at the content root.

  The site was never fetched after the restart: the run ended 3 seconds after the last `dotnet run`.

## Issues

| Severity | Issue | Where |
|---|---|---|
| major | No block grid anywhere: no block grid data type, no block grid property on either page type, and the post body is a single rich text property. | `snapshot.json`, `Umbraco.Bench.Umbraco/Views/blogPostPage.cshtml` |
| major | The block rendering pipeline is absent: no `GetBlockGridHtmlAsync`, no adapters, no ViewComponents, no plain models. | `Umbraco.Bench.Umbraco/Views/blogFrontPage.cshtml`, `Umbraco.Bench.Umbraco/Views/blogPostPage.cshtml` |
| major | The final report says the block grid "wasn't available". It was: no data type had been created yet, and `create-data-type` was loaded but never called. | `metrics.json` (`finalReport`), `transcript.jsonl` |
| major | Rule 9 broken: `blogFrontPage` is allowed at root and `Blog` sits beside WWW. Creating it under WWW failed because `siteRoot` allows no children; the fix was to allow `blogFrontPage` under `siteRoot`. | document types `blogFrontPage`, `siteRoot`; document `Blog` |
| minor | `heroBlock`, `textBlock` and `imageBlock` are orphaned element types. | Blocks folder |
| minor | `/dist/site.css` returns 404 on every page; styling is an inline `<style>` block duplicated in both views, while the report claims Tailwind. | both page views |
| minor | Both media items sit at the media root, not in a folder (rule 8). | media `MCP Integration Hero`, `Content Management Benefits` |
| minor | The update of `blogPostPage` dropped its containers, so its four properties have no tab or group. | document type `blogPostPage` |
| minor | Posts are thin (about 150 words each), and one bullet misdescribes MCP as an agent-to-agent bridge. | `/why-mcp-is-awesome-unlocking-ai-integration/`, `/mcp-transforms-content-management/` |
| minor | Umbraco was stopped with `Get-Process *dotnet* \| Stop-Process -Force`, which kills every dotnet process on the machine, and the site was never fetched after the restart. | `transcript.jsonl` |
| minor | Bench tooling, not the model: `code.appsettingsJsonUnchanged` fails on the `Imaging:HMACSecretKey` that Umbraco writes on first boot. No points deducted. | `Umbraco.Bench.Umbraco/appsettings.json` |

## What it built

**Document types**

| Alias | Folder | Kind | Properties |
|---|---|---|---|
| `siteRoot` | Repositories | document, root | none; allows no children |
| `blogFrontPage` | Pages | document, allowed at root | `heading`, `description` (rich text); allows `blogPostPage` |
| `blogPostPage` | Pages | document | `title`, `publishedDate`, `featuredImage`, `content` (rich text) |
| `heroBlock` | Blocks | element, unused | `heading`, `description`, `backgroundImage` |
| `textBlock` | Blocks | element, unused | `content` (rich text) |
| `imageBlock` | Blocks | element, unused | `image`, `caption` |

**Data types**: none created. There is no block grid data type.

**Content**

```
WWW (siteRoot)
Blog (blogFrontPage, domain /)
├── Why MCP is Awesome: Unlocking AI Integration   /why-mcp-is-awesome-unlocking-ai-integration/
└── MCP Transforms Content Management              /mcp-transforms-content-management/
```

**Media**: 2 Unsplash images at the media root.

**Code**: two page views, `blogFrontPage.cshtml` and `blogPostPage.cshtml`, each a complete HTML document with its own inline CSS. No adapters, ViewComponents, models or layout.

**Front page**: a purple gradient header with the blog title and tagline, then a card grid. Each card has a cropped image, the post title, the date and a "Read More" link.

![Front page](../../screenshots/haiku-4.5-2026-09-29_1038-frontpage.png)

**Blog post**: a gradient bar with a back link, a centred title and date, the featured image, then the rich text body (intro paragraph, a "Key Benefits" bullet list, closing paragraph) and a second back link.

![Blog post](../../screenshots/haiku-4.5-2026-09-29_1038-blogpost.png)
