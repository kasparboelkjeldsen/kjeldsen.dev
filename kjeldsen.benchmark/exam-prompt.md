# Umbraco benchmark — exam

You are grading one benchmark run. A model was given a scaffolded Umbraco site (`Umbraco.Bench` in this folder, rules in its `AGENTS.md` and `UMBRACO-RULES.md`) and asked to build a small blog: a front page listing blog posts and 2 posts about why MCP is awesome. Everything had to be built with the block grid, and the Razor views written as code.

The run belongs to one of three **tests**, which differ only in how schema and content had to be built. `metrics.json` names it in `variant`, and the prompt the model got is in `prompts.prompt2`:

| `variant` | Schema and content had to be built via | Must not use |
|---|---|---|
| `mcp` | the Umbraco MCP server, with Razor written after a restart | migration plans |
| `migrations` | C# migration plans appended to `ProjectMigrationPlan`, which recreate the site on a fresh database | MCP, backoffice, Management API, uSync, direct DB |
| `playwright` | the backoffice UI, driven with the Playwright browser tools, with Razor written after a restart | Management API, migration plans, uSync, direct DB |

Your job:

1. collect the run's metrics
2. run the automated checks and take screenshots
3. inspect the solution and grade it against the rubric below
4. write the grade into the run folder
5. reset Umbraco.Bench to its blank state for the next model

Work from this folder (the bench root, where `package.json` is). **Grading is read-only:** don't fix, rebuild by hand, or "improve" anything in `Umbraco.Bench` before the reset archives it. Grade what is there on its merits. Which model produced it is irrelevant.

## 1. Collect

```
npm run status
npm run collect
```

The run was made either by Claude Code or by Codex (OpenAI models): `provider` in `metrics.json` says which (`anthropic` or `openai`). For a Codex run, `transcript.jsonl` is a Codex rollout, which has its own format. `metrics.json` has the same shape either way, with Codex's shell commands, file edits and MCP calls mapped onto the same categories. A Codex run has no cost figure, because it runs on a subscription. If you were given an explicit `npm run collect -- --transcript …` command, use that instead of a bare `npm run collect`, which only finds Claude Code transcripts.

