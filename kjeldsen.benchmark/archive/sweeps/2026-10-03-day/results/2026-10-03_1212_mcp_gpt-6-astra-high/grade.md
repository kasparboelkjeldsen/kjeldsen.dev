# Grade: 2026-10-03_1212_mcp_gpt-6-astra-high

**GPT-6-Astra (high), MCP test. Total: 91.5 / 100.** Graded by Opus 5.5 (high).

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 19 | 25 |
| Code architecture & conventions | 24.5 | 25 |
| Content & presentation | 8 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **91.5** | **100** |

## Summary

A polished, fully working MCP-built blog ("The MCP Journal") with clean ViewComponent architecture and correct folders and structure. The content model is thin: there are only hero, rich text and listing blocks, with no image block. Each post body is one rich text block, and the post date comes from `CreateDate`.

## What it built

- **Document types:** `siteRoot` (scaffold) → `blogFrontPage` (Pages, template `blogFrontPage`) → `blogPost` (Pages, template `blogPost`). Both pages use a `blocks` property with the **Blog block grid** data type (Custom). `blogPost` also has a Listing tab with `title`, `summary`, `coverImage` and `coverAlt`.
- **Blocks (Blocks folder, element types):** `heroBlock` (eyebrow, heading, intro, image, imageAlt, imageCredit), `richTextBlock` (body) and `postListingBlock` (heading, intro). Each one has an adapter, a plain record in `Models/Blocks`, a ViewComponent and a `Default.cshtml`.
- **Templates:** `blogLayout` (master, created via MCP; Razor saved as a file because the MCP tool rejects `?`), `blogFrontPage` and `blogPost`. Each calls `Html.GetBlockGridHtmlAsync(Model, "blocks")`.
- **Pages:** `/` (The MCP Journal, domain `/`), `/one-protocol-more-possibilities/` and `/from-conversation-to-published-content/`. Each post is a hero block followed by one rich text block (~7 paragraphs with H2s).
- **Media:** a "MCP Journal" folder with 2 provided Unsplash photos (usb-cables, code-on-screen).

The front page has a split hero with the USB-cables photo, then a "Notes from a connected world" listing with two cards (image, date, "MCP" tag, title, summary, "Read the story"). The posts have the same hero layout and a narrow, readable article column. The Tailwind styling is coherent: serif headings and a muted paper palette.

![Front page](../../screenshots/gpt-6-astra-high-2026-10-03_1212-frontpage.png)

![Blog post](../../screenshots/gpt-6-astra-high-2026-10-03_1212-blogpost.png)

## Strengths

- Everything works: the build is clean, the front page has its domain, all content is published, and the imported provided photos are served through crop URLs.
- The adapter → plain model → ViewComponent pipeline is textbook, with `GetBlockGridHtmlAsync` on both pages.
- Doc type folders, allowed children, the root restriction and the Custom data type are all correct.
- Built strictly through MCP, in the right order, with an honest final report.

## Issues

- **Major:** the block set is weak. There is no image block, and each post body is a single `richTextBlock` holding the whole article (`/one-protocol-more-possibilities/`, `/from-conversation-to-published-content/`).
- Minor: there is no publish date property. The card date is `post.CreateDate` (`Views/Partials/blockgrid/Components/postListingBlock.cshtml`).
- Minor: the `blogPost` listing fields (`title`, `coverImage`, `coverAlt`) duplicate the hero block's heading, image and alt. The front page shows `usb-cables.jpg` twice (hero and card), which is the failing `content.noRepeatedImages` check.
- Minor: only 2 photos are used, and post 2 is mostly about building this demo rather than about MCP itself.
- Minor: a stray `artifacts/` folder with 6 verification PNGs was left in `Umbraco.Bench`, and `package-lock.json` was added to `Umbraco.Bench.Frontend`.
