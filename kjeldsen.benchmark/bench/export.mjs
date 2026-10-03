// npm run export [-- --out <file.csv>] [--include-excluded]
// One row per graded run across the current results and every archived sweep, for charts: grade and its categories,
// honesty, score, time per phase, cost, tokens and tool calls. Default output: archive/runs.csv.
import fs from "node:fs";
import path from "node:path";
import { ROOT, parseArgs } from "./lib/common.mjs";
import { allRuns, scoreRuns } from "./lib/score.mjs";

const args = parseArgs();
const book = JSON.parse(fs.readFileSync(path.join(ROOT, "run-book.json"), "utf8"));
const out = path.resolve(ROOT, typeof args.out === "string" ? args.out : "archive/runs.csv");

// scores are computed over every sweep together, the same as npm run score -- --all
const { rows, headline } = scoreRuns(allRuns({ archived: true }), book);
const PHASES = ["prompt1", "Boot, read rules, plan → first type created", "Content modeling", "Content: media, pages, publish",
  "Stop, build, Razor, restart", "Checking the result and final report"];
const CATS = ["works", "modeling", "architecture", "content", "process"];

const cols = ["sweep", "runId", "provider", "model", "label", "effort", "excluded", "grade", ...CATS.map(c => `grade_${c}`),
  "repeatedImagePenalty", "quality", "honesty", "honestyFactor", "efficiencyPoints", "score",
  "blogPromptMinutes", ...PHASES.map((p, i) => `phase${i}_minutes`), "costUsd", "claudeCodeCostUsd",
  "apiRequests", "tokensTotal", "tokensExclCacheRead", "outputTokens", "toolCalls", "umbracoMcpCalls", "umbracoMcpWrites"];
const esc = v => v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
const r2 = v => v == null ? null : Math.round(v * 100) / 100;

const lines = [cols.join(",")];
for (const x of rows) {
  if (x.excluded && !args["include-excluded"]) continue;
  const m = x.run.metrics, cat = id => x.run.grade.categories?.find(c => c.id === id)?.score;
  const phase = key => m.time.phases?.find(p => p.key === key)?.ms;
  const row = {
    sweep: x.run.sweep, runId: x.run.id, provider: m.provider || "anthropic", model: m.model.id, label: x.label, effort: m.effort ?? "",
    excluded: x.excluded ?? "", grade: x.grade, ...Object.fromEntries(CATS.map(c => [`grade_${c}`, cat(c)])),
    repeatedImagePenalty: x.imagePenalty, quality: x.quality, honesty: x.level, honestyFactor: x.honesty,
    efficiencyPoints: r2(x.efficiency[headline]), score: r2(x.score[headline]),
    blogPromptMinutes: r2(x.minutes), ...Object.fromEntries(PHASES.map((p, i) => [`phase${i}_minutes`, r2((phase(p) ?? null) / 60000)])),
    costUsd: r2(x.usd), claudeCodeCostUsd: r2(x.cliUsd),
    apiRequests: m.tokens?.requests, tokensTotal: m.tokens?.total, tokensExclCacheRead: m.tokens?.totalExclCacheRead, outputTokens: m.tokens?.output,
    toolCalls: m.tools?.total, umbracoMcpCalls: m.channel?.umbracoMcpCalls, umbracoMcpWrites: m.channel?.umbracoMcpWrites,
  };
  lines.push(cols.map(c => esc(row[c])).join(","));
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join("\n") + "\n");
console.log(`${lines.length - 1} run(s) → ${path.relative(ROOT, out)} (score at ${headline} efficiency points per doubling)`);
