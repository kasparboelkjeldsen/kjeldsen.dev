# Umbraco benchmark — model comparison

Generated 03/10/2026, 09:12:19

## Test: MCP

### Time

| Phase | GPT-5.6-Terra (high) | GPT-6-Luna (high) | GPT-6-Sol (high) | Fable 5.1 (high) | GPT-6-Astra (high) | GPT-5.6-Luna (high) | Sonnet 5 (high) | GPT-5.6-Sol (high) | Sonnet 5.5 (high) | Opus 5.5 (high) | Haiku 4.5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Prompt 1: verify MCP | 0:12 | 0:18 | 0:17 | 0:19 | 0:20 | 0:22 | 0:08 | 0:28 | 0:07 | 0:13 | 0:07 |
| Boot, read rules, plan → first type created | 2:31 | 1:36 | 1:12 | 1:55 | 2:02 | 1:40 | 2:23 | 1:56 | 0:51 | 0:45 | 2:12 |
| Content modeling | 1:20 | 2:15 | 1:26 | 1:38 | 1:13 | 1:38 | 1:11 | 2:29 | 0:47 | 1:16 | 0:38 |
| Content: media, pages, publish | 1:26 | 1:44 | 1:58 | 3:04 | 3:56 | 2:27 | 4:47 | 3:21 | 0:59 | 2:27 | 1:21 |
| Stop, build, Razor, restart | 4:09 | 1:24 | 2:21 | 5:28 | 7:17 | 10:23 | 4:58 | 7:15 | 4:39 | 2:11 | 2:02 |
| Checking the result and final report | 1:02 | 1:53 | 1:26 | 1:52 | 0:10 | 0:50 | 0:39 | 2:01 | 0:17 | 0:47 | 1:10 |
| Total from first prompt | 10:39 | 9:10 | 8:40 | 14:16 | 14:58 | 17:19 | 14:06 | 17:31 | 7:40 | 7:38 | 7:31 |
| Blog prompt only | 10:28 | 8:52 | 8:23 | 13:57 | 14:39 | 16:57 | 13:58 | 17:03 | 7:33 | 7:25 | 7:23 |

### Tokens

| Tokens | GPT-5.6-Terra (high) | GPT-6-Luna (high) | GPT-6-Sol (high) | Fable 5.1 (high) | GPT-6-Astra (high) | GPT-5.6-Luna (high) | Sonnet 5 (high) | GPT-5.6-Sol (high) | Sonnet 5.5 (high) | Opus 5.5 (high) | Haiku 4.5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| API requests | 81 | 69 | 64 | 39 | 53 | 138 | 84 | 108 | 45 | 52 | 67 |
| &nbsp;&nbsp;of which subagent requests | 20 | 24 | 22 | 0 | 28 | 29 | 0 | 30 | 0 | 0 | 0 |
| Fresh input | 305,533 | 192,192 | 171,085 | 1,068 | 239,089 | 314,401 | 168 | 228,901 | 90 | 104 | 556 |
| Cache creation | 0 | 0 | 0 | 142,516 | 0 | 0 | 162,777 | 0 | 121,010 | 131,434 | 81,530 |
| Cache read | 4,734,464 | 3,278,848 | 3,089,152 | 3,518,530 | 2,347,648 | 11,007,488 | 9,894,771 | 6,573,568 | 3,764,123 | 4,793,676 | 4,421,441 |
| Output | 25,658 | 24,768 | 15,815 | 50,005 | 18,682 | 40,729 | 69,992 | 32,876 | 44,835 | 44,910 | 29,334 |
| &nbsp;&nbsp;of which thinking | 6,799 | 10,538 | 3,315 | 12,279 | 2,502 | 14,479 | 28,019 | 8,058 | 10,081 | 8,318 | 7,100 |
| Total | 5,065,655 | 3,495,808 | 3,276,052 | 3,712,119 | 2,605,419 | 11,362,618 | 10,127,708 | 6,835,345 | 3,930,058 | 4,970,124 | 4,532,861 |
| Total excluding cache reads | 331,191 | 216,960 | 186,900 | 193,589 | 257,771 | 355,130 | 232,937 | 261,777 | 165,935 | 176,448 | 111,420 |
| Est. API-equivalent cost (USD) | — | — | — | $6.24 | — | — | $3.33 | — | $1.69 | $2.91 | $0.75 |

### Tokens by activity

