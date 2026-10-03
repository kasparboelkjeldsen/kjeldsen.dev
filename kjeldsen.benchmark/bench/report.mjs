// npm run report [-- --runs <id,id,…>] [--all]
// Builds the comparison tables from results/*/metrics.json (+ grade.json, check.json): one section per test
// comparing models, plus a cross-test summary. Default: the newest run per test/model/effort.
// Writes results/report.md and results/report.txt (tab-separated, pastes cleanly).
import fs from "node:fs";
import path from "node:path";
import { RESULTS, parseArgs, listRuns, fmtDuration, fmtInt, pct } from "./lib/common.mjs";
import { VARIANTS } from "./lib/variants.mjs";
import { ACTIVITIES } from "./lib/transcript.mjs";

const args = parseArgs();
let runs = listRuns();
for (const r of runs) r.metrics.variant ??= "mcp";
if (args.runs) {
  const sel = String(args.runs).split(",").map(s => s.trim()).filter(Boolean);
  runs = sel.map(s => runs.filter(r => r.id === s || r.id.includes(s)).at(-1)).filter(Boolean);
} else if (!args.all) {
  const latest = new Map();
  for (const r of runs) latest.set(`${r.metrics.variant}|${r.metrics.model.id}|${r.metrics.effort}`, r);
  runs = [...latest.values()].sort((a, b) => a.metrics.startedAt.localeCompare(b.metrics.startedAt));
}
if (!runs.length) { console.error("No runs to report. Run npm run collect first."); process.exit(1); }

const signedInt = n => (n < 0 ? "−" : n > 0 ? "+" : "") + fmtInt(Math.abs(n));
const diffTime = (a, b, withPct = false) => {
  if (a == null || b == null) return "—";
  const s = (b - a < 0 ? "−" : "+") + fmtDuration(Math.abs(b - a));
  return withPct ? `${s} (${pct(a, b)})` : s;
};
const share = (v, total) => total ? `${fmtInt(v)} (${Math.round((100 * v) / total)}%)` : fmtInt(v);

function makeLabels(rs, withTest = false) {
  const efforts = new Set(rs.map(r => r.metrics.effort));
  let labels = rs.map(r => r.metrics.model.name + (efforts.size > 1 && r.metrics.effort ? ` (${r.metrics.effort})` : "") + (withTest ? ` · ${VARIANTS[r.metrics.variant].name}` : ""));
  return labels.map((l, i) => labels.filter(x => x === l).length > 1 ? `${l} · ${rs[i].id.slice(5, 15).replace("_", " ")}` : l);
}

