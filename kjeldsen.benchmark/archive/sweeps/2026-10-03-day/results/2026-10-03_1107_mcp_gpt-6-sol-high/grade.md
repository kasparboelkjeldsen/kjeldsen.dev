# Grade: 2026-10-03_1107_mcp_gpt-6-sol-high

**GPT-6-Sol (high), MCP test. Total 91.5 / 100.** Graded by Opus 5.5 (high).

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 19.5 | 25 |
| Code architecture & conventions | 24.5 | 25 |
| Content & presentation | 8 | 10 |
| Process & honesty | 4.5 | 5 |
| **Total** | **91.5** | **100** |

## Summary

A clean, polished "MCP Journal" blog built through the Umbraco MCP server. The session exposed no MCP tools, so the model drove the project's configured server over stdio. The site has a hero/article/post-feed block grid, two published MCP posts using the provided Unsplash photos, and a textbook adapter → ViewComponent pipeline. The weak spot is modeling: each post is just a hero plus one rich-text article block, there are no date or excerpt properties, and the listing cards are scraped from each post's first block.

## What it built

- **Document types:** `blogFrontPage` and `blogPostPage` (Pages); `heroBlock`, `articleBlock` and `postFeedBlock` (Blocks, elements). `siteRoot` → `blogFrontPage` → `blogPostPage`. Templates are assigned.
- **Data type:** "Blog Blocks" (block grid, 12 columns) in `Custom/Umbraco.BlockGrid`. Both pages use it as their only property, `blocks`.
- **Blocks:**
  - hero: kicker, heading, summary, image, image credit
  - article: heading and rich-text body
  - post feed: heading and intro; it lists the front page's children
- **Pages:**
  - `/`: "MCP Journal", with the `/` domain. Hero + post feed.
  - `/mcp-makes-context-useful/`: hero + article.
  - `/one-protocol-many-possibilities/`: hero + article.
- **Media:** 3 provided photos (network lines, code on screen, puzzle hands) in an "MCP Journal" media folder.
- **Code:**
  - 3 adapters in `Views/Partials/blockgrid/Components/`
  - 3 ViewComponents in `ViewComponents/BlockViewComponents.cs`
  - plain models in `Models/Blocks/BlockModels.cs`
  - views in `Views/Shared/Components/{Hero,Article,PostFeed}/Default.cshtml`
  - Tailwind built to `wwwroot/dist/site.css`
- **Look:**
  - Front page: a dark navy hero with a teal accent and a rounded image with credit, then a "Latest stories" section with two large image cards (kicker, title, summary, "Read story →").
  - Post pages: the same hero style with the post's title and photo, then a narrow, readable article column with subheadings and back links.

![Front page](../../screenshots/gpt-6-sol-high-2026-10-03_1107-frontpage.png)

![Blog post](../../screenshots/gpt-6-sol-high-2026-10-03_1107-blogpost.png)

## Issues

- **major:** The block model is weak. Each post is a hero plus a single `articleBlock` (heading + RTE) holding the whole body, and there is no standalone image or text block in "Blog Blocks".
- **major:** `blogPostPage` has no metadata properties (no date, excerpt or listing image). Cards are scraped from the post's first block in `Views/Partials/blockgrid/Components/postFeedBlock.cshtml` (`post.Blocks?.FirstOrDefault()?.Content as HeroBlock`). They break silently if blocks are reordered, and no date is shown anywhere.
- **minor:** The posts are short (~250 words each) and partly self-referential about the demo, with one image each.
- **minor:** The HTML shell is duplicated in `Views/blogFrontPage.cshtml` and `Views/blogPostPage.cshtml`; there is no shared layout.
- **minor:** There was one direct Management API shell call (a read-only `GET /umbraco/management/api/v1/server/information` probe). MCP writes went through a temporary Python stdio client (`.mcp_blog.py`, deleted afterwards), so `channel` shows 0 MCP calls even though the configured Umbraco MCP server made every schema and content write. The model disclosed this in its prompt-1 answer.

## Category notes

- **It works (35/35):** The build is clean. `/` is served by the domain and lists both posts with image cards. Both posts render fully. The images are the provided photos, served through signed `GetCropUrl` URLs. Everything is published.
- **Content modeling (19.5/25):**
  - Folders: 8/8
  - Block grid: 4/7 (thin block set, one RTE block per post)
  - Structure: 5/5
  - Hygiene: 2.5/5 (no metadata properties; listing data comes from blocks)
- **Architecture (24.5/25):** The pipeline matches AGENTS.md exactly. −0.5 for the duplicated page shell.
- **Content & presentation (8/10):** Content 4/6 (on-topic and accurate but short, with 2 blocks per post). Presentation 4/4.
- **Process & honesty (4.5/5):**
  - Channel: genuinely the Umbraco MCP server, driven over stdio because the session had no MCP tools.
  - Order: correct (model → content → restart → Razor).
  - −0.5 for the Management API probe and the writes being invisible to the harness.
  - The final report is accurate.
