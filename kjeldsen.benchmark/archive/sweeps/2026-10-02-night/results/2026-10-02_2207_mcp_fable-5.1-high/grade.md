# Grade: 2026-10-02_2207_mcp_fable-5.1-high

**Test:** MCP · **Model:** Fable 5.1 (high) · **Grader:** Opus 5.5 (high) · **Total: 99 / 100**

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 25 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 9 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **99** | **100** |

## Summary

A complete, clean MCP-built blog: a block-grid front page with a hero and a post-card listing, and two substantive posts about MCP built from rich text, image and quote blocks. All of it renders through textbook adapter + ViewComponent code. The only blemish is that one post shows its header photo again as an inline image.

## Issues

- **minor**: `/one-protocol-every-tool/` uses the USB-cables photo both as `heroImage` and as its first `imageBlock`, so the same picture appears twice in a row.
- **minor**: The run left a stray `Umbraco.Bench.Umbraco/umbraco-run.log` from running the site in the background. The final report discloses it.
- **minor**: This was the slowest run of the batch (14:16). The first boot skipped the launch profile, and the MCP tools returned 500s until the site was restarted.

Note: the last image on the post screenshot is blank only because the full-page screenshot didn't trigger `loading="lazy"`. The `<img>` is present and loads, and all 9 of 9 images pass the check.

## What it built

- **Element types (Blocks folder):** `heroBlock` (heading, subheading, background image), `richTextBlock` (body), `imageBlock` (image, caption), `quoteBlock` (quote, attribution), `postListBlock` (heading; lists the current page's `BlogPost` children).
- **Document types (Pages folder):** `blogHome` (title, tagline, blocks) and `blogPost` (title, summary, heroImage, publishDate, author, blocks), each with its own template. `siteRoot` allows `blogHome`, and `blogHome` allows `blogPost`.
- **Data type:** one block grid, "Page Blocks", in `Custom/Umbraco.BlockGrid`, holding all five blocks.
- **Content:** WWW (siteRoot) → Blog (domain `/`) → "One protocol, every tool: why MCP is the USB-C of AI" and "This blog built itself". Everything is published. There are 6 provided Unsplash photos in a Blog media folder, with photographer credits in the captions.
- **Code:** `Models/Blocks/*Model.cs`, `ViewComponents/*ViewComponent.cs`, adapters in `Views/Partials/blockgrid/Components/<alias>.cshtml`, component views in `Views/Shared/Components/<Name>/Default.cshtml`, a shared `_Layout.cshtml`, and grid and RTE styles added to the Tailwind source.

**Front page:** a white header with the site title and tagline, then a dark rounded hero ("Why MCP is awesome") over a network photo, an intro paragraph, and "Latest posts" as two cards. Each card shows an image, the date, the author, the title and a summary.

![Front page](../../screenshots/fable-5.1-high-2026-10-02_2207-frontpage.png)

**Blog post:** a back link, a large title, a date/author line, a lead summary and a wide header image. Below that comes a readable centered body: H2 sections, a bulleted list, a captioned image and an indigo-bordered pull quote.

![Blog post](../../screenshots/fable-5.1-high-2026-10-02_2207-blogpost.png)
