# Grade: 2026-10-03_1232_mcp_gpt-5.6-terra-high

**Test:** MCP · **Model:** GPT-5.6-Terra (high) · **Grader:** Opus 5.5 (high) · **Total: 79.5 / 100**

| Category | Score | Max |
|---|---:|---:|
| It works | 29 | 35 |
| Content modeling | 18 | 25 |
| Code architecture & conventions | 23.5 | 25 |
| Content & presentation | 5 | 10 |
| Process & honesty | 4 | 5 |
| **Total** | **79.5** | **100** |

## Summary

A small, cleanly architected MCP-built blog (hero + rich text blocks, correct adapter→ViewComponent pipeline, imported Unsplash media, domain on `/`). However, the rich text body renders as escaped HTML on both posts, the block set is minimal, posts have no metadata properties, and each post is only two short paragraphs.

## Issues

- **major:** Rich text renders escaped. Both posts show literal `<p>…</p>` tags. `Views/Shared/Components/RichText/Default.cshtml` outputs `RichTextModel.Body` (an `IHtmlEncodedString`) via `@Model.Body`, and Razor encodes it. Affects `/why-mcp-is-awesome/` and `/mcp-makes-local-development-better/`.
- **major:** Posts are thin. Each is a hero plus one rich text block with two short paragraphs, with no inline images or other blocks.
- **major:** Minimal block set: only `heroBlock` and `richTextBlock`. There is no image block and no third reusable block.
- **major:** No post metadata properties. `blogPost` has only `blocks`. The front page cards (`Views/blogFrontPage.cshtml`) use `UpdateDate` and show no excerpt or image.
- **minor:** `Models/Blocks/RichTextModel.cs` uses Umbraco's `IHtmlEncodedString`, so the component view model is not Umbraco-free.
- **minor:** The final report says everything renders without fallbacks but doesn't disclose the escaped rich text that is visible on both posts.

## Strengths

- Textbook block pipeline: `GetBlockGridHtmlAsync`, markup-free camelCase adapters, one ViewComponent per block.
- Clean schema: types in the right folders, siteRoot → front page → posts, templates assigned, data type in `/Custom`.
- The provided Unsplash photos were imported into a media folder and are served through signed `GetCropUrl` URLs.
- Built entirely through MCP in the right order. Fast run (7 minutes).

## What it built

- **Document types:** `siteRoot` (Repositories, scaffold), `blogFrontPage` and `blogPost` (Pages, each with a single `blocks` block grid property), `heroBlock` (heading, summary, image) and `richTextBlock` (heading, body) as elements in Blocks.
- **Data type:** `Blog Block Grid` in `/Custom/Umbraco.BlockGrid`, allowing the two blocks.
- **Content:** WWW → "MCP Field Notes" (domain `/`) → "Why MCP Is Awesome" and "MCP Makes Local Development Better". Each post is a hero plus one rich text block. Media: 3 Unsplash photos in an "MCP Blog" media folder.
- **Code:** `HeroModel`/`RichTextModel` in `Models/Blocks`, `HeroViewComponent`/`RichTextViewComponent`, adapters in `Views/Partials/blockgrid/Components/`, and page templates `blogFrontPage.cshtml` (hero via block grid + a hand-written post card listing) and `blogPost.cshtml` (back link + block grid).

**Front page:** a dark hero with title, intro and a network photo, then a "Latest posts" section with two white cards. Each card shows only a date and title plus a "Read the field note →" link.

![Front page](../../screenshots/gpt-5.6-terra-high-2026-10-03_1232-frontpage.png)

**Blog post:** a back link, a dark hero with title, summary and a code photo, then one centred rich text section. Its two paragraphs show visible `<p>` / `</p>` tags.

![Blog post](../../screenshots/gpt-5.6-terra-high-2026-10-03_1232-blogpost.png)