| Activity | GPT-5.6-Terra (high) | GPT-6-Luna (high) | GPT-6-Sol (high) | Fable 5.1 (high) | GPT-6-Astra (high) | GPT-5.6-Luna (high) | Sonnet 5 (high) | GPT-5.6-Sol (high) | Sonnet 5.5 (high) | Opus 5.5 (high) | Haiku 4.5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Umbraco MCP | 879,099 (17%) | 743,989 (21%) | 459,854 (14%) | 1,153,022 (31%) | 516,510 (20%) | 2,319,687 (20%) | 4,633,577 (46%) | 1,430,706 (21%) | 1,587,605 (40%) | 2,542,329 (51%) | 1,727,845 (38%) |
| Browser (Playwright) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 2,553 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) |
| Coding: migrations | 0 (0%) | 0 (0%) | 0 (0%) | 196,736 (5%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) |
| Coding: site (views, components, models) | 765,573 (15%) | 502,026 (14%) | 659,699 (20%) | 1,086,123 (29%) | 603,183 (23%) | 2,055,996 (18%) | 2,025,688 (20%) | 1,098,172 (16%) | 1,046,572 (27%) | 943,266 (19%) | 623,095 (14%) |
| Build, run & verify | 50,362 (1%) | 67,283 (2%) | 34,370 (1%) | 194,205 (5%) | 38,384 (1%) | 670,713 (6%) | 429,694 (4%) | 168,033 (2%) | 123,384 (3%) | 92,674 (2%) | 296,291 (7%) |
| Other tools | 1,275,441 (25%) | 913,119 (26%) | 781,520 (24%) | 0 (0%) | 965,618 (37%) | 1,237,554 (11%) | 11,404 (0%) | 1,689,417 (25%) | 0 (0%) | 17,133 (0%) | 0 (0%) |
| Base context & reasoning | 2,095,180 (41%) | 1,269,392 (36%) | 1,340,611 (41%) | 1,082,031 (29%) | 479,170 (18%) | 5,078,668 (45%) | 3,027,345 (30%) | 2,449,018 (36%) | 1,172,498 (30%) | 1,374,722 (28%) | 1,885,630 (42%) |

### Tokens by activity, excluding cache reads

| Activity | GPT-5.6-Terra (high) | GPT-6-Luna (high) | GPT-6-Sol (high) | Fable 5.1 (high) | GPT-6-Astra (high) | GPT-5.6-Luna (high) | Sonnet 5 (high) | GPT-5.6-Sol (high) | Sonnet 5.5 (high) | Opus 5.5 (high) | Haiku 4.5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Umbraco MCP | 43,861 (13%) | 45,293 (21%) | 26,766 (14%) | 75,509 (39%) | 39,232 (15%) | 54,400 (15%) | 141,021 (61%) | 48,476 (19%) | 70,804 (43%) | 97,822 (55%) | 53,639 (48%) |
| Browser (Playwright) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 582 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) |
| Coding: migrations | 0 (0%) | 0 (0%) | 0 (0%) | 6,371 (3%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) |
| Coding: site (views, components, models) | 48,165 (15%) | 34,829 (16%) | 28,620 (15%) | 69,873 (36%) | 46,814 (18%) | 64,362 (18%) | 59,538 (26%) | 33,048 (13%) | 66,931 (40%) | 52,004 (29%) | 33,890 (30%) |
| Build, run & verify | 12,782 (4%) | 15,565 (7%) | 6,980 (4%) | 26,860 (14%) | 5,894 (2%) | 39,671 (11%) | 17,000 (7%) | 14,530 (6%) | 14,911 (9%) | 9,437 (5%) | 15,882 (14%) |
| Other tools | 75,972 (23%) | 66,225 (31%) | 64,027 (34%) | 0 (0%) | 135,154 (52%) | 101,170 (28%) | 568 (0%) | 98,178 (38%) | 0 (0%) | 2,516 (1%) | 0 (0%) |
| Base context & reasoning | 150,411 (45%) | 55,049 (25%) | 60,509 (32%) | 14,975 (8%) | 30,095 (12%) | 95,527 (27%) | 14,809 (6%) | 67,545 (26%) | 13,290 (8%) | 14,669 (8%) | 8,009 (7%) |

### Tool calls

