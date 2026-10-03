# Grade — 2026-10-03_1157_mcp_gpt-6-sol-high

**GPT-6-Sol (high), MCP test — 90 / 100** · graded by Opus 5.5 (high)

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 17 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 8 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **90** | **100** |

## Summary

GPT-6-Sol built "MCP Journal" with a clean, convention-perfect Razor/ViewComponent pipeline and a polished Tailwind design: a hero plus two image cards on the front page, and two published MCP posts. The content model is thin: there are no rich text or image blocks, and the listing is hand-maintained post cards with hard-coded URLs instead of reading post properties (no dates or excerpts on `blogPost`).

## Issues

- **major**: The front-page listing is hand-built `postCardBlock` content that duplicates each post's title, summary and image. The post URL is hard-coded in a TextBox `link` (snapshot.json: *MCP Journal* → `blocks`). `blogPost` has no date, excerpt or listing-image properties, so new or renamed posts aren't reflected.
- **major**: The block set is thin. There is no rich text block: `textBlock.body` is a plain TextArea split on `\n` in `Views/Shared/Components/Text/Default.cshtml`. There is also no image block, so posts can't carry inline images, links or lists.
- **minor**: Posts have no inline images. The only image is a 45%-opacity hero background reused from the listing card (`/why-mcp-turns-useful-context-into-useful-work/`).
- **minor**: There are no publish dates anywhere.

## Strengths

- Block rendering follows the scaffold exactly: `GetBlockGridHtmlAsync`, markup-free adapters, one ViewComponent per block, and plain models in `Models/Blocks/`.
- The build is clean, all 43 checks pass, the `/` domain is set, everything is published, and the provided Unsplash photos are imported and served via `GetCropUrl`.
- An accurate final report; schema and content were built only through MCP, in the right order.

## What it built

- **Document types:** `siteRoot` (Repositories, scaffold) → `blogHome` (Pages, template `blogHome`, domain `/`) → `blogPost` (Pages, template `blogPost`). Both pages have a single `blocks` property on the custom **Blog Block Grid** data type (`Custom/Umbraco.BlockGrid`).
- **Blocks (Blocks folder, elements):** `heroBlock` (eyebrow, heading, introduction, image), `textBlock` (heading, body as a TextArea), `postCardBlock` (heading, summary, image, link as a TextBox).
- **Code:** 3 adapters in `Views/Partials/blockgrid/Components/`, 3 ViewComponents (`Hero`, `PostCard`, `Text`), plain models in `Models/Blocks/`, `_Layout.cshtml` with a header and a credits footer, and block grid layout CSS in `src/site.css`.
- **Pages:** `/` is MCP Journal (a hero plus 2 post cards). There are two posts: `/why-mcp-turns-useful-context-into-useful-work/` and `/why-mcp-makes-integrations-easier-to-grow/`. Each is a hero plus 3 headed text sections.
- **Media:** 3 provided Unsplash photos in an "MCP Journal" media folder.

The front page has a dark hero over a network photo, then two white cards with image, "Read the story" label, title, excerpt and an "Explore article →" link. Each post is a dark hero over its photo, followed by a centred readable text column.

![Front page](../../screenshots/gpt-6-sol-high-2026-10-03_1157-frontpage.png)

![Blog post](../../screenshots/gpt-6-sol-high-2026-10-03_1157-blogpost.png)
