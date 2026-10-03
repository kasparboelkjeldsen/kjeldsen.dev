# Umbraco benchmark

A repeatable model sweep over one task: build a small block-grid blog in the Umbraco.Bench scaffold. It comes in three tests: through the Umbraco MCP server (the main one), with C# migration plans, or by clicking through the backoffice with Playwright. It is meant to be helpful rather than scientific, so a single run per model is fine.

- **[prompt.md](prompt.md)**: the run sheet. The prompts you paste are in [tests/](tests/).
- **[exam-prompt.md](exam-prompt.md)**: paste into a high-effort Opus or Fable session in this folder. It grades the run and resets to blank.
- `npm run report` compares all the runs.

## Results so far

Two full sweeps of the MCP test (2026-10-02 overnight and 2026-10-03 daytime): four Anthropic models through Claude Code, six OpenAI models through Codex, and Haiku 4.5 in the first sweep plus nine extra runs of its own.

- **[archive/scoreboard-all.md](archive/scoreboard-all.md)**: the scoreboard across every sweep, with per-model averages.
- **[archive/runs.csv](archive/runs.csv)**: one row per graded run (grades per category, honesty, score, time per phase, cost, tokens, tool calls), for charts.
- **[blog-guide.md](blog-guide.md)**: a guided tour of the data: the results tables, the patterns, the caveats and where the stories are.
- **[archive/sweeps/2026-10-02-night/extra/HAIKU-NOTES.md](archive/sweeps/2026-10-02-night/extra/HAIKU-NOTES.md)**: Haiku 4.5's ten runs, two of which served a working site.

Each run folder under `archive/sweeps/<sweep>/results/` has the grader's write-up (`grade.md`, `grade.json`), the honesty check (`honesty.json`), `metrics.json` (time, tokens, tools and the model's own final report), the automated `check.json`, a `snapshot.json` of everything the model built in Umbraco, the code it wrote as `changes.patch`, and the rendered `pages/`. Session transcripts, raw CLI streams and screenshots are not published here; [.gitignore](.gitignore) keeps them out.

## Running it yourself

This folder lives inside the kjeldsen.dev repository, but the benchmark assumes it is on its own. Copy it somewhere **outside any git repository** before running it. Inside this repo, the model under test would find the site's `.git` and its `CLAUDE.md` / `AGENTS.md` in the parent folders, which breaks the clean room.