// ---------------------------------------------------------------- one test, several models
function sectionTables(rs) {
  const labels = makeLabels(rs);
  const two = rs.length === 2;
  const M = rs.map(r => r.metrics);
  const tables = [];

  // time
  const phaseLabels = [...new Set(M.flatMap(m => m.time.phases.map(p => p.label)))];
  const timeRows = phaseLabels.map(label => {
    const vals = M.map(m => m.time.phases.find(p => p.label === label)?.ms);
    return [label, ...vals.map(fmtDuration), ...(two ? [diffTime(vals[0], vals[1])] : [])];
  });
  for (const [label, get] of [["Total from first prompt", m => m.time.totalMs], ["Blog prompt only", m => m.time.blogPromptMs]]) {
    const vals = M.map(get);
    timeRows.push([label, ...vals.map(fmtDuration), ...(two ? [diffTime(vals[0], vals[1], true)] : [])]);
  }
  tables.push({ title: "Time", head: ["Phase", ...labels, ...(two ? ["Difference"] : [])], rows: timeRows });

  // tokens
  const defs = [
    ["API requests", m => m.tokens.requests],
    ["Fresh input", m => m.tokens.input],
    ["Cache creation", m => m.tokens.cacheCreate],
    ["Cache read", m => m.tokens.cacheRead],
    ["Output", m => m.tokens.output],
    ["  of which thinking", m => m.tokens.thinking],
    ["Total", m => m.tokens.total],
    ["Total excluding cache reads", m => m.tokens.totalExclCacheRead],
  ];
  const tokRows = defs.map(([label, get]) => {
    const vals = M.map(get);
    return [label, ...vals.map(fmtInt), ...(two ? [signedInt(vals[1] - vals[0]), pct(vals[0], vals[1])] : [])];
  });
  if (M.some(m => m.tokens.subagentRequests)) tokRows.splice(1, 0, ["  of which subagent requests", ...M.map(m => fmtInt(m.tokens.subagentRequests)), ...(two ? ["", ""] : [])]);
  if (M.some(m => m.estimatedSessionCostUSD != null)) {
    const vals = M.map(m => m.estimatedSessionCostUSD);
    const both = two && vals[0] != null && vals[1] != null;
    tokRows.push(["Est. API-equivalent cost (USD)", ...vals.map(v => v == null ? "—" : "$" + v.toFixed(2)),
      ...(both ? [(vals[1] - vals[0] < 0 ? "−$" : "+$") + Math.abs(vals[1] - vals[0]).toFixed(2), pct(vals[0], vals[1])] : two ? ["", ""] : [])]);
  }
  tables.push({ title: "Tokens", head: ["Tokens", ...labels, ...(two ? ["Difference", "Change"] : [])], rows: tokRows });

  // tokens by activity
  for (const [title, key, totalKey] of [["Tokens by activity", "total", "total"], ["Tokens by activity, excluding cache reads", "totalExclCacheRead", "totalExclCacheRead"]]) {
    const acts = Object.keys(ACTIVITIES).filter(a => M.some(m => m.tokens.byActivity?.[a]?.[key]));
    if (!acts.length) continue;
    const rows = acts.map(a => {
      const vals = M.map(m => m.tokens.byActivity?.[a]?.[key] ?? 0);
      return [ACTIVITIES[a], ...vals.map((v, i) => share(v, M[i].tokens[totalKey])), ...(two ? [signedInt(vals[1] - vals[0])] : [])];
    });
    tables.push({ title, head: ["Activity", ...labels, ...(two ? ["Difference"] : [])], rows });
  }

  // tool calls
  const cats = ["Shell (Bash)", "Shell (PowerShell)", "Umbraco MCP", "Browser (Playwright)", "Read / Grep / Glob", "Edit / Write", "ToolSearch", "Background task control", "Subagents", "Web", "Other MCP", "Other"]
    .filter(c => M.some(m => m.tools.byCategory[c]));
  const row = (label, vals, fmt = fmtInt, diff = true) => [label, ...vals.map(fmt), ...(two ? [diff && typeof vals[0] === "number" && typeof vals[1] === "number" ? signedInt(vals[1] - vals[0]) : ""] : [])];
  const toolRows = cats.map(c => row(c, M.map(m => m.tools.byCategory[c] || 0)));
  if (M.some(m => m.tools.mcp.total)) toolRows.push(row("  Umbraco MCP reads / writes", M.map(m => `${m.tools.mcp.reads} / ${m.tools.mcp.writes}`), String, false));
  toolRows.push(row("Total tool calls", M.map(m => m.tools.total)));
  toolRows.push(row("Tool calls per API request", M.map(m => m.tools.perRequest), v => v == null ? "—" : v.toFixed(2), false));
  toolRows.push(row("Failed tool calls", M.map(m => m.tools.failed.length)));
  toolRows.push(row("Files written with heredocs", M.map(m => m.tools.heredoc.files ? `${m.tools.heredoc.files} files in ${m.tools.heredoc.calls} calls` : "0"), String, false));
  toolRows.push(row("dotnet build (failed)", M.map(m => `${m.tools.dotnetBuilds} (${m.tools.dotnetBuildFailures})`), String, false));
  if (M.some(m => m.interruptions || m.prompts.followUpsDuringRun.length)) toolRows.push(row("Human interruptions / follow-ups", M.map(m => `${m.interruptions} / ${m.prompts.followUpsDuringRun.length}`), String, false));
  if (M.some(m => m.compactions)) toolRows.push(row("Context compactions", M.map(m => m.compactions)));
  tables.push({ title: "Tool calls", head: ["Tool", ...labels, ...(two ? ["Difference"] : [])], rows: toolRows });

  // grade
  const G = rs.map(r => r.grade), C = rs.map(r => r.check);
  if (G.some(Boolean) || C.some(Boolean)) {
    const gcats = [];
    for (const g of G.filter(Boolean)) for (const c of g.categories || []) if (!gcats.find(x => x.id === c.id)) gcats.push(c);
    const rows = gcats.map(c => [`${c.name} (/${c.max})`, ...G.map(g => { const x = g?.categories?.find(y => y.id === c.id); return x ? String(x.score) : "—"; })]);
    rows.push(["Total", ...G.map(g => g ? `${g.total}/${g.max}` : "—")]);
    rows.push(["Automated checks passed", ...C.map(c => c ? `${c.summary.passed}/${c.summary.passed + c.summary.failed}` : "—")]);
    rows.push(["Graded by", ...G.map(g => g?.grader || "—")]);
    if (two) for (const r of rows) {
      const [a, b] = [parseFloat(r[1]), parseFloat(r[2])];
      r.push(Number.isFinite(a) && Number.isFinite(b) && !/^(Graded|Automated)/.test(r[0]) ? signedInt(b - a) : "");
    }
    tables.push({ title: "Grade", head: ["Category", ...labels, ...(two ? ["Difference"] : [])], rows });
  }

  const info = rs.map((r, i) => `- **${labels[i]}** — \`${r.id}\`, model \`${r.metrics.model.id}\`, effort ${r.metrics.effort ?? "?"}, Claude Code ${r.metrics.claudeCodeVersion ?? "?"}` +
    `, ${r.auto ? `headless (npm run auto, ${r.auto.permissionMode})` : `by hand (${r.metrics.entrypoint ?? "?"}, ${r.metrics.permissionMode ?? "?"})`}` +
    (r.grade?.summary ? `\n  - ${r.grade.summary}` : "") +
    (r.metrics.warnings.length ? `\n  - ⚠ ${r.metrics.warnings.join(" ")}` : ""));
  return { tables, info };
}

