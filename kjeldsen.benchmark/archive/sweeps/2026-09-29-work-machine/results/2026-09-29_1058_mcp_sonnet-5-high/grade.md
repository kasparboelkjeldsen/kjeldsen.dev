# Grade: 2026-09-29_1058_mcp_sonnet-5-high

**95 / 100** · Test: MCP · Model: Sonnet 5 (high) · Run time 12:53 · 76 requests · 120 tool calls (52 MCP)
Graded by Fable 5.1 (effort not visible to the grader) on 2026-09-29.

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 23 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 7 | 10 |
| Process & honesty | 5 | 5 |
| **Total** | **95** | **100** |

## Summary

A complete, working block-grid blog built over MCP: a front page with a card listing and two posts about MCP, with textbook adapter / ViewComponent / plain-model architecture. It loses points for a minimal block set with the listing hard-coded in the template, and for short posts that show the same photo twice.

Automated checks: 39 passed, 2 failed. Both failures were checked by hand and neither cost points (see Issues).

## What it built

**Document types**

| Type | Folder | Kind | Properties |
|---|---|---|---|
| `siteRoot` | Repositories | document | none (scaffold); allows `blogFrontPage` |
| `blogFrontPage` | Pages | document | `title`, `intro` (block grid); composed with `seoComposition`; allows `blogPost` |
| `blogPost` | Pages | document | `title`, `publishDate`, `excerpt`, `featuredImage`, `body` (block grid); composed with `seoComposition` |
| `seoComposition` | Compositions | element | `metaTitle`, `metaDescription` |
| `richTextBlock` | Blocks | element | `text` |
| `imageBlock` | Blocks | element | `image`, `caption` |
| `quoteBlock` | Blocks | element | `quote`, `author` |

One custom data type, "Block Grid - Blog Content" in `Custom/Umbraco.BlockGrid`, allows the three blocks on a 12-column grid. Two templates, `blogFrontPage` and `blogPost`.

**Content**

- `WWW / Blog` with domain `/`, one rich text block as intro
- "Why MCP Is Awesome: A New Contract Between AI and Your Tools": 5 blocks (rich text, image, rich text, quote, rich text), about 340 words
- "5 Reasons MCP Changes How We Build With AI": 6 blocks (rich text ×2, image, rich text, quote, rich text), about 300 words
- Media: folder `Blog` with two Unsplash photos, "Circuit board close-up" and "Code on screen"

**Code**

- `Views/blogFrontPage.cshtml` and `Views/blogPost.cshtml` render the grids with `Html.GetBlockGridHtmlAsync`
- Three adapters in `Views/Partials/blockgrid/Components/`, three ViewComponents in `ViewComponents/`, three plain models in `Models/Blocks/`, three component views in `Views/Shared/Components/<Name>/Default.cshtml`
- Styling with Tailwind classes, built to `wwwroot/dist/site.css`

**How it looks**

The front page has a white header with the title "Blog", a one-paragraph intro, and a "Latest posts" list of two full-width cards, each with a cropped image, date, title and excerpt.

![Front page](../../screenshots/sonnet-5-high-2026-09-29_1058-frontpage.png)

Post pages have a "Back to Blog" link, date, large title, a hero image and a single readable text column with a captioned figure and a teal pull quote. The inline image is the same photo as the hero, shown at full column width.

![Blog post](../../screenshots/sonnet-5-high-2026-09-29_1058-blogpost.png)

## Category notes

### It works: 35 / 35

- Build: 0 errors, 0 warnings.
- `/` returns 200 and lists both posts with image, date, title and excerpt. Both links work.
- Both posts render every block, with no "Could not render component" or exception text.
- Images come from Unsplash, are imported into the media library, and are served through signed `GetCropUrl` URLs. 6/6 load.
- Domain `/` is on the Blog page and all four documents are published.

### Content modeling: 23 / 25

- Folders 8/8. Every type is in the right folder and is the right kind.
- Block set 5/7. Rich text, image and quote are reusable and sensible, but that is the minimum set. The post listing is fixed markup in the front page template instead of a block (−1). `imageBlock` has no alt text property, and its 6-column span option has no effect because no block grid layout CSS is loaded (−1).
- Structure 5/5. `siteRoot` is the only root type, the hierarchy is `siteRoot` > `blogFrontPage` > `blogPost`, templates are assigned, aliases are camelCase.
- Hygiene 5/5. The composition holds SEO meta only. Post metadata are real properties. Nothing is duplicated or orphaned.

### Code architecture & conventions: 25 / 25

- Pages 7/7, adapters 6/6, ViewComponents 7/7, conventions 5/5.
- The scaffold's block grid partials are unchanged. `Program.cs` is untouched, there are no migrations, and no services are injected.
- Not deducted: both page views carry a full HTML document instead of sharing a layout.

### Content & presentation: 7 / 10

- Content 4/6. Both posts are on topic and accurate, but short (−1), and each reuses its featured image as its inline image (−1).
- Presentation 3/4. Coherent and readable, but the repeated full-width photo dominates the post pages and there is no navigation or footer (−1).

### Process & honesty: 5 / 5

- Channel 3/3. 52 MCP calls (32 writes), no other channel used, order of operations followed, no memory access, nothing read from the bench folders.
- Report 2/2. Accurate, with working URLs, and it discloses the bug it fixed.

## Issues

| Severity | Issue |
|---|---|
| minor | The post listing is fixed markup in `Umbraco.Bench.Umbraco/Views/blogFrontPage.cshtml`, not a block. The front page grid holds one rich text block. |
| minor | Each post reuses its featured image as its inline image block, so the same photo appears twice on `/why-mcp-is-awesome-a-new-contract-between-ai-and-your-tools/` and `/5-reasons-mcp-changes-how-we-build-with-ai/`. Only two media items exist. |
| minor | Posts are short, about 340 and 300 words. |
| minor | `imageBlock` has no alt text property. `Views/Partials/blockgrid/Components/imageBlock.cshtml` passes the caption, which the component uses as alt. |
| minor | No block grid layout CSS is loaded, so the 6-column span on the image block in the second post has no effect. |
| minor | `blogFrontPage.cshtml` and `blogPost.cshtml` duplicate head and header instead of sharing a layout. No site navigation or footer. |
| minor | Scratch curl output was written to `/tmp` (`front.html`, `post1.html`, `post2.html`), outside the project folder. Not deducted, in line with earlier runs. |
| minor | Bench tooling, not the model: `code.appsettingsJsonUnchanged` fails on the `Imaging:HMACSecretKey` that Umbraco writes to `appsettings.json` on first boot (file written 08:58:23Z, run started 08:58:46Z). No points deducted. |

## Strengths

- Everything works: clean build, all pages and blocks render, signed crop URLs load, domain `/` assigned.
- The block pipeline follows `AGENTS.md` exactly.
- The composition is used for SEO meta only, and post metadata are real properties.
- Built only through MCP in the prescribed order, and the rendered pages were verified before reporting.
- The final report is accurate.
