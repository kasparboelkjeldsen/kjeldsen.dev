# Opus 5.5: high vs ultracode

Same model, same MCP test, same day (2026-09-29). Both graded by Fable 5.1.

| | High | Ultracode | Ratio |
|---|---:|---:|---:|
| **Grade** | 97 / 100 | 99 / 100 | +2 |
| **Total time** | 7:33 | 16:05 | 2.1x |
| **Tokens, excluding cache reads** | 164,228 | 539,993 | 3.3x |
| Tokens, total | 4,453,380 | 12,741,032 | 2.9x |
| Output tokens | 41,792 | 76,633 | 1.8x |
| Requests | 42 | 118 (51 in subagents) | 2.8x |

## Grade by category

| Category | High | Ultracode |
|---|---:|---:|
| It works (/35) | 35 | 35 |
| Content modeling (/25) | 24 | 24 |
| Code architecture & conventions (/25) | 24 | 25 |
| Content & presentation (/10) | 9 | 10 |
| Process & honesty (/5) | 5 | 5 |

## Where the difference came from

- **Architecture +1:** ultracode put the post query in `BlogPostService`; high did the query in the post list adapter.
- **Content +1:** ultracode's posts are about 470 and 490 words; high's are about 300 each.
- **Time:** modeling and content took about the same in both runs (roughly 4 to 5 minutes). The extra time is in the Razor phase, 10:12 against 2:29, which includes the review workflow (about 3.5 minutes, 7 subagents) and the rebuild after it.
- **The review itself** found one low-severity bug, which was fixed. Neither of the two extra points came from it.

Runs: `2026-09-29_0959_mcp_opus-5.5-high` and `2026-09-29_1422_mcp_opus-5.5-high` (the second is the ultracode run, despite the folder name).
