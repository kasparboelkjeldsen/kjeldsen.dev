# Grade: 2026-10-03_1037_mcp_sonnet-5-high

**Test:** MCP · **Model:** Sonnet 5 (high) · **Grader:** Opus 5.5 (high) · **Total: 95 / 100**

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 23 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 7.5 | 10 |
| Process & honesty | 4.5 | 5 |
| **Total** | **95** | **100** |

## Summary

A clean, fully working MCP-built blog: correct folders and structure, a textbook block-grid adapter → ViewComponent pipeline, and both posts rendering with imported Unsplash photos through GetCropUrl. Points lost only for a minimal two-block set (rich text + image) and fairly short posts.

## Issues

- **minor:** The block set is only `richTextBlock` + `imageBlock`. The Block Grid data type (`/Custom/Umbraco.BlockGrid`) has no third reusable block, such as a quote, callout or heading.
- **minor:** The posts are short (about 3 short paragraphs + a list each) and partly about the demo site itself (`/why-mcp-is-awesome-one-protocol-infinite-integrations/`).
- **minor:** On the front page (`/`), the welcome block's large full-width photo pushes the post listing below the fold.
- **minor:** The final report blames a "30-minute default" background limit for the killed `dotnet run`. The model had set a 3-minute timeout itself.

## What it built

- **Document types:** `siteRoot` (Repositories, WWW) → `blogFrontPage` (Pages; `intro`, `blocks`) → `blogPost` (Pages; `excerpt`, `publishDate`, `featuredImage`, `blocks`). Block elements are `richTextBlock` (`text`) and `imageBlock` (`image`, `caption`) in Blocks.
- **Data types:** a custom `Block Grid` in `/Custom/Umbraco.BlockGrid` allowing both blocks (image also at 6 columns).
- **Code:** `Views/blogFrontPage.cshtml` and `Views/blogPost.cshtml` call `Html.GetBlockGridHtmlAsync`. The adapters `Views/Partials/blockgrid/Components/{richTextBlock,imageBlock}.cshtml` map to `Models/Blocks/{RichTextModel,ImageBlockModel}` and invoke `RichTextViewComponent` / `ImageBlockViewComponent`, which render `Views/Shared/Components/{RichText,ImageBlock}/Default.cshtml`. There is a new `_Layout.cshtml`, and rich-text typography was added to `Frontend/src/site.css`.
- **Content:** The Blog page is at `/` (domain `/`), with an intro, a welcome rich-text block and a code photo. There are two posts, each with 4 blocks (3 rich text + 1 inline image): "Giving AI Real Hands on Your Tools" and "One Protocol, Infinite Integrations". Five provided Unsplash photos are in a `Blog` media folder.
- **Look:** single-column Tailwind layout with a header, a footer and a narrow reading width. The front page lists post cards with a cropped image, title, date, excerpt and "Read more". Post pages have a back link, title, date, hero image, lead excerpt, then the blocks.

![Front page](../../screenshots/sonnet-5-high-2026-10-03_1037-frontpage.png)

![Blog post](../../screenshots/sonnet-5-high-2026-10-03_1037-blogpost.png)
