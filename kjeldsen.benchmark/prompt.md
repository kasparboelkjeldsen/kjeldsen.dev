# Umbraco benchmark — run sheet

## Hands-off run (asleep edition)

```
npm run auto
```

That's the whole of the steps below, for every model in [run-book.json](run-book.json): setup, boot, both prompts in a headless Claude Code session, collect, grade, reset, and the report at the end. Edit the run-book to change the test, effort or models, or override it for one go with `--model opus:high --test migrations`. Options and caveats are in [README.md](README.md#autonomous-runs).

## Quick run (tired edition)

You need two VS Code windows:
- **Bench** is this folder (`package.json`). The terminal and the grader live here.
- **Test** is `Umbraco.Bench` inside it. The model under test lives here, and it has to be this folder or the MCP server won't load.

Run the `npm` lines in the Bench window's terminal.

1. `npm run status` should say **Project pristine**. If it doesn't, the last run still needs grading: do step 7 first.
2. `npm run setup -- mcp` (or `migrations` / `playwright`).
3. `npm run up`, and wait for **Ready**.
4. Test window: open a new Claude session, pick the model with `/model`, and set the effort.
5. Open `tests/<test>.md`:
   - **mcp / playwright:** paste **Prompt 1** and wait. Then `npm run down` and paste **Prompt 2**.
   - **migrations:** `npm run down`, then paste **Prompt 2**.
6. Hands off until it's finished. Don't reply to it, and don't chat in that session afterwards.
7. Bench window: open a new Claude session (Opus or Fable, high effort) and send `Follow exam-prompt.md`. It grades the run and resets everything.
8. `npm run report`. The tables are in `results/report.md` and `results/report.txt`.

Next model: back to step 1.

---

## The tests

Every test has the same goal: a block-grid blog with 2 posts about MCP. What differs is how schema and content get built:

| Test | Schema and content via | Prompts |
|---|---|---|
| **MCP** (main) | Umbraco MCP server | [tests/mcp.md](tests/mcp.md) |
| **Migrations** | C# migration plans, no MCP | [tests/migrations.md](tests/migrations.md) |
| **Playwright** | Clicking through the backoffice in a browser | [tests/playwright.md](tests/playwright.md) |

## Details

- **`npm run up`** boots Umbraco in the background. The first boot installs the database, which takes about a minute and happens outside the timing.
- **Keep sessions consistent:** use the same permission mode and effort handling for every run. Approve the project's MCP server if the Test window asks; the approval is kept between runs.
- **Clean room:** Claude memory is off for Umbraco.Bench (`Umbraco.Bench/.claude/settings.json`), and prompt 2 asks the model to stay inside the project folder. The grader's `process.stayedInFolder` check reports memory use and file access outside the project.
- **Where results go:** grading collects the run into `results/<date>_<time>_<test>_<model>/` (metrics, transcript copy, checks, grade). The reset archives the model's code as `refs/runs/<runId>` (see README.md).
- **Stuck?** `npm run status` always says what to do next.