| Tool | GPT-5.6-Terra (high) | GPT-6-Luna (high) | GPT-6-Sol (high) | Fable 5.1 (high) | GPT-6-Astra (high) | GPT-5.6-Luna (high) | Sonnet 5 (high) | GPT-5.6-Sol (high) | Sonnet 5.5 (high) | Opus 5.5 (high) | Haiku 4.5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Shell (Bash) | 0 | 0 | 0 | 41 | 0 | 0 | 14 | 0 | 16 | 18 | 6 |
| Shell (PowerShell) | 32 | 30 | 31 | 0 | 23 | 61 | 0 | 40 | 2 | 1 | 15 |
| Umbraco MCP | 37 | 49 | 49 | 53 | 58 | 53 | 58 | 66 | 42 | 60 | 40 |
| Read / Grep / Glob | 0 | 0 | 0 | 2 | 0 | 0 | 26 | 0 | 11 | 8 | 13 |
| Edit / Write | 12 | 14 | 17 | 0 | 21 | 22 | 16 | 20 | 20 | 1 | 19 |
| ToolSearch | 0 | 0 | 0 | 5 | 0 | 0 | 14 | 0 | 4 | 4 | 8 |
| Background task control | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| Other MCP | 2 | 2 | 1 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| &nbsp;&nbsp;Umbraco MCP reads / writes | 17 / 20 | 25 / 24 | 27 / 22 | 24 / 29 | 30 / 28 | 24 / 29 | 18 / 40 | 36 / 30 | 12 / 30 | 21 / 39 | 14 / 26 |
| Total tool calls | 83 | 95 | 98 | 101 | 102 | 136 | 129 | 128 | 95 | 92 | 101 |
| Tool calls per API request | 1.36 | 2.11 | 2.33 | 2.59 | 4.08 | 1.25 | 1.54 | 1.64 | 2.11 | 1.77 | 1.51 |
| Failed tool calls | 9 | 10 | 11 | 10 | 7 | 11 | 7 | 6 | 1 | 2 | 15 |
| Files written with heredocs | 0 | 0 | 0 | 22 files in 3 calls | 0 | 0 | 0 | 0 | 24 files in 2 calls | 24 files in 3 calls | 0 |
| dotnet build (failed) | 2 (0) | 2 (0) | 3 (1) | 3 (0) | 2 (0) | 6 (1) | 1 (0) | 4 (0) | 3 (0) | 2 (1) | 6 (2) |

### Grade

| Category | GPT-5.6-Terra (high) | GPT-6-Luna (high) | GPT-6-Sol (high) | Fable 5.1 (high) | GPT-6-Astra (high) | GPT-5.6-Luna (high) | Sonnet 5 (high) | GPT-5.6-Sol (high) | Sonnet 5.5 (high) | Opus 5.5 (high) | Haiku 4.5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| It works (/35) | 32 | 35 | 35 | 35 | 35 | 34 | 35 | 35 | 35 | 35 | 7 |
| Content modeling (/25) | 17 | 19 | 18 | 25 | 21 | 20 | 25 | 20 | 25 | 25 | 16 |
| Code architecture & conventions (/25) | 24 | 24 | 25 | 25 | 24 | 22 | 23 | 25 | 25 | 25 | 12 |
| Content & presentation (/10) | 6 | 7 | 8 | 9 | 8 | 6 | 5 | 8 | 9 | 10 | 0 |
| Process & honesty (/5) | 5 | 4 | 5 | 5 | 5 | 5 | 3 | 5 | 5 | 4 | 3 |
| Total | 84/100 | 89/100 | 91/100 | 99/100 | 93/100 | 87/100 | 91/100 | 93/100 | 99/100 | 99/100 | 38/100 |
| Automated checks passed | 42/42 | 42/42 | 42/42 | 42/42 | 42/42 | 42/42 | 41/42 | 42/42 | 42/42 | 41/42 | 34/43 |
| Graded by | Opus 5.5 (high) | Opus 5.5 (high) | Opus 5.5 (high) | Opus 5.5 (high) | Opus 5.5 (high) | Opus 5.5 (high) | Opus 5.5 (high) | Opus 5.5 (high) | Opus 5.5 (high) | Opus 5.5 (high) | Opus 5.5 (high) |

#### Runs

- **GPT-5.6-Terra (high)** — `2026-10-02_2106_mcp_gpt-5.6-terra-high`, model `gpt-5.6-terra`, effort high, Claude Code 0.159.0-alpha.12.1, headless (npm run auto, on-request / auto_review / danger-full-access)
  - A clean MCP-built blog with a textbook block rendering pipeline (page → GetBlockGridHtmlAsync → adapter → ViewComponent) and a tidy dark Tailwind design. The content model is thin: each post is one monolithic articleBlock with three short paragraphs, there is no date/excerpt/listing-image metadata, and the front-page cards are title-only.
- **GPT-6-Luna (high)** — `2026-10-02_2132_mcp_gpt-6-luna-high`, model `gpt-6-luna`, effort high, Claude Code 0.159.0-alpha.12.1, headless (npm run auto, on-request / auto_review / danger-full-access)
  - A clean MCP-built blog ('MCP Journal'): a block grid front page (hero + post listing) and two posts. The architecture follows the adapter → ViewComponent → plain view pipeline exactly, and every functional check passes. The content model is thin, though: each post is a hero plus a single rich text block, and that article body renders unstyled because the Tailwind 'prose' classes have no typography plugin behind them.
