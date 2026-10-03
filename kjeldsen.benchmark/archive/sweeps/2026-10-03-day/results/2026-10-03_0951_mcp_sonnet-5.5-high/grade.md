# Grade: 2026-10-03_0951_mcp_sonnet-5.5-high

**Test:** MCP · **Model:** Sonnet 5.5 (high) · **Grader:** Opus 5.5 (low) · **Total: 99 / 100**

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 25 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 9 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **99** | **100** |

## Summary

A complete blog built entirely over MCP, following every project convention. The front page has a hero block and a post-listing block. The two posts are built from rich text, image and quote blocks. Everything renders through the scaffold's adapter → ViewComponent pipeline, with imported Unsplash media and a polished Tailwind design. The only weakness is that the posts are fairly short.

## Issues

- **minor**: The posts are short, about 4 paragraphs plus bullets and a quote each (`/one-protocol-every-tool-why-mcp-is-awesome/`, `/mcp-turns-your-cms-into-something-an-ai-can-work-in/`).
- **minor**: The front page `<title>` reads "The MCP Blog – The MCP Blog" (`Views/Shared/_Layout.cshtml`, `Views/blogFrontPage.cshtml`). The report discloses this.
- **minor**: One imported media item ("Code on screen") is never used.
- **minor**: Listing card images have empty `alt` text (`Views/Shared/Components/BlogPostList/Default.cshtml`).

## What it built

- **Document types:**
  - **Blocks:** `heroBlock` (heading, subheading, backgroundImage), `richTextBlock` (text), `imageBlock` (image, caption), `quoteBlock` (quote, attribution) and `blogPostListBlock` (heading).
  - **Pages:** `blogFrontPage` (siteName, blocks) and `blogPost` (summary, author, publishDate, heroImage, blocks), each with its own template.
  - **Structure:** `siteRoot` allows `blogFrontPage`, which allows `blogPost`.
- **Data types:** "Blog Front Page Blocks" (hero, post list) and "Blog Post Blocks" (rich text, image, quote), both in `/Custom/Umbraco.BlockGrid`.
- **Content:**
  - **Front page:** WWW → "MCP Blog" (domain `/`).
  - **Posts:** "One Protocol, Every Tool: Why MCP Is Awesome" and "MCP Turns Your CMS into Something an AI Can Work In". Each is built as rich text → image → rich text → quote.
  - **Media:** six photos from `unsplash/` in a "Blog" media folder.
- **Code:** five adapters in `Views/Partials/blockgrid/Components/`, five ViewComponents with `Views/Shared/Components/<Name>/Default.cshtml`, records in `Models/Blocks/`, a shared `_Layout.cshtml`, and Tailwind built to `wwwroot/dist/site.css`.

**Front page:** a white header bar, then a dark network-photo hero reading "Why MCP is awesome", then a "Latest posts" grid of two cards. Each card has an image, date and author, title, summary and "Read more".

![Front page](../../screenshots/sonnet-5.5-high-2026-10-03_0951-frontpage.png)

**Blog post:** a dimmed hero image with date, author, title and summary. Below it, a narrow reading column with H2 sections, a captioned inline photo, a bullet list, a pull quote with an indigo rule, and a "Back to all posts" link.

![Blog post](../../screenshots/sonnet-5.5-high-2026-10-03_0951-blogpost.png)
