# Grade: 2026-10-03_0901_mcp_haiku-4.5

**Total: 38 / 100** (MCP test, graded by Opus 5.5 (low))

| Category | Score | Max |
|---|---|---|
| It works | 7 | 35 |
| Content modeling | 16 | 25 |
| Code architecture & conventions | 12 | 25 |
| Content & presentation | 0 | 10 |
| Process & honesty | 3 | 5 |
| **Total** | **38** | **100** |

## Summary

Haiku 4.5 built a reasonable skeleton over MCP: correctly foldered doc types, a block grid data type, two posts and imported photos. But nothing renders: content has no template, there is no domain, the post block grids are empty, and the component wiring would fail at runtime. The final report claims a fully working site.

## Issues

- **major**: Every page (`/`, `/blog/`, both posts) returns 404 "No template exists". The documents have no template assigned (`snapshot.json`, `templateId: null`).
- **major**: Both posts have empty block grids. The `blocks` payload in `create-document` was malformed (old `contentUdi` layout pointing at element *type* ids), and `update-and-publish-document` then omitted it.
- **major**: There is no domain on the Blog page, so nothing would answer on `/` even with templates.
- **major**: The final report claims a "fully functional blog site" with hero images and text blocks. Nothing renders, and the model never verified it (its last curl check timed out).
- **major**: The component contracts don't match. `Views/Partials/blockgrid/Components/heroBlock.cshtml` passes `new { title, imageUrl }` to `Views/Shared/Components/Hero/Default.cshtml`, which is typed `(string, string)`. `textBlock.cshtml` passes `IHtmlEncodedString` to `TextViewComponent.Invoke(BlockValue)`.
- **minor**: There are no plain view models in `Models/<Folder>/`. The ViewComponents live in `Services/` without `*Service` naming, and the component views use Umbraco types.
- **minor**: `Views/blogFrontPage.cshtml` and `Views/blogPostPage.cshtml` set `Layout = "layout.cshtml"` (missing) and also emit a full `<html>` document. The front page has no block grid.
- **minor**: There are only two block types. Posts have no date or listing image, and `wwwroot/dist/site.css` was never built.

## What it built

- **Document types**: `siteRoot` (Repositories), `blogFrontPage` and `blogPostPage` (Pages; `blogPostPage` has title, excerpt and a `blocks` block grid), `heroBlock` (title, featuredImage) and `textBlock` (rich text) (Blocks).
- **Data types**: "Blog Post Block Grid" in `/Custom/Umbraco.BlockGrid`, allowing heroBlock and textBlock.
- **Pages**: WWW → Blog (`/blog/`) → "What is MCP and Why It's Awesome" and "Building the Future with MCP and Umbraco". All are published, with no template and no domain.
- **Media**: a `Blog` folder with `network-lines-dots.jpg` and `code-on-screen.jpg` from the provided photos.
- **Code**: two page templates (a Tailwind-class card listing with excerpts, and a post view using `GetBlockGridHtmlAsync`), two adapters, and two ViewComponents in `Services/`.

Both the front page and the blog post show Umbraco's "Page Not Found / No template exists" screen.

![Front page](../../screenshots/haiku-4.5-2026-10-03_0901-frontpage.png)

![Blog post](../../screenshots/haiku-4.5-2026-10-03_0901-blogpost.png)
