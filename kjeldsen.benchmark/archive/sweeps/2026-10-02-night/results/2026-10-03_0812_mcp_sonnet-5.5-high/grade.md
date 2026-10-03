# Grade: 2026-10-03_0812_mcp_sonnet-5.5-high

**Test:** MCP · **Model:** Sonnet 5.5 (high) · **Grader:** Opus 5.5 (high) · **Total: 99 / 100**

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 25 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 9 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **99** | **100** |

## Summary

A clean MCP build that follows every project convention: 5 block types, 2 page types, a front page routed through the `/` domain with a hero and a card listing, and 2 published posts about MCP. Blocks render through the adapter → ViewComponent pipeline, styled with Tailwind. The only shortfall is that the posts are a bit brief.

## Issues

- **minor:** The posts are fairly short, about 3 paragraphs plus a bullet list each. The pull quotes are attributed to "The MCP Blog" itself. See `/mcp-lets-ai-work-with-your-cms-not-just-talk-about-it/` and `/one-protocol-every-tool-the-usb-c-moment-for-ai/`.
- **minor:** The `blogPostListBlock` adapter lists `UmbracoContext.PublishedRequest.PublishedContent.Children<BlogPost>()`, so the block only works on the page whose children are posts. The model disclosed this. File: `Views/Partials/blockgrid/Components/blogPostListBlock.cshtml`.
- **minor:** Image block alt text reuses the caption, which includes the photo credit (`Views/Shared/Components/Image/Default.cshtml`). One imported photo (circuit board) is never used.

## Strengths

- All 42 automated checks pass, and the build has 0 warnings.
- Textbook block pipeline: `GetBlockGridHtmlAsync`, adapters with no markup, plain record models in `Models/Blocks`, and one ViewComponent per block.
- Separate block sets per page type. Post metadata (summary, publishDate, heroImage) are real properties that drive both the cards and the post header.
- The provided Unsplash photos are imported over MCP into a `Blog` media folder, with credits in the captions.
- The schema, media and content were built over MCP only, in the right order. The final report is accurate and candid.

## What it built

- **Document types:**
  - Blocks folder (elements): `heroBlock` (heading, subheading, backgroundImage), `richTextBlock` (content), `imageBlock` (image, caption), `quoteBlock` (quote, attribution) and `blogPostListBlock` (heading, maxPosts).
  - Pages folder: `blogFrontPage` (siteTitle, blocks) and `blogPost` (summary, publishDate, heroImage, blocks), each with a template.
  - `siteRoot` now allows `blogFrontPage` as a child.
- **Data types:**
  - "Blog Front Page Blocks" allows hero, post list and rich text.
  - "Blog Post Blocks" allows rich text, image and quote.
  - Both are in `Custom/Umbraco.BlockGrid`.
- **Content:**
  - WWW → "The MCP Blog", which has the domain `/`.
  - Two child posts:
    - "MCP lets AI work with your CMS, not just talk about it" (28 Sep 2026)
    - "One protocol, every tool: the USB-C moment for AI" (1 Oct 2026)
  - Each post grid has rich text, an image, a pull quote, then rich text with an h2 and a bullet list.
- **Front page:** a full-width dark hero over the network photo ("Why MCP is awesome"), then "Latest posts" as a 2-column card grid. Each card has an image, date, title, excerpt and a "Read the post →" link.
- **Post page:** a header over the hero photo with the date, title and summary. Below it is a centred prose column with a rounded, shadowed image and caption, and a pull quote with an indigo left border. The nav and footer are shared.

![Front page](../../screenshots/sonnet-5.5-high-2026-10-03_0812-frontpage.png)

![Blog post](../../screenshots/sonnet-5.5-high-2026-10-03_0812-blogpost.png)
