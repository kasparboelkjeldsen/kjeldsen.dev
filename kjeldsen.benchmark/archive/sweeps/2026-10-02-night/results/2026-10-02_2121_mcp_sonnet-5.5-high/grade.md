# Grade: 2026-10-02_2121_mcp_sonnet-5.5-high

**Test:** MCP · **Model:** Sonnet 5.5 (high) · **Grader:** Opus 5.5 (high) · **Total: 99 / 100**

| Category | Score | Max |
|---|---|---|
| It works | 35 | 35 |
| Content modeling | 25 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 9 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **99** | **100** |

## Summary

A clean MCP-built blog: 5 well-designed blocks across two block grids, a front page with a hero and a post list block, and two posts of 4 blocks each. The rendering follows the adapter → ViewComponent → plain view pipeline exactly, and the Tailwind design is polished. The only weakness is that the posts are fairly short.

## Issues

All of these are minor:

- **Short posts.** Both posts are about 250 words each; the content is accurate but light. See `/mcp-turns-your-ai-from-a-talker-into-a-doer/` and `/one-protocol-endless-integrations/`.
- **Filler quotes.** The pull quotes are attributed to "The MCP Blog" itself rather than a real source.
- **Alt text.** The image block's alt text reuses the caption, including the photo credit (`Views/Shared/Components/Image/Default.cshtml`).
- **Repeated photo.** The post page shows the listing thumbnail as a header image outside the block grid (`Views/blogPost.cshtml`), so the first post has two large photos back to back.

## What it built

**Document types**
- **Pages:**
  - `blogHome` has `siteName` and a block grid `blocks`. It is allowed under `siteRoot`, and allows `blogPost` beneath it.
  - `blogPost` has `summary`, `publishDate`, `author`, `thumbnail` and a block grid `blocks`.
- **Composition:** both page types compose `seoComposition`, which holds `metaTitle` and `metaDescription`.

**Blocks** (element types in Blocks)

| Block | Properties |
|---|---|
| `heroBlock` | heading, subheading, background image |
| `blogPostListBlock` | heading, intro, maxItems |
| `richTextBlock` | content |
| `imageBlock` | image, caption |
| `quoteBlock` | quote, attribution |

**Block grids**
- "Blog Home Block Grid" allows the hero, post list and rich text blocks.
- "Blog Post Block Grid" allows the rich text, image and quote blocks.
- Both are in `/Custom/Umbraco.BlockGrid`.

**Code**
- Each block has an adapter in `Views/Partials/blockgrid/Components/<alias>.cshtml`.
- Each adapter maps to a model in `Models/Blocks/` and invokes a ViewComponent in `ViewComponents/`.
- Each ViewComponent renders `Views/Shared/Components/<Name>/Default.cshtml`.
- There is a shared `_Layout` with a header and footer.

**Content and media**
- **Front page:** "MCP Blog" sits under WWW with the domain `/`. It has a hero block over the network photo and a "Latest posts" list block.
- **Posts:** two of them, each made of rich text, image and quote blocks:
  - "MCP turns your AI from a talker into a doer"
  - "One protocol, endless integrations"
- **Media:** 5 of the provided Unsplash photos, in a "Blog" media folder.

**How it looks**
- **Front page:** a full-width dark hero, then a two-column grid of rounded cards. Each card has an image, the date and author, the title, a summary and "Read more".
- **Posts:** a narrow reading column with a back link, title, date and author, a lead paragraph and a header image. Then come the block grid content, an image with a photographer credit, a styled list and an indigo blockquote.

![Front page](../../screenshots/sonnet-5.5-high-2026-10-02_2121-frontpage.png)

![Blog post](../../screenshots/sonnet-5.5-high-2026-10-02_2121-blogpost.png)