`collect` finds the newest benchmark session transcript and writes `results/<runId>/metrics.json` (test `variant`, timings, tokens total and `byActivity`, tool calls, `channel` use, the model's final report in `finalReport`, and `warnings`). Note the `runId` it prints; every file you write goes in `results/<runId>/`. If `status` shows the newest run is already graded and the project is pristine, there is nothing to grade: say so and stop.

## 2. Automated checks

```
npm run check
```

This stops Umbraco, runs `dotnet build`, boots the site, snapshots it over the Management API, crawls it, and runs static convention checks. It writes into the run folder:

| File | What it holds |
|---|---|
| `check.json` | Pass/fail list (`checks`), build result, files changed vs the pristine scaffold (`changes`), crawl summary |
| `snapshot.json` | Document types (with folder, properties, compositions, allowed children), data types (incl. block grid config), templates, every document with its values, domains and URLs, media |
| `changes.patch` | Diff of everything the model wrote vs the scaffold (ModelsBuilder output and uSync are excluded) |
| `pages/*.html` | The rendered HTML of every crawled page |
| `build.log` | Build output |

The automated checks are heuristics. Treat each FAIL as a lead to verify and each PASS as probable, not proven. Umbraco is left running on https://localhost:44317. To look deeper:

- `npm run api -- document/<id>` (or any other path under `/umbraco/management/api/v1/`; leave off the leading slash) queries the Management API as the admin API user.
- `curl -sk https://localhost:44317/<path>` fetches a rendered page.
- Read the code in `Umbraco.Bench/Umbraco.Bench.Umbraco/` directly (views, view components, models).

### Screenshots

With Umbraco still running, take full-page screenshots of the front page and one blog post:

```
npm run screenshot
```

They are saved to `screenshots/<model>-<date>-frontpage.png` and `screenshots/<model>-<date>-blogpost.png`, where `<date>` is the run's start, e.g. `opus-5.5-high-2026-09-29_0830-frontpage.png`. The blog post is the first post found in `snapshot.json`. If none is found, or you want a different one, pass `-- --post /its-url/`. If a screenshot fails or shows an error page, note that in the grade; don't fix the site. **Open both images:** they are your main evidence for "Content and presentation".

## 3. Inspect and grade

Read `Umbraco.Bench/AGENTS.md` and `Umbraco.Bench/UMBRACO-RULES.md` first: they define "correct" for this project. Then go through the solution: `changes.patch`, the views and view components, `snapshot.json`, and the rendered pages. Judge presentation from the screenshots, and use the HTML and CSS to explain what you see.

Score each category from 0 to its maximum. Partial credit is expected; the guidance is there to keep graders consistent, not to be applied mechanically. When something breaks a rule, deduct once, in the category where the rule lives, not in every category it touches.

### It works (35)

| Pts | Criterion |
|---|---|
| 5 | `dotnet build` succeeds (0 if it fails; −1 per 10 warnings the model introduced, max −2). |
| 10 | `/` returns 200 and is the blog front page. It lists both posts, links to them work, and each card shows more than a bare title (e.g. date, excerpt, image). |
| 10 | Both posts render fully: every block renders, with no "Could not render component" or exception text. Deduct about 3 per block type that is broken or missing. |
| 5 | Images are the provided Unsplash photos (`Umbraco.Bench/unsplash/`, credits in its README.md), imported into the media library (not hot-linked or served from the folder), and served through `GetCropUrl` URLs that load. Runs graded before 2026-10-02 had to fetch their own Unsplash images. |
| 5 | The site answers on `/` through a domain on the site page (not by accident), and all content is published. |

### Content modeling (25)

| Pts | Criterion |
|---|---|
| 8 | Every document type is filed in the right one of the six folders and is the right kind (element vs document). About −2 per misfiled type. |
| 7 | Page bodies are built with the block grid, on both front page and posts, with a sensible reusable block set (at least rich text, image and one more) whose properties make sense. A single rich text block holding the whole post is a weak model. |
| 5 | Structure: `siteRoot` is the only type allowed at root, allowed children are right (posts under the blog/front page only), templates are assigned, aliases are English camelCase, and custom data types sit in `/Custom/…`. |
| 5 | Hygiene: no content behind a composition. Post metadata (date, excerpt, listing image) are real properties, not hard-coded. No duplicated or orphaned types or data types. |

### Code architecture and conventions (25)

| Pts | Criterion |
|---|---|
| 7 | Pages render blocks with `Html.GetBlockGridHtmlAsync` (or the list variant). There are no custom block loops, renderers, wrapper models or parallel partial folders, and the scaffold's `Views/Partials/blockgrid/*.cshtml` are unchanged or only their markup changed. |
| 6 | One adapter per block at `Views/Partials/blockgrid/Components/<exactAlias>.cshtml`. Each receives `BlockGridItem<T>`, maps to a plain model and calls `Component.InvokeAsync`, with no markup. |
| 7 | One ViewComponent per block, rendering `Views/Shared/Components/<Name>/Default.cshtml`. Plain view models live in `Models/<Folder>/`, and component views have no Umbraco dependencies. |
| 5 | Conventions: `Program.cs` and `appsettings.json` untouched. Migrations are right for the test: none in `mcp`/`playwright`; in `migrations`, appended steps only, shipped steps untouched, and steps that are safe to re-run and create schema before content. `Services/` classes are named `*Service`. No `.cs` directly in `Models/`. Friendly extensions and `GetCropUrl` are used, with no injected URL/image services. Styling goes through the Tailwind pipeline (`wwwroot/dist/site.css`), or the site is at least styled. |

### Content and presentation (10)

| Pts | Criterion |
|---|---|
| — | Repeated images (the `content.noRepeatedImages` check: one page showing the same photo twice, e.g. a header photo again inline) are penalised in content modeling by the scoring script, not here — don't deduct for them again. |
| 6 | Two posts that are actually about why MCP is awesome. They are substantive (several paragraphs each), accurate, spread over several blocks, and use relevant images. |
| 4 | It looks like a real blog: a coherent layout and typography, a proper listing, and readable post pages. |

### Process and honesty (5)

| Pts | Criterion |
|---|---|
| 3 | Built schema and content only through the test's channel (the `process.intendedChannel` check and `channel` in `metrics.json` count MCP, browser, migration, Management API, uSync and database use), and followed the test's order of operations (see `warnings` in `metrics.json`). The model was also told to stay in the project folder and away from memory: the `process.stayedInFolder` check lists memory access and file access outside the project. Looking at the bench's own `results/`, `tests/` or the baseline repo means it may have seen earlier solutions, so treat that as a forbidden shortcut; other stray reads are a small deduction. Check the transcript (`results/<runId>/transcript.jsonl`) if in doubt. A run that quietly used a forbidden shortcut scores 0 here, and loses what that shortcut produced in the other categories too. |
| 2 | The final report (`finalReport` in `metrics.json`) is accurate: it claims nothing that isn't true, and it discloses the things that are broken. |

## 4. Write the grade

Write `results/<runId>/grade.json` exactly in this shape. The category `id`s and `max` values are fixed, and `total` is the sum of the scores:

```json
{
  "runId": "<runId>",
  "grader": "<your model name and effort, e.g. Opus 5.5 (high)>",
  "gradedAt": "<ISO timestamp>",
  "total": 0,
  "max": 100,
  "categories": [
    { "id": "works",        "name": "It works",                        "score": 0, "max": 35, "notes": "" },
    { "id": "modeling",     "name": "Content modeling",                "score": 0, "max": 25, "notes": "" },
    { "id": "architecture", "name": "Code architecture & conventions", "score": 0, "max": 25, "notes": "" },
    { "id": "content",      "name": "Content & presentation",          "score": 0, "max": 10, "notes": "" },
    { "id": "process",      "name": "Process & honesty",               "score": 0, "max": 5,  "notes": "" }
  ],
  "summary": "<one or two sentences: what was built and how well>",
  "strengths": ["<short bullet>"],
  "issues": [{ "severity": "major|minor", "text": "<what is wrong, where (file or URL)>" }]
}
```

Also write `results/<runId>/grade.md`, a readable version for a human skimming results. Include the score table, the summary, the issues with file or URL references, and a short "what it built" section: the document types, blocks, pages, and how the front page and posts look. Embed both screenshots in that section with relative links (`![Front page](../../screenshots/<file>.png)`).

Then run `npm run report` and confirm the new run's grade appears in the Grade table.

## 5. Reset

```
npm run reset
```

This stops Umbraco, archives the solution in the baseline repo as `refs/runs/<runId>`, and restores `Umbraco.Bench` to the pristine scaffold (no database, no build output, set up for the MCP test again). It refuses to run if `grade.json` is missing. Finish with `npm run status`, which should say **pristine**. Then reply with the total score, the summary, and the top issues.
