# Grade: 2026-10-03_0654_mcp_gpt-6-astra-high

**GPT-6-Astra (high), MCP test: 93 / 100.** Graded by Opus 5.5 (low).

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 21 | 25 |
| Code architecture & conventions | 24 | 25 |
| Content & presentation | 8 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **93** | **100** |

## Summary

The model built "Common Ground", a polished MCP blog: a front page with a hero and a post listing, and two substantive, accurate posts. The site works fully, with media-library crops, a domain on the site page and a clean adapter → ViewComponent pipeline. The main weakness is the post model: each post is a property-less header block plus one rich text block holding the whole article, and there is no image block.

## Issues

- **Major:** each post body is one `richTextBlock` holding the whole article, plus an `articleHeaderBlock` with no properties. There is no image block and only one image (the cover) per post. See `snapshot.json` and `/why-mcp-makes-tools-better-together/`.
- **Minor:** `articleHeaderBlock` has no content of its own. Its adapter hard-casts `Umbraco.AssignedContentItem` to `BlogPost` and maps page properties, so the block would throw on any other page type. See `Views/Partials/blockgrid/Components/articleHeaderBlock.cshtml`.
- **Minor:** verification screenshots and `verification.json` were left in `Umbraco.Bench/artifacts/`.

## Strengths

- Everything works: 0 build warnings, all 3 pages and 5 images load, the `/` domain is on the site page, and all content is published.
- Textbook rendering: `GetBlockGridHtmlAsync`, 4 exact-alias adapters, 4 thin ViewComponents and plain records in `Models/Blocks/`.
- Post metadata (title, summary, cover image, category, published date, reading minutes) are real properties, and the listing cards use them.
- A distinctive editorial design, built through the Tailwind pipeline.
- Schema and content were built only through MCP, then stop, build and restart, then Razor. The final report is accurate.

## What it built

- **Document types:** `siteRoot` (Repositories, the only type allowed at root), `blogFrontPage` and `blogPost` (Pages, each with a template), and the element types `heroBlock`, `postListingBlock`, `articleHeaderBlock` and `richTextBlock` (Blocks).
- **Data types:** "Front page blocks" (hero, listing) and "Article blocks" (article header, rich text), both block grids in `/Custom`.
- **Content:** WWW → Common Ground (domain `/`) → "One connection. A world of possibility." and "From a good idea to a published page.". There are 3 provided Unsplash photos in the "Blog photography" media folder.
- **Front page:** a split hero (big headline, CTA and a USB-cable photo with credit), then "Fresh connections.": two image cards with a category pill, date, reading time, excerpt and "Read the story" link, then a footer.
- **Post:** a back link, a centred category, title, excerpt and meta, a full-width cover image with credit, then a 700px prose column with H2 sections and a serif pull quote.

![Front page](../../screenshots/gpt-6-astra-high-2026-10-03_0654-frontpage.png)

![Blog post](../../screenshots/gpt-6-astra-high-2026-10-03_0654-blogpost.png)
