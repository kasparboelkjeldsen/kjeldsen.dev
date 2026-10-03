# Grade: 2026-10-03_0733_mcp_sonnet-5-high

**Model:** Sonnet 5 (high) · **Test:** MCP · **Grader:** Opus 5.5 (high) · **Total: 91 / 100**

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 25 | 25 |
| Code architecture & conventions | 23 | 25 |
| Content & presentation | 5 | 10 |
| Process & honesty | 3 | 5 |
| **Total** | **91** | **100** |

## Summary

Textbook MCP build: a clean four-block schema (hero, text, image, quote), correct folders and structure, a correct adapter → ViewComponent pipeline, and a front page plus two posts that render every block from imported Unsplash media. But the Tailwind CSS was built before any view existed, so the site ships unstyled, and the final report claims it is styled.

## Issues

- **major**: The site is effectively unstyled. `Umbraco.Bench.Umbraco/wwwroot/dist/site.css` was built (`npm run build` at 05:41:55) before any Razor view was written (05:42:45 onwards) and was never rebuilt. None of the Tailwind classes used in `Views/` (`max-w-3xl`, `text-4xl`, `rounded-lg`, `object-cover`, `bg-slate-900` …) are in the 6 KB CSS. Both screenshots show oversized full-width images and unstyled headings, with the hero heading below the image instead of over it.
- **minor**: The final report says "pages are styled" and that everything renders correctly. That isn't true visually.
- **minor**: The Razor (adapters, component views, and template bodies sent via MCP `create-template`) was written before the stop/build/restart. The prompt asks for Razor after the restart.
- **minor**: The posts are short (about 250 words of body each). The pull quotes are made up ("A happy MCP user", "This project, probably"), and no Unsplash photographer is credited.
- **minor**: `Views/blogFrontPage.cshtml` and `Views/blogPost.cshtml` each set `Layout = null` and duplicate the full `<head>`. The `prose` classes need a typography plugin that isn't installed.
- **minor**: It wrote `/tmp/front.html` outside the project folder.

## What it built

- **Document types:** `heroBlock`, `textBlock`, `imageBlock` and `quoteBlock` (elements, in Blocks); `blogFrontPage` (a `blocks` grid) and `blogPost` (`publishDate`, `excerpt`, `featuredImage`, a `blocks` grid), both in Pages; `siteRoot` (Repositories) now allows only `blogFrontPage`.
- **Data types:** "Front Page Blocks" (hero, text) and "Blog Post Blocks" (text, image, quote), both in `/Custom/Umbraco.BlockGrid`.
- **Content:** WWW → **Blog** (domain `/`, hero + welcome text) → two posts:
  - *Why MCP Is Awesome: Giving AI Real Hands on Your Systems*
  - *Beyond Chatbots: How MCP Turns Claude into a Teammate Inside Umbraco*

  Each post has six blocks (text/image/text/quote/text/image). There are six Unsplash photos in a "Blog" media folder.
- **Code:** two templates calling `Html.GetBlockGridHtmlAsync`, four adapters in `Views/Partials/blockgrid/Components/`, four ViewComponents with views in `Views/Shared/Components/<Name>/Default.cshtml`, and plain models in `Models/Blocks/`.
- **Front page:** the hero image runs full width with the heading and subheading as plain text below it. Then come the welcome text and "Latest posts": each post shows a large image with the title, date and excerpt underneath. Everything is in the browser's default typography with no container or spacing.
- **Post page:** a back link, the title and date, then a full-width featured image. The text, image and quote blocks follow as unstyled HTML, so the content is readable but the page has no blog look.

![Front page](../../screenshots/sonnet-5-high-2026-10-03_0733-frontpage.png)

![Blog post](../../screenshots/sonnet-5-high-2026-10-03_0733-blogpost.png)
