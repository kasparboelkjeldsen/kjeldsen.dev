# Grade: 2026-10-03_1314_mcp_fable-5.1-high

**Total: 99 / 100** (MCP test, Fable 5.1 high) · graded by Opus 5.5 (high)

| Category | Score | Max |
|---|---|---|
| It works | 35 | 35 |
| Content modeling | 25 | 25 |
| Code architecture & conventions | 24.5 | 25 |
| Content & presentation | 9.5 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **99** | **100** |

## Summary

A complete, clean MCP-built blog: 5 well-designed blocks, 2 page types, a front page with a hero and post cards, and 2 multi-block posts, all rendered through Umbraco's block grid pipeline exactly per the scaffold conventions. Only nits remain: a stray run log file and a second post that reads a bit like a build log.

All 43 automated checks passed. The build had 0 errors and 0 warnings.

## Issues

- **minor**: Stray `umbraco-run.log` (dotnet run output) left in the `Umbraco.Bench/` root.
- **minor**: Post 2 (`/mcp-in-practice-building-this-blog-without-opening-the-backoffice/`) is more of a build walkthrough than an argument for MCP. It also says the server validates block keys while elsewhere saying bad payloads fail quietly.

## Strengths

- Textbook adapter → plain model → ViewComponent pipeline for all 5 blocks
- Lean, correct schema: right folders, allowed children, one custom block grid data type (`Custom/Umbraco.BlockGrid`), real post metadata properties
- Uses the grid properly (a 6/6 image + text row in post 2), with layout CSS through the Tailwind pipeline
- Polished design; all images are signed `GetCropUrl` URLs of the provided Unsplash photos, credited in captions
- Strict MCP-only process in the required order; accurate final report

## What it built

- **Document types**: `siteRoot` (Repositories, scaffold) → `blogHome` (Pages: title, blocks) → `blogPost` (Pages: title, summary, coverImage, author, publishDate, blocks)
- **Blocks** (Blocks folder, one Blog Block Grid data type): `heroBlock` (heading, subheading, backgroundImage), `richTextBlock` (body), `imageBlock` (image, caption), `quoteBlock` (quote, attribution), `postListBlock` (heading, maxPosts)
- **Code**: `Models/Blocks/*Model.cs`, `ViewComponents/*ViewComponent.cs`, `Views/Partials/blockgrid/Components/<alias>.cshtml` adapters, `Views/Shared/Components/<Name>/Default.cshtml`, `_Layout.cshtml`, `blogHome.cshtml`, `blogPost.cshtml`
- **Pages**: `/` (Blog: hero, intro rich text, post list), `/why-mcp-is-awesome-one-protocol-for-every-tool/`, `/mcp-in-practice-building-this-blog-without-opening-the-backoffice/`
- **Media**: 6 provided photos in a `Blog` media folder

The front page has a dark network-photo hero, an intro paragraph and a two-card grid. Each card shows a cover image, date, author, title and summary. Posts have a back link, a big title, a date/author line, a summary lede and a cover image, followed by block content: prose, captioned images and an indigo pull quote.

![Front page](../../screenshots/fable-5.1-high-2026-10-03_1314-frontpage.png)

![Blog post](../../screenshots/fable-5.1-high-2026-10-03_1314-blogpost.png)
