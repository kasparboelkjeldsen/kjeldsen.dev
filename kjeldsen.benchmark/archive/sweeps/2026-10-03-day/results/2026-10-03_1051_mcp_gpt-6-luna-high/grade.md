# Grade — 2026-10-03_1051_mcp_gpt-6-luna-high

**Test:** MCP · **Model:** GPT-6-Luna (high, Codex) · **Grader:** Opus 5.5 (high) · **Total: 94 / 100**

| Category | Score | Max |
|---|---|---|
| It works | 35 | 35 |
| Content modeling | 21.5 | 25 |
| Code architecture & conventions | 24.5 | 25 |
| Content & presentation | 8 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **94** | **100** |

## Summary

A clean, fully working MCP-built blog ("The MCP Notebook") that follows the block-rendering pipeline and folder conventions exactly. Points are lost on the model, which has no rich text block or real date property, and on the thin, generic post content.

## What it built

- **Document types:** `blogHomePage` and `blogPostPage` (Pages; the post has `summary` and `blocks`); `siteRoot` allows `blogHomePage`, which allows `blogPostPage`. Both templates are assigned.
- **Blocks** (one `Blog Block Grid` data type in `Custom/Umbraco.BlockGrid`): `blogIntroBlock` (heading, introduction), `blogTextBlock` (heading, plain textarea text), `blogImageBlock` (image, caption), `blogPostListBlock` (no properties; it lists the children).
- **Pages:** WWW → The MCP Notebook (domain `/`) → "MCP Turns Tool Sprawl into One Conversation" (image, text, text, image) and "From Prompt to Published Page: MCP in Practice" (image, text, text).
- **Media:** 3 provided Unsplash photos in a "Blog Images" folder, with credits in the captions.
- **Code:** 4 adapters → 4 ViewComponents → plain records in `Models/Blog/BlogViewModels.cs`, all styled with Tailwind.

The front page has a big hero, then "Latest articles" with two white cards (date, title, excerpt, "Read article →"). The cards have no images. Post pages have a narrow, readable column with a header, summary lede, captioned full-width images and headed text sections.

![Front page](../../screenshots/gpt-6-luna-high-2026-10-03_1051-frontpage.png)

![Blog post](../../screenshots/gpt-6-luna-high-2026-10-03_1051-blogpost.png)

## Issues

- **major** No rich text block: `blogTextBlock.text` is a plain TextArea rendered with `whitespace-pre-line` (`Views/Shared/Components/BlogText/Default.cshtml`). Post bodies can't have links, lists or emphasis.
- **minor** No publish date property: the listing orders and displays by `CreateDate` (`Views/Partials/blockgrid/Components/blogPostListBlock.cshtml`).
- **minor** The posts are short (~4 paragraphs, ~180 words each) and generic.
- **minor** There is no listing image property, so the front-page cards are text-only.
- **minor** The page shell is duplicated across `Views/blogHomePage.cshtml` and `Views/blogPostPage.cshtml` instead of a shared layout.

## Strengths

- All 43 automated checks pass; the build has 0 warnings.
- The adapter → ViewComponent → plain record pipeline is textbook for all 4 blocks.
- The provided photos were imported into a media folder and are served through `GetCropUrl`.
- The `/` domain is assigned correctly, and the schema tree is clean.
- Built only through MCP, in the right order, with an accurate final report.
