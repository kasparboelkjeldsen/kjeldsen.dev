# Grade: 2026-10-03_0751_mcp_gpt-5.6-sol-high

**GPT-5.6-Sol (high), MCP test: 93 / 100**. Graded by Opus 5.5 (high) on 2026-10-03.

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 20 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 8 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **93** | **100** |

## Summary

A clean, working MCP-built blog. The front page has a hero and a post-listing block, and two published MCP posts use an article-header block plus one rich text block, all rendered through a textbook adapter → ViewComponent pipeline with a polished Tailwind design. The points lost are in content modeling: there is no image block, each post body is a single rich text block, and post metadata lives in a block rather than on the post type.

## Issues

- **major**: Weak block set for posts. There is no image block, and each post body is a single `richTextBlock` holding the whole article (each `blogPost` grid = `articleHeaderBlock` + `richTextBlock`).
- **minor**: Post metadata (`publishedDate`, `summary`, listing image) is stored on `articleHeaderBlock` inside the grid, not on `blogPost`. `Views/Partials/blockgrid/Components/postListingBlock.cshtml` digs into each post's blocks and silently drops posts that have no header block.
- **minor**: The listing heading "Latest writing / Why MCP is awesome" and the "← All field notes" link to `/` are hard-coded in `Views/Shared/Components/PostListing/Default.cshtml` and `ArticleHeader/Default.cshtml`.
- **minor**: The posts are fairly short (4–5 paragraphs) and have one image each.

## Strengths

- Clean block pipeline: `GetBlockGridHtmlAsync`, markup-free adapters, plain models in `Models/Blocks`, thin ViewComponents.
- Everything works: 0 build warnings, all pages return 200, signed crop URLs, a `/` domain, all content published.
- The provided Unsplash photos are imported into a `Blog` media folder, with alt text and credits.
- Strictly MCP-only, in the right order of operations, and the final report is accurate.

## What it built

- **Document types**:
  - Pages: `blogFrontPage` (allowed child `blogPost`), `blogPost`, each with a `blocks` block grid and its own template.
  - Blocks: `blogHeroBlock` (eyebrow, heading, introduction, image, alt, credit), `articleHeaderBlock` (heading, summary, publishedDate, image, alt, credit), `richTextBlock` (body), `postListingBlock` (no properties).
  - Repositories: the scaffold's `siteRoot`.
- **Data types**: one custom type, `Blog Block Grid` (`Custom/Umbraco.BlockGrid`), which allows all four blocks.
- **Pages**: WWW → "MCP Field Notes" (domain `/`) → "MCP turns AI from adviser into collaborator" (`/mcp-turns-ai-from-adviser-into-collaborator/`) and "MCP makes integrations feel native" (`/mcp-makes-integrations-feel-native/`).
- **Code**: 4 adapters, 4 ViewComponents with `Default.cshtml` views, 4 plain models in `Models/Blocks/`, `Views/Shared/_Layout.cshtml`, and Tailwind built to `wwwroot/dist/site.css`.
- **Look**: a dark editorial theme. The front page has a two-column hero (headline + network image), then a "Why MCP is awesome" section with two cards, each with an image, cyan date, title, excerpt and a "Read the field note →" link. A post page has a back link, date, large title, summary, a rounded 16:9 image with credit, and a centred prose column with h2 subheadings.

![Front page](../../screenshots/gpt-5.6-sol-high-2026-10-03_0751-frontpage.png)

![Blog post](../../screenshots/gpt-5.6-sol-high-2026-10-03_0751-blogpost.png)