In the copy, run `npm run baseline` once on the pristine `Umbraco.Bench` to record the blank state (the baseline repo isn't published), then `npm run status`.

## Commands

All zero-dependency Node (needs Node 20+, git, and the .NET SDK).

| Command | Does |
|---|---|
| `npm run auto -- --model <m>[:effort]` | **Hands-off run**: setup, boot, prompts 1 and 2 in a headless Claude Code session, collect, grade, reset, report. See [Autonomous runs](#autonomous-runs) |
| `npm run status` | Baseline, project state, Umbraco up/down, runs and whether they're graded, and what to do next |
| `npm run setup -- <mcp\|migrations\|playwright>` | Set up the pristine project for a test: `mcp` keeps the Umbraco MCP server, `migrations` removes `.mcp.json`, `playwright` swaps in `@playwright/mcp`. Reset returns to `mcp` |
| `npm run up` / `npm run down` | Start Umbraco in the background (waits until the MCP user can log in), or stop it |
| `npm run collect` | Newest benchmark transcript → `results/<runId>/metrics.json` + a copy of the transcript. `--session <id>` or `--transcript <file>` picks a specific session; `--include-followups` counts prompts after the blog prompt's turn |
| `npm run check` | Build, boot, API snapshot, crawl and convention checks → `check.json`, `snapshot.json`, `changes.patch`, `pages/` in the run folder |
| `npm run screenshot` | Full-page screenshots of the front page and a blog post of the running site (installed Edge) → `screenshots/<model>-<date>-frontpage.png` / `-blogpost.png`. `--post /url/` picks the post |
| `npm run api -- <path>` | Management API GET as the MCP admin user, e.g. `npm run api -- tree/document/root` |
| `npm run reset` | Archive the solution as `refs/runs/<runId>`, restore the pristine scaffold. Refuses without a `grade.json` unless `--force` |
| `npm run report` | Comparison tables → `results/report.md` and `results/report.txt`. Defaults to the newest run per model and effort; `--runs a,b` or `--all` to choose |
| `npm run baseline` | Record the current `Umbraco.Bench` as the blank state. Already done; re-run with `--force` only after deliberately changing the scaffold (e.g. AGENTS.md) |

## Autonomous runs

`npm run auto` does the whole run sheet without a human, using the Claude Code CLI in headless mode (`claude -p`).

With no parameters it sweeps what [run-book.json](run-book.json) says: the test (`run`), the effort and the models (`anthropic`), the grader and a few options. The file's `comments` object explains each field and lists the valid model IDs. Any flag below overrides the matching run-book field.

```
npm run auto                                                  # the run-book sweep
npm run auto -- --model opus --effort high                    # one run of the MCP test
npm run auto -- --model opus:high,sonnet:high,haiku --test mcp,migrations   # a sweep, one run after another
npm run auto -- --grade-only                                  # grade (and reset) the newest ungraded run
npm run auto -- --model fable:high --dry-run                  # show the CLI, auth and plan, start nothing
```

Per run it:

1. refuses to start unless `Umbraco.Bench` is pristine, then runs `setup` for the test and `up`
2. starts **one** CLI process in `Umbraco.Bench` and feeds it the prompts from `tests/<test>.md` over stdin, so prompt 1 and prompt 2 share a session and an MCP connection, exactly like a session typed by hand
3. after prompt 1, checks the model made at least one successful call to the test's MCP server (Umbraco or Playwright), or stops before wasting the blog prompt; then `down` and prompt 2
4. `collect` for that exact session, plus `auto.json` (CLI version, permission mode, per-prompt cost and duration) and `claude-stream.jsonl` (the raw CLI output) in the run folder
5. a second headless session in this folder (`--grader`, default Opus at high effort) follows `exam-prompt.md`: check, screenshots, grade, reset. The runner then verifies `grade.json` exists and the project is pristine before the next run
6. `report` at the end

Live progress (each tool call, with elapsed time) prints as it goes; Ctrl+C stops the session and Umbraco.

**The session under test is a clean room.** It loads only the project's own settings (`--setting-sources project,local`, so no user plugins, hooks or default model) and only the test's MCP servers (`--strict-mcp-config --mcp-config Umbraco.Bench/.mcp.json`, so no claude.ai connectors). Environment variables from a parent Claude Code session (`CLAUDECODE`, `CLAUDE_EFFORT`, `MCP_CONNECTION_NONBLOCKING`, …) are stripped, so it is safe to start a run from inside Claude Code.

**fnm.** If `~/.bashrc` runs `fnm env --use-on-cd`, `cd` is aliased to fnm's hook. Claude Code's Bash tool gets the alias but not fnm's variables, so `cd` into a folder where fnm resolves a Node version (e.g. `Umbraco.Bench.Frontend`) fails with "We can't find the necessary environment variables". The runner therefore passes fnm's environment (`fnm env --json`) to the sessions it starts. Claude runs before 2026-10-02 22:00 had this handicap; Codex (PowerShell) never did.

**Permission mode** is `auto` by default (what the manual runs used); `--permission-mode` changes it. Nothing can answer a permission prompt, so anything that would prompt is denied (`--permission-prompts none`) and shows up as a failed tool call. If the CLI starts in a different mode than asked, the session is stopped before the model does anything. Auto mode isn't available to every model: Haiku 4.5 starts in `default`, which headless denies every write. So Haiku (and any other model that comes up in `default`, on its retry) runs with `bypassPermissions`, recorded as `permissionFallback` in `auto.json`.

| Option | Default | |
|---|---|---|
| `--runbook` | `run-book.json` | Another run-book file |
| `--model` | run-book `anthropic.models` | Alias (`opus`, `sonnet`, `fable`, `haiku`) or full model ID (`sonnet-5-5` gets `claude-` added). Comma-separate for a sweep; `model:effort` per entry. Haiku never gets an effort |
| `--effort` | run-book `anthropic.effort` | `low`, `medium`, `high`, `xhigh` or `max`, for entries without their own |
| `--test` | run-book `run`, else `mcp` | `mcp`, `migrations`, `playwright`, or a comma list (every model × every test) |
| `--grader`, `--grader-effort` | run-book `grader`, else `opus`, `high` | The grading session |
| `--no-grade` | | Stop after collect (single run only, since the project isn't reset) |
| `--timeout` | run-book `options.timeoutMinutes`, else `90` | Minutes for the blog prompt before the session is killed |
| `--budget` | run-book `options.budgetUsd` | `--max-budget-usd` for each session |
| `--permission-mode` | run-book `options.permissionMode`, else `auto` | For both sessions |
| `--claude` | | Path to the CLI. Otherwise `BENCH_CLAUDE`, `claude` on PATH, `~/.local/bin`, then the copy bundled with the desktop app |

**Unattended sweeps.** A sweep doesn't stop at the first problem:
- **Before the blog prompt** (boot, MCP check, the CLI itself): the attempt is archived as `refs/runs/failed-<model>-<time>`, the project is reset, and the run is tried once more.
- **During the blog prompt** (timeout or an error): that's the model's result, so it is collected and graded as it stands.
- **Usage limits:** a run that hits its plan's limit is discarded (`refs/runs/limited-…`) and requeued until the limit resets, while the other provider's models run meanwhile.
  - Codex reports its limits (`account/rateLimits/read`: % of the 5-hour and weekly windows, and when they reset). A Codex run only starts at ≤ `options.codexMaxUsedPercent` (75%) of the 5-hour window.
  - Claude has no such report, so it is retried every 30 minutes.
- **Grading** that fails is retried once; after that the run stays ungraded, with its code archived under its own id.
- **Leftovers:** a project left dirty by an earlier run gets that run graded first.
- **Sweep log:** progress goes to `results/sweep-<time>.json` (done, queued, waiting until).
- **Sleep:** the runner asks Windows not to sleep while it runs (`SetThreadExecutionState`, held only for the process's lifetime, no power settings changed).
- **Grader label:** the runner writes the grader's real model and effort into `grade.json`. The grader's own label can be wrong; it once said "low" for a high-effort session.

**OpenAI models run through Codex.** Model names starting with `gpt` (or the run-book's `openai.models`) go to the Codex CLI instead: one `codex app-server` process per run, fed the same prompts over JSON-RPC. Plain `codex exec` + `exec resume` won't do, because a resumed session starts its MCP servers while Umbraco is down and their tools never appear.
- **MCP servers:** they come from the same `Umbraco.Bench/.mcp.json`, translated to `-c mcp_servers.…` and launched through `cmd.exe /d /c` (a bare `npx` silently never starts on Windows), with `cwd` = `Umbraco.Bench`.
- **Clean room:** the desktop app's plugins, apps, browser and computer use are switched off (`--disable …`), and so are the MCP servers in `~/.codex/config.toml`.
- **Permissions:** full access with Codex's own automatic reviewer, the closest match to Claude Code's `auto` mode. Codex's workspace sandbox blocked the network even with `network_access=true`.
- **Prompt-1 check:** the Umbraco server must report itself connected with tools, rather than the model having called it. Codex finds MCP tools through its own tool search, and a model may answer without looking.
- **Metrics:** the rollout (`~/.codex/sessions/…/rollout-*-<thread>.jsonl`) gives the same `metrics.json` as a Claude transcript (`bench/lib/codex-rollout.mjs`), minus cost.
- **Grading** is always Claude Code.

The Codex CLI comes with the Codex desktop app (`%LOCALAPPDATA%\OpenAI\Codex\bin\<hash>\codex.exe`) or `codex` on PATH, or `--codex <path>` / `BENCH_CODEX`. It uses the app's ChatGPT login.

The CLI has to be logged in on its own (`claude auth login`), or `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`) or `ANTHROPIC_API_KEY` set; `--dry-run` shows which. Headless runs report `entrypoint: sdk-cli` in `metrics.json`, and their time has no waiting on a human in it.

## Scoring and archiving

```
npm run honesty                    # one Opus honesty check per graded run (results/<run>/honesty.json)
npm run score                      # results/scoreboard.md: this sweep
npm run archive -- --name 2026-10-03-night   # file the sweep under archive/sweeps/, empty results/ for the next
npm run score -- --all             # archive/scoreboard-all.md: every sweep, plus per-model averages across nights
npm run export                     # archive/runs.csv: one row per graded run (grades, honesty, score, phases, cost, tokens) for charts
```

**Score = (Quality + Efficiency) × Honesty** (weights and prices in `run-book.json` `scoring` and `pricing`):
- **Quality:** the grade minus 4 per page that shows the same image twice, at most −8. The check is `content.noRepeatedImages`; crops of one photo count as the same image, and a post's image on its own card in a listing doesn't count.
- **Honesty:** a multiplier on the whole score: honest ×1.00, overstated ×0.95, false-claim ×0.80, misleading ×0.60. `npm run honesty` checks every run's final report against the same rubric, using check.json, the snapshot, the pages, the screenshots and the grade. A read-only Opus session (`--tools Read,Grep,Glob`) does the checking.
- **Efficiency:** bounded points: −3 per doubling of blog-prompt time and −3 per doubling of cost relative to the median of the scored runs (positive when below the median), capped at ±5. It can only separate runs of similar quality (a cap of 10 let a $0.07 run graded 94 outrank a 99, so it was tightened on 2026-10-03). Model costs span about 125× ($0.05 to $6.24 per run), and a multiplicative cost factor let a cheap 89 outrank a 99, so the bound is deliberate.
  - **Time** is the blog prompt only.
  - **Cost** is the run's own tokens at published API prices: fresh input, cache writes (1-hour or 5-minute), cache reads and output. This prices Codex runs too, which report no cost. For Claude runs it matches Claude Code's own estimate to the cent.
  - **The table** shows 0, 3 and 5 points per doubling, ranked at 3.
- **Excluded runs:** a run with `flags.json` `{"excludeFromScore": true, "reason": "…"}` is listed but not scored, e.g. the two Claude runs that had the fnm `cd` handicap.

`archive/sweeps/<name>/` holds `results/`, `screenshots/`, `extra/` (ungraded runs from `results-extra/`), a copy of `run-book.json` and `manifest.json` (every run's model, effort, grade, honesty level, CLI version and permission mode). Archiving refuses while a run is in progress or ungraded.

## Where things live

```
Umbraco.Bench/          the scaffold under test (pristine between runs)
  unsplash/             the ten photos every run uses (credits in its README.md); .mcp.json lets the MCP server upload from here
                        (UMBRACO_ALLOWED_MEDIA_PATHS), and appsettings.Development.json pins Imaging.HMACSecretKey so the
                        first boot doesn't write one into appsettings.json
tests/                  the prompts for each test
bench/                  the scripts (bench/lib/variants.mjs defines the tests)
bench/.baseline-git/    git repo holding the pristine scaffold + every run's solution (refs/runs/*)
results/<runId>/        metrics.json, transcript.jsonl, check.json, snapshot.json, changes.patch, pages/, grade.json, grade.md
results/report.md|txt   the comparison
screenshots/            front page + blog post per run (taken by the grader)
```

The baseline repo sits outside `Umbraco.Bench`, so the model under test never sees a `.git` folder. To look at an old run's code:

```
git --git-dir=bench/.baseline-git show --stat refs/runs/<runId>
git --git-dir=bench/.baseline-git diff baseline refs/runs/<runId> -- Umbraco.Bench.Umbraco/Views
```

The database and media aren't archived (they're git-ignored). `snapshot.json` and `pages/` are the record of the content.

## How the numbers are made

Everything comes from the Claude Code session transcript (`~/.claude/projects/<Umbraco.Bench's path with every non-alphanumeric character as "-">/<session>.jsonl`, e.g. `C--code-benchmark-Umbraco-Bench`), so the model under test doesn't report on itself.

- **Tokens**: summed per API request, taken from each response's `usage`. Subagent sessions are included.
- **Tokens by activity** (the "MCP vs coding" split). Every tool call is given an activity:
  - Umbraco MCP
  - Browser (Playwright)
  - Coding: migrations
  - Coding: site
  - Build, run & verify
  - Web research
  - Other

  Shell commands are classified by what they do: heredoc writes and reads count as coding, while `dotnet`, `curl` and process control count as build/run. Each API request's tokens are then split three ways:
  - **Output** goes to the tool calls it emitted, weighted by their size.
  - **Fresh input and cache creation**, the context added since the previous request, go to the tool results and output that make up that new context.
  - **Cache reads**, where the whole context is re-read, follow the activity mix of everything in the context so far.

  "Base context & reasoning" is the system prompt, rules and prompts, plus turns that call no tools. The categories always add up to the total. The split is an estimate, but good for comparing one run with another. "Excluding cache reads" is the sharper view, because cache reads are dominated by re-reading the base context.
- **Tool calls**: counted from `tool_use` blocks; failures are `tool_result`s with `is_error`.
- **Channel**: counts of Umbraco MCP writes, browser calls, migration file writes, and shell calls to the Management API or database. `check` turns them into a pass or fail on whether the run stuck to its test.
- **Phases** of the blog prompt depend on the test. The last phase is always "checking the result and final report", which starts after the last change (file write, build, `dotnet run` or MCP write).

  | Test | Phase boundaries |
  |---|---|
  | MCP | first MCP schema write → first MCP content write → first stop/build/`.cshtml`/`.cs` write → last change |
  | Migrations | first migration file written → first build/run → first `.cshtml` write → last change |
  | Playwright | first browser action → first stop/build/`.cshtml`/`.cs` write → last change |

  If a boundary isn't found, that phase collapses to 0 and `metrics.json` gets a warning.
- **Time** is wall-clock. It includes waiting on permission prompts, so keep the permission mode the same across runs.
- **Est. cost** is Claude Code's own API-equivalent figure for the whole session. It's only shown when nothing else happened in that session.
