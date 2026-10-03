# Grade: 2026-10-03_1243_mcp_gpt-5.6-luna-high

**Test:** MCP · **Model:** GPT-5.6-Luna (high, Codex) · **Grader:** Opus 5.5 (high) · **Total: 87.5 / 100**

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 17.5 | 25 |
| Code architecture & conventions | 24.5 | 25 |
| Content & presentation | 5.5 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **87.5** | **100** |

## Summary

A working MCP-built blog with a correct, clean block pipeline (3 blocks, adapters, ViewComponents) and a polished Tailwind look. It is held back by a thin content model (no post date/excerpt/image properties, blogPost filed as a Repository Item, no image block) and two very short posts of about two paragraphs each.

## What it built

- **Document types:** `siteRoot` (Repositories, scaffold), `blogFrontPage` (Pages), `blogPost` (**Repository Items**, although it renders), element types `heroBlock`, `richTextBlock`, `blogListingBlock` (Blocks), and `blockSettings` (Data; free-text `backgroundColor`/`spacing`).
- **Data type:** `Blog Block Grid` (/Custom/Umbraco.BlockGrid). Its 3 blocks all share `blockSettings`, and it is used by both page types.
- **Content:** WWW → MCP Blog (domain `/`). The front page has a hero and a blog listing block. Two posts sit under it, each with a hero (title, intro, image) and one rich-text block (an h2, two paragraphs and a photo credit).
- **Media:** 3 provided Unsplash photos in a `Blog Images` folder.
- **Code:** 3 adapters in `Views/Partials/blockgrid/Components/`, 3 ViewComponents, plain models in `Models/Blocks/`, and two standalone page templates calling `GetBlockGridHtmlAsync`.
- **Look:** a dark hero with a rounded image, then a two-card listing with image, title, excerpt and a "Read the note" link. Post pages show a simple header, the dark hero, then a short prose section.

![Front page](../../screenshots/gpt-5.6-luna-high-2026-10-03_1243-frontpage.png)

![Blog post](../../screenshots/gpt-5.6-luna-high-2026-10-03_1243-blogpost.png)

## Issues

- **major:** blogPost has no metadata properties (no date, excerpt or listing image). The listing scrapes `heroIntro`/`heroImage` from the post's hero block and sorts by `UpdateDate` (`Views/Partials/blockgrid/Components/blogListingBlock.cshtml`).
- **major:** Posts are very thin: one hero plus one rich-text block with two short paragraphs each (`/mcp-makes-content-operations-conversational/`, `/mcp-turns-umbraco-into-a-creative-teammate/`).
- **minor:** `blogPost` renders (it has a template) but is filed in `Repository Items` instead of `Pages`.
- **minor:** Weak block set: no standalone image/quote block, so images appear only in heroes.
- **minor:** `blockSettings` values are free-text and only emitted as `data-*` attributes, so they never affect styling.
- **minor:** The hero hard-codes the eyebrow "MCP / Umbraco / Field notes" (`Views/Shared/Components/Hero/Default.cshtml`), and the front page has no site header.
- **minor:** `blogFrontPage.cshtml` and `blogPost.cshtml` each duplicate a full HTML shell instead of sharing a layout.

## Strengths

- Textbook rendering pipeline: `GetBlockGridHtmlAsync` → markup-free adapters → ViewComponents with plain models.
- Clean build (0 warnings), all 43 automated checks pass, domain `/` is assigned and everything is published.
- Provided photos are imported into the media library and served via `GetCropUrl`.
- Built strictly through MCP, with an accurate final report.
