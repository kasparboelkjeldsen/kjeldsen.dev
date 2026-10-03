# Grade: 2026-10-03_1258_mcp_gpt-5.6-sol-high

**GPT-5.6-Sol (high), MCP test: 92 / 100**. Graded by Opus 5.5 (high).

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 19 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 8 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **92** | **100** |

## Summary

A polished MCP-built blog ("MCP Field Notes"). It has a front page with a hero and a post listing, two substantive posts, and a textbook adapter → ViewComponent architecture, and everything works. The weak point is the content model: each post is a hero plus one rich-text block, there is no image block, and there are no real date, excerpt or listing-image properties.

## Issues

- **major**: Each post is a `heroBlock` plus one `richTextBlock` that holds the whole article. The headings, blockquote and list all sit inside the rich text editor, and there is no image or quote block. See the `Blog Block Grid` data type and the pages `/why-mcp-makes-software-feel-alive/` and `/local-mcp-is-a-developer-superpower/`.
- **major**: `blogPostPage` has no date, excerpt or listing-image properties. The card's excerpt and image come from the post's first `heroBlock`, and the date is `CreateDate` (`Views/Partials/blockgrid/Components/blogPostListBlock.cshtml`).
- **minor**: Each post has only one image (the hero), and the copy leans self-referential ("this site was built through MCP").

## Strengths

- All 43 automated checks pass, and the build is clean with 0 warnings.
- `GetBlockGridHtmlAsync` → markup-free adapters → ViewComponents with plain models (`Models/Blocks`, `Models/Blog`).
- The provided Unsplash photos were imported into the `MCP Blog` media folder and are served through signed `GetCropUrl` URLs.
- Schema, media and content were built strictly through MCP, and the final report is accurate.

## What it built

- **Document types:** `siteRoot` (Repositories) → `blogHomePage` (Pages) → `blogPostPage` (Pages). Both page types have a single `blocks` Block Grid property.
- **Blocks (in Blocks):** `heroBlock` (eyebrow, heading, introduction, image, alt text, credit), `richTextBlock` (body), `blogPostListBlock` (heading, introduction).
- **Data types:** `Blog Block Grid` in `/Custom/Umbraco.BlockGrid`.
- **Pages:** `MCP Field Notes` at `/` (domain `/`, en-US), with *Why MCP Makes Software Feel Alive* and *Local MCP Is a Developer Superpower* beneath it.
- **Code:** 3 adapters, 3 ViewComponents (Hero, RichText, BlogPostList), 3 plain models, Tailwind styling, and an updated `_Layout.cshtml` with a header and footer.

**Front page:** a dark hero with a tilted, framed network photo and its credit, then "Latest field notes": two cards, each with an image, a date, the title, an excerpt and a "Read field note" link.

![Front page](../../screenshots/gpt-5.6-sol-high-2026-10-03_1258-frontpage.png)

**Blog post:** the same dark hero with the post's photo, then a centred, readable column with h2 sections and a styled blockquote, all from one rich-text block.

![Blog post](../../screenshots/gpt-5.6-sol-high-2026-10-03_1258-blogpost.png)
