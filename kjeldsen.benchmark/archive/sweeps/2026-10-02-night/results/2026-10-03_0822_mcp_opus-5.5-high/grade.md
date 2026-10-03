# Grade: 2026-10-03_0822_mcp_opus-5.5-high

**Test:** MCP · **Model:** Opus 5.5 (high) · **Grader:** Opus 5.5 (high) · **Total: 99 / 100**

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 25 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 10 | 10 |
| Process & honesty | 4 | 5 |
| **Total** | **99** | **100** |

## Summary

A complete, polished blog built through MCP. It has 5 reusable blocks, a proper page/block/composition model, a textbook adapter→ViewComponent pipeline, a Tailwind design and two substantive, accurate posts about MCP. The only blemish is a small stray outside the project folder (temp files from its own verification).

## Issues

- **minor**: It wrote verification output outside the project: curl output in `/tmp` and headless screenshots in `C:/Users/kaspa/AppData/Local/Temp/front.png` and `post.png`, which it then read back. The `process.stayedInFolder` check fails on these (−1 in Process).
- **minor**: It left `.umbraco-run.log` in the solution root. The final report discloses this, so there is no deduction.

## Strengths

- Clean schema: 5 blocks in Blocks, an SEO-only composition, separate front page and post grids in `/Custom/Umbraco.BlockGrid`, and real `teaser`/`publishDate`/`mainImage` properties.
- Textbook rendering pipeline: `GetBlockGridHtmlAsync` → markup-free adapters → ViewComponents with plain models; the post query lives in `Services/BlogPostService.cs`.
- It noticed and fixed the left-edge focal points that MCP `create-media` sets.
- Correct order of operations: model, then content, then stop Umbraco, then Razor, then build and restart.

## What it built

- **Document types:** `heroBlock`, `richTextBlock`, `imageBlock`, `quoteBlock`, `blogPostListBlock` (elements, Blocks), `seoComposition` (element, Compositions), `blogFrontPage` and `blogPost` (documents, Pages; templates assigned), and `siteRoot` (Repositories; allows `blogFrontPage`).
- **Data types:** "Blog Front Page Grid" and "Blog Post Grid" (block grids in `/Custom/Umbraco.BlockGrid`), with full or half column spans for text and images.
- **Media:** 5 provided Unsplash photos in a "Blog" media folder.
- **Pages:** WWW → Blog (`/`, domain assigned) → "MCP is the USB-C port for AI" and "Your CMS, now with a conversation".
- **Code:** 5 adapters in `Views/Partials/blockgrid/Components/` and 5 ViewComponents with views in `Views/Shared/Components/<Name>/Default.cshtml`. Models are in `Models/Blocks` and `Models/Blog`. The code also adds `BlogPostService` with `BlogComposer`, a shared `_Layout.cshtml` with SEO meta, and Tailwind styles built into `wwwroot/dist/site.css`.

**Front page:** a white header bar and a dark rounded hero with a network image, followed by a "Welcome" rich text section. Below that, "Latest posts" shows two cards, each with an image, date, title, teaser and "Read the post →".

![Front page](../../screenshots/opus-5.5-high-2026-10-03_0822-frontpage.png)

**Blog post:** a "← All posts" link, then the date, a large title and the teaser. Below that comes a wide header image and a narrow prose column with h2s, an inline image with a caption, a bullet list and an indigo-bordered pull quote. The page ends with photo credits.

![Blog post](../../screenshots/opus-5.5-high-2026-10-03_0822-blogpost.png)
