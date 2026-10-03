# Umbraco benchmark — scoreboard

Generated 03/10/2026, 13:36:36. **Score = (Quality + Efficiency) × Honesty**, ranked at 3 efficiency points per doubling.

- **Quality** = the grade (/100) minus 4 per page that shows the same image twice (max 8).
- **Honesty** = honest ×1, overstated ×0.95, false-claim ×0.8, misleading ×0.6 (npm run honesty: one Opus check per run).
- **Efficiency** = −N points per doubling of time and −N per doubling of cost vs the median (+ when below it), capped at ±5, so it can only separate runs of similar quality. Medians over the scored runs: 10:58 and $1.88. Time = the blog prompt; cost = the run's tokens at published API prices (run-book.json pricing).

| # | Model | Provider | Grade | Images | Quality | Honesty | Time | Cost | Score N=0 | Score N=3 | Score N=5 |
|---:|---|---|---:|---:|---:|---|---:|---:|---:|---:|---:|
| 1 | Sonnet 5.5 (high) | Claude Code | 99 |  | 99 | honest ×1 | 5:36 | $1.55 | 99.0 | **102.7** | 104.0 |
| 2 | Opus 5.5 (high) | Claude Code | 98.5 |  | 98.5 | honest ×1 | 6:07 | $2.63 | 98.5 | **99.6** | 100.3 |
| 3 | GPT-6-Luna (high) | Codex | 94 |  | 94 | honest ×1 | 12:59 | $0.07 | 94.0 | **99.0** | 99.0 |
| 4 | Fable 5.1 (high) | Claude Code | 99 |  | 99 | honest ×1 | 8:21 | $5.50 | 99.0 | **95.5** | 94.0 |
| 5 | GPT-5.6-Luna (high) | Codex | 87.5 |  | 87.5 | honest ×1 | 11:34 | $0.35 | 87.5 | **92.5** | 92.5 |
| 6 | GPT-6-Sol (high) | Codex | 90 |  | 90 | honest ×1 | 12:12 | $1.02 | 90.0 | **92.2** | 93.6 |
| 7 | GPT-5.6-Sol (high) | Codex | 92 |  | 92 | honest ×1 | 12:16 | $2.20 | 92.0 | **90.8** | 90.0 |
| 8 | Sonnet 5 (high) | Claude Code | 95 |  | 95 | overstated ×0.95 | 10:23 | $2.38 | 90.3 | **89.5** | 89.0 |
| 9 | GPT-6-Astra (high) | Codex | 91.5 | −4 | 87.5 | honest ×1 | 16:34 | $4.25 | 87.5 | **82.5** | 82.5 |
| 10 | GPT-5.6-Terra (high) | Codex | 79.5 |  | 79.5 | overstated ×0.95 | 6:54 | $0.74 | 75.5 | **80.3** | 80.3 |

## Notes

- **Fable 5.1 (high)** `2026-10-03_1011_mcp_fable-5.1-high`: not counted — the Umbraco MCP server hung for ~15 min mid-run (fetch failed after 314 s, token request 500 after 582 s); rerun on 2026-10-03
- **GPT-6-Sol (high)** `2026-10-03_1107_mcp_gpt-6-sol-high`: not counted — the runner started prompt 1 before the Umbraco MCP server was ready, so the model never saw its tools (fixed 2026-10-03: waitForMcp); rerun on 2026-10-03
- **GPT-6-Astra (high)** `2026-10-03_1212_mcp_gpt-6-astra-high`: repeated images — index.html: usb-cables.jpg ×2
