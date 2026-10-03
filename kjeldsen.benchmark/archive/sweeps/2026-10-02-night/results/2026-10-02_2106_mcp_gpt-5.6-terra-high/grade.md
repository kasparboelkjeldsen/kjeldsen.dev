# Grade — 2026-10-02_2106_mcp_gpt-5.6-terra-high

**Test:** MCP · **Model:** GPT-5.6-Terra (high) · **Grader:** Opus 5.5 (low) · **Total: 84 / 100**

| Category | Score | Max |
|---|---:|---:|
| It works | 32 | 35 |
| Content modeling | 17 | 25 |
| Code architecture & conventions | 24 | 25 |
| Content & presentation | 6 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **84** | **100** |

## Summary

A clean MCP-built blog with a textbook block rendering pipeline (page → `GetBlockGridHtmlAsync` → adapter → ViewComponent) and a tidy dark Tailwind design. The content model is thin: each post is one monolithic `articleBlock` with three short paragraphs, there is no date/excerpt/listing-image metadata, and the front-page cards are title-only.

## Issues

- **major**: A monolithic `articleBlock` (heading + intro + image + rich text) holds each entire post, and there are no reusable rich text or image blocks (`articleBlock` doc type, `Views/Partials/blockgrid/Components/articleBlock.cshtml`).
- **major**: Posts have no metadata properties (date, excerpt, listing image), so the front-page cards show only the title (`blogPost` doc type, `Views/Shared/Components/PostListing/Default.cshtml`, `/`).
- **minor**: The posts are short (an intro plus 3 brief paragraphs each), and the second is partly about how this blog was built (`/mcp-makes-a-content-workflow-inspectable/`).
- **minor**: There is no shared layout. `blogFrontPage.cshtml` and `blogPost.cshtml` each duplicate the full HTML shell with `Layout = null`, and the section labels are hard-coded in the component views.

## Strengths

- The block rendering pipeline follows the convention exactly, and all 42 automated checks pass.
- Schema, media, content and domain were built purely via MCP in the correct order, with Razor written after a rebuild and restart.
- The provided Unsplash photos were imported into a `Blog` media folder and are served via signed `GetCropUrl` URLs.
- The build is clean with zero warnings, and the dark design is coherent and readable.

## What it built

- **Document types:** `siteRoot` (Repositories, scaffold) → `blogFrontPage` (Pages, template `blogFrontPage`) → `blogPost` (Pages, template `blogPost`). Both pages have a single `blocks` property using the custom `Blog blocks` block grid data type (`/Custom/Umbraco.BlockGrid`).
- **Blocks:** `articleBlock` (heading, intro, image, rich text body) and `postListingBlock` (heading, intro; lists the children of the current page). Each has an adapter, a ViewComponent (`Article`, `PostListing`) and a plain model in `Models/Blocks/`.
- **Pages:** "MCP Notes" at `/` (domain `/`), with two posts: `/mcp-turns-tools-into-useful-context/` and `/mcp-makes-a-content-workflow-inspectable/`.
- **Media:** two of the provided Unsplash photos (Alina Grubnyak's "connected structure" and Conny Schneider's "network lines and dots") in a `Blog` media folder.
- **Look:** a dark slate/cyan Tailwind theme. The front page has a header bar, an eyebrow and title, an intro line, and two bordered cards that show only "Read field note →" and the post title. Post pages have a back link, an eyebrow, a large H1 and intro, a 16:9 hero image with a caption, and three paragraphs of body text.

![Front page](../../screenshots/gpt-5.6-terra-high-2026-10-02_2106-frontpage.png)

![Blog post](../../screenshots/gpt-5.6-terra-high-2026-10-02_2106-blogpost.png)