// ---------------------------------------------------------------- every run side by side (when several tests are in play)
function crossTable(rs) {
  const labels = makeLabels(rs, true);
  const M = rs.map(r => r.metrics);
  const acts = Object.keys(ACTIVITIES).filter(a => a !== "base" && M.some(m => m.tokens.byActivity?.[a]?.totalExclCacheRead));
  const rows = [
    ["Blog prompt time", ...M.map(m => fmtDuration(m.time.blogPromptMs))],
    ["API requests", ...M.map(m => fmtInt(m.tokens.requests))],
    ["Total tokens", ...M.map(m => fmtInt(m.tokens.total))],
    ["Total excluding cache reads", ...M.map(m => fmtInt(m.tokens.totalExclCacheRead))],
    ...acts.map(a => [`  ${ACTIVITIES[a]}`, ...M.map(m => share(m.tokens.byActivity?.[a]?.totalExclCacheRead ?? 0, m.tokens.totalExclCacheRead))]),
    ["Tool calls", ...M.map(m => fmtInt(m.tools.total))],
    ["Grade", ...rs.map(r => r.grade ? `${r.grade.total}/${r.grade.max}` : "—")],
  ];
  return { title: "All tests side by side (token split excludes cache reads)", head: ["", ...labels], rows };
}

// ---------------------------------------------------------------- render
const byVariant = Object.keys(VARIANTS).map(v => [v, runs.filter(r => r.metrics.variant === v)]).filter(([, rs]) => rs.length);
const md = ["# Umbraco benchmark — model comparison", "", `Generated ${new Date().toLocaleString("en-GB")}`, ""];
const txt = [];
const mdTable = (t, level) => {
  md.push(`${level} ${t.title}`, "", `| ${t.head.join(" | ")} |`, `| ${t.head.map((_, i) => (i === 0 ? "---" : "---:")).join(" | ")} |`);
  for (const r of t.rows) md.push(`| ${r.map(c => String(c).replace(/\|/g, "\\|").replace(/^  /, "&nbsp;&nbsp;")).join(" | ")} |`);
  md.push("");
};
const txtTable = (t, prefix = "") => txt.push(prefix + t.title, t.head.join("\t"), ...t.rows.map(r => r.join("\t")), "");

if (byVariant.length > 1) {
  const t = crossTable(byVariant.flatMap(([, rs]) => rs));
  mdTable(t, "##");
  txtTable(t);
}
for (const [v, rs] of byVariant) {
  const { tables, info } = sectionTables(rs);
  md.push(`## Test: ${VARIANTS[v].name}`, "");
  for (const t of tables) { mdTable(t, "###"); txtTable(t, `${VARIANTS[v].name} — `); }
  md.push("#### Runs", "", ...info, "");
}

fs.mkdirSync(RESULTS, { recursive: true });
fs.writeFileSync(path.join(RESULTS, "report.md"), md.join("\n"));
fs.writeFileSync(path.join(RESULTS, "report.txt"), txt.join("\n"));
console.log(md.join("\n"));
console.log(`Wrote ${path.join(RESULTS, "report.md")} and report.txt (tab-separated, for pasting)`);
