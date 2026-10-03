# Grade: 2026-10-03_1011_mcp_fable-5.1-high

**Test:** MCP · **Model:** Fable 5.1 (high) · **Grader:** Opus 5.5 (high)

## Score: 98 / 100

| Category | Score | Max |
|---|---|---|
| It works | 35 | 35 |
| Content modeling | 25 | 25 |
| Code architecture & conventions | 24.5 | 25 |
| Content & presentation | 9 | 10 |
| Process & honesty | 4.5 | 5 |
| **Total** | **98** | **100** |

## Summary

A complete, polished MCP-built blog: 5 reusable blocks on a shared block grid, a hero plus post-list front page, and two published posts with credited Unsplash images. Every check passes (43/43) and the adapter -> ViewComponent pipeline is followed almost exactly.

## Issues

- **minor:** The post-list adapter queries content itself (`UmbracoContext.PublishedRequest.PublishedContent.Children<BlogPost>()`) instead of only mapping the block. See `Views/Partials/blockgrid/Components/blogPostListBlock.cshtml`. The model disclosed this.
- **minor:** Posts are fairly short (about 500 words each). Post 2 (`/building-this-blog-through-mcp-without-opening-the-backoffice/`) is more a build log than a case for MCP.
- **minor:** Verification curl output was written to `/tmp`, outside the project folder.
- **minor:** Image alt text is the media item name (`heroBlock.cshtml`, `imageBlock.cshtml`, `blogPost.cshtml`).
- **minor:** A leftover `umbraco-run.log` sits in `Umbraco.Bench.Umbraco/` (disclosed).

## What it built

- **Document types:** `siteRoot` (Repositories) -> `blogFrontPage` (Pages, `blocks`) -> `blogPost` (Pages: `summary`, `heroImage`, `publishDate`, `author`, `blocks`).
- **Blocks** (elements in Blocks, one 12-column "Blog Block Grid" in `/Custom/Umbraco.BlockGrid`): `heroBlock`, `richTextBlock`, `imageBlock`, `quoteBlock`, `blogPostListBlock`. Each has an adapter in `Views/Partials/blockgrid/Components/`, a plain model in `Models/Blocks/` and a ViewComponent with `Views/Shared/Components/<Name>/Default.cshtml`.
- **Pages:** "Blog" at `/` (domain `/`), "Why MCP is awesome: one protocol, every tool" and "Building this blog through MCP, without opening the backoffice". 5 Unsplash photos are in a "Blog" media folder.
- **Front page:** a white header, then a rounded hero with a darkened network photo and "The MCP Blog" headline, then "Latest posts" as two cards with image, date and author, title, summary and "Read the post →".
- **Post page:** a back link, date and author, a large title and lead, a wide header image, then centred rich text sections, an indigo pull quote, two side-by-side captioned images and more sections.

![Front page](../../screenshots/fable-5.1-high-2026-10-03_1011-frontpage.png)

![Blog post](../../screenshots/fable-5.1-high-2026-10-03_1011-blogpost.png)
