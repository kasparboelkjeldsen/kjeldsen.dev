# Grade: 2026-09-29_0924_mcp_fable-5.1-high

**97 / 100** · MCP test · Fable 5.1 (high) · graded by Fable 5.1

A complete, working block-grid blog built entirely over the Umbraco MCP server: a front page with hero, intro and post cards, plus two 5-block posts. The adapter → ViewComponent → plain model pipeline is followed exactly. The only real blemish is that the run needed a human "go" before it started.

## Scores

| Category | Score | Max |
|---|---:|---:|
| It works | 35 | 35 |
| Content modeling | 24 | 25 |
| Code architecture & conventions | 25 | 25 |
| Content & presentation | 9 | 10 |
| Process & honesty | 4 | 5 |
| **Total** | **97** | **100** |

## Read this first

- **The run was not hands-off.** The model answered the blog prompt with a summary of the brief and asked for confirmation. The operator replied "go", and the build ran from there. The brief says to work autonomously, so this costs 1 point in Process.
- **Metrics were re-collected with `--include-followups`.** The default collect stopped at the confirmation request and reported 51 seconds and 7 tool calls. The numbers now cover the real work: 12:31 total, 116 tool calls, 32 requests. They include about 40 seconds of stall and waiting for "go".
- **The one failed check is a false positive.** `code.appsettingsJsonUnchanged` fails on `Imaging:HMACSecretKey`, which Umbraco's installer wrote at 09:23:42 during `npm run up`. The run started at 09:24:51 and the transcript has no edit to that file.

## Issues

| Severity | Issue | Where |
|---|---|---|
| Major | Did not start autonomously; needed a "go" from the operator | `transcript.jsonl`, turn at 07:25:42Z |
| Minor | `imageBlock` has no alt text property; the adapter uses the media name | `Views/Partials/blockgrid/Components/imageBlock.cshtml` |
| Minor | One grid data type for both page types, so the post list block can be added to a post | data type `Blog Block Grid` |
| Minor | Post title is entered twice: node name and hero heading | `blogPost` + `heroBlock` |
| Minor | Posts are about 300 words each | `/mcp-is-the-usb-c-port-for-ai/`, `/this-blog-was-built-without-opening-the-backoffice/` |
| Tooling | `code.appsettingsJsonUnchanged` flags the HMAC key Umbraco writes on first boot | `bench/check.mjs` |

## Category notes

### It works (35/35)

- **Build:** 0 errors, 0 warnings.
- **Front page:** `/` returns 200 and lists both posts as cards with image, date, author and excerpt. Both links work.
- **Posts:** both render all 5 blocks, with no fallback or exception text.
- **Images:** 5 Unsplash images imported with `create-media` into the `Blog` media folder, served through signed `GetCropUrl` urls. 7 of 7 load, none hot-linked.
- **Routing:** domain `/` is assigned on the `MCP Notes` page, and all 4 documents are published.

### Content modeling (24/25)

- **Folders and kinds:** 5 element types in Blocks, 2 page types in Pages, `siteRoot` in Repositories.
- **Structure:** `siteRoot` is the only root type, `blogFrontPage` allows only `blogPost`, templates are assigned, aliases are camelCase, and the grid data type sits in `Custom/Umbraco.BlockGrid`.
- **Hygiene:** no compositions, no duplicates or orphans. Excerpt, list image, publish date and author are real properties.
- **Deduction (−1):** no alt text property on `imageBlock`, the title is typed twice, and the post list block is allowed on posts.

### Code architecture & conventions (25/25)

- **Pages:** both call `Html.GetBlockGridHtmlAsync(Model, "blocks")`. The scaffold's blockgrid partials are untouched.
- **Adapters:** 5, named by exact alias. Each maps `BlockGridItem<T>` to a plain model and calls `Component.InvokeAsync`, with no markup.
- **Components:** 5 ViewComponents with `Views/Shared/Components/<Name>/Default.cshtml`. Models live in `Models/Blocks/`, and the component views have no Umbraco types.
- **Conventions:** friendly extensions and `GetCropUrl` only, no injected services, no migrations, `Program.cs` untouched, styling through the Tailwind pipeline.

### Content & presentation (9/10)

- **Posts (5/6):** on-topic and accurate, each spread over 5 blocks with relevant images, but short at about 300 words.
- **Presentation (4/4):** reads as a real blog. One nit: in the half-width row the quote card is taller than the image beside it.

### Process & honesty (4/5)

- **Channel (2/3):** 52 MCP calls, 33 of them writes. No Management API, browser, migration, uSync or database use, and the order of operations was followed. No memory access and nothing read from the bench folders. −1 for needing the "go".
- **Scratchpad:** logs and screenshots went to the session scratchpad in the temp folder, outside the project. Not deducted.
- **Report (2/2):** accurate, and it discloses its own trade-offs.

## What it built

**Document types**

| Alias | Kind | Folder | Properties |
|---|---|---|---|
| `blogFrontPage` | Page | Pages | `blocks` |
| `blogPost` | Page | Pages | `blocks`, `excerpt`, `listImage`, `publishDate`, `author` |
| `heroBlock` | Element | Blocks | `heading`, `lead`, `backgroundImage` |
| `richTextBlock` | Element | Blocks | `text` |
| `imageBlock` | Element | Blocks | `image`, `caption` |
| `quoteBlock` | Element | Blocks | `quote`, `attribution` |
| `blogPostListBlock` | Element | Blocks | `heading` |

**Data type:** `Blog Block Grid`, 12 columns, allowing all five blocks. Image, quote and rich text blocks have half-width options.

**Pages**

| Page | URL | Blocks |
|---|---|---|
| MCP Notes | `/` | hero, rich text, post list |
| MCP Is the USB-C Port for AI | `/mcp-is-the-usb-c-port-for-ai/` | hero, rich text, image + quote, rich text |
| This Blog Was Built Without Opening the Backoffice | `/this-blog-was-built-without-opening-the-backoffice/` | hero, rich text, quote + image, rich text |

**Front page:** a slim header, a rounded hero with an Earth-at-night photo, a short welcome text, and a two-column grid of post cards.

![Front page](../../screenshots/fable-5.1-high-2026-09-29_0924-frontpage.png)

**Post:** a back link and date line, a hero with the title, a narrow text column, and a half-width image beside a quote card.

![Blog post](../../screenshots/fable-5.1-high-2026-09-29_0924-blogpost.png)