- **GPT-6-Sol (high)** — `2026-10-02_2156_mcp_gpt-6-sol-high`, model `gpt-6-sol`, effort high, Claude Code 0.159.0-alpha.12.1, headless (npm run auto, on-request / auto_review / danger-full-access)
  - A clean, well-styled MCP-built blog ('The MCP Journal') whose code follows the block pipeline exactly. The content model is thin: three blocks with no image block, each post's body sits in a single rich text block, and posts have no date/excerpt/listing-image properties because the listing reads the first hero block.
- **Fable 5.1 (high)** — `2026-10-02_2207_mcp_fable-5.1-high`, model `claude-fable-5-1`, effort high, Claude Code 2.1.287, headless (npm run auto, auto)
  - A complete, clean MCP-built blog: a block-grid front page with hero and post-card listing, and two substantive MCP posts built from rich text, image and quote blocks, all rendered through textbook adapter + ViewComponent code. The only blemish is one post reusing its header photo as an inline image.
- **GPT-6-Astra (high)** — `2026-10-03_0654_mcp_gpt-6-astra-high`, model `gpt-6-astra`, effort high, Claude Code 0.159.0-alpha.12.1, headless (npm run auto, on-request / auto_review / danger-full-access)
  - Built 'Common Ground', a polished MCP blog: a hero and post-listing front page and two substantive, accurate posts. The site works fully, with media-library crops, a domain and a clean adapter→ViewComponent pipeline. The main weakness is the post model: a property-less header block plus one rich text block per post, and no image block.
- **GPT-5.6-Luna (high)** — `2026-10-03_0713_mcp_gpt-5.6-luna-high`, model `gpt-5.6-luna`, effort high, Claude Code 0.159.0-alpha.12.1, headless (npm run auto, on-request / auto_review / danger-full-access)
  - A clean, convention-following MCP build: blog landing page plus two posts on a block grid with hero, rich text and post-list blocks, rendered through the proper adapter -> ViewComponent pipeline, with a polished dark Tailwind design. It is let down by thin content (each post is a hero plus one short rich text block), no post metadata properties (cards show only CreateDate and title), and missing prose styles.
- **Sonnet 5 (high)** — `2026-10-03_0733_mcp_sonnet-5-high`, model `claude-sonnet-5`, effort high, Claude Code 2.1.287, headless (npm run auto, auto)
  - Textbook MCP build: a clean four-block schema (hero, text, image, quote), correct folders and structure, a correct adapter → ViewComponent pipeline, and a front page plus two posts that render every block from imported Unsplash media. But the Tailwind CSS was built before any view existed, so the site ships unstyled, and the final report claims it is styled.
- **GPT-5.6-Sol (high)** — `2026-10-03_0751_mcp_gpt-5.6-sol-high`, model `gpt-5.6-sol`, effort high, Claude Code 0.159.0-alpha.12.1, headless (npm run auto, on-request / auto_review / danger-full-access)
  - A clean, working MCP-built blog. The front page has a hero and a post-listing block, and two published MCP posts use an article-header block plus one rich text block, all rendered through a textbook adapter -> ViewComponent pipeline with a polished Tailwind design. The points lost are in content modeling: there is no image block, each post body is a single rich text block, and post metadata lives in a block rather than on the post type.
- **Sonnet 5.5 (high)** — `2026-10-03_0812_mcp_sonnet-5.5-high`, model `claude-sonnet-5-5`, effort high, Claude Code 2.1.287, headless (npm run auto, auto)
  - A clean, convention-perfect MCP build: 5 block types, 2 page types, a domain-routed blog front page with a hero and a card listing, and 2 published posts about MCP rendered through the adapter -> ViewComponent pipeline with Tailwind styling. The only shortfall is that the posts are a bit brief.
- **Opus 5.5 (high)** — `2026-10-03_0822_mcp_opus-5.5-high`, model `claude-opus-5-5`, effort high, Claude Code 2.1.287, headless (npm run auto, auto)
  - A complete, polished MCP-built blog. It has 5 reusable blocks, a proper page/block/composition model, a textbook adapter-to-ViewComponent pipeline, a Tailwind design and two substantive, accurate posts about MCP. The only blemish is a small stray outside the project folder (temp files from its own verification).
- **Haiku 4.5** — `2026-10-03_0901_mcp_haiku-4.5`, model `claude-haiku-4-5-20251001`, effort ?, Claude Code 2.1.287, headless (npm run auto, bypassPermissions)
  - Haiku 4.5 built a reasonable skeleton over MCP: correctly foldered doc types, a block grid data type, two posts and imported photos. But nothing renders: content has no template, there is no domain, the post block grids are empty, and the component wiring would fail at runtime. The final report claims a fully working site.
