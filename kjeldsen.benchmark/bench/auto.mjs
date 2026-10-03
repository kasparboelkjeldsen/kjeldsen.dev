// npm run auto                       — the sweep described in run-book.json
// npm run auto -- --model <alias|id>[:effort][,…] [--effort <level>] [--test <mcp|migrations|playwright>[,…]]
//                 [--grader opus] [--grader-effort high] [--no-grade] [--grade-only] [--permission-mode auto]
//                 [--budget <usd>] [--timeout <min>] [--claude <path>] [--codex <path>] [--quiet] [--dry-run]
// Runs the benchmark end to end without a human: sets up the test, boots Umbraco, plays the prompts from tests/<test>.md
// into one headless Claude Code or Codex session in Umbraco.Bench, collects the run, has a second headless session grade
// it with exam-prompt.md (which also resets the project), and rebuilds the report. Several models/tests run one after
// another, unattended: a failed attempt is archived and the sweep goes on, a run that hits a plan's usage limit is
// retried after the limit resets (other models run meanwhile), and the machine is kept awake while it runs.
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { ROOT, PROJECT, LOGS, RESULTS, CLAUDE_PROJECTS, projectDirName, parseArgs, listRuns, resolveRun, writeJson, fmtDuration, fmtInt } from "./lib/common.mjs";
import { VARIANTS, readPrompts } from "./lib/variants.mjs";
import { hasBaseline, changes } from "./lib/baseline.mjs";
import { stopSite } from "./lib/umbraco.mjs";
import { modelDisplayName } from "./lib/transcript.mjs";
import { resolveClaudeBin, claudeVersion, authStatus, ClaudeSession, killTree } from "./lib/claude.mjs";
import { resolveCodexBin, codexVersion, codexAuth, codexRateLimits, isUsageLimitError, CodexSession, mcpServerArgs, userMcpServerOffArgs, findRollout, DISABLED_FEATURES } from "./lib/codex.mjs";

const args = parseArgs();
const usage = `Usage: npm run auto                      (the sweep in run-book.json)
       npm run auto -- --model <alias|id>[:effort][,…] [--effort high] [--test mcp[,migrations,playwright]]
       npm run auto -- --grade-only [--run <id>]
Options: --runbook <file> (run-book.json)  --grader <model> (opus)  --grader-effort <level> (high)  --no-grade
         --permission-mode <mode> (auto)  --budget <usd per session>  --timeout <minutes for the blog prompt> (90)
         --codex-max-used <percent of the 5-hour window before a Codex run won't start> (75)
         --claude <path to Claude CLI>  --codex <path to Codex CLI>  --quiet  --dry-run
Flags override the run-book.`;

// run-book.json: what a parameterless "npm run auto" sweeps. Flags override it.
const RUNBOOK_FILE = path.resolve(ROOT, typeof args.runbook === "string" ? args.runbook : "run-book.json");
let book = {};
if (fs.existsSync(RUNBOOK_FILE)) {
  try { book = JSON.parse(fs.readFileSync(RUNBOOK_FILE, "utf8")); } catch (e) { console.error(`✗ ${RUNBOOK_FILE} isn't valid JSON: ${e.message}`); process.exit(1); }
} else if (args.runbook) { console.error(`✗ No run-book at ${RUNBOOK_FILE}`); process.exit(1); }
const opt = (flag, value, fallback) => (args[flag] !== undefined && args[flag] !== true ? args[flag] : value ?? fallback);

const PERMISSION_MODE = opt("permission-mode", book.options?.permissionMode, "auto");
const GRADER = opt("grader", book.grader?.model, "opus");
const GRADER_EFFORT = opt("grader-effort", book.grader?.effort, "high");
const TIMEOUT_MS = Number(opt("timeout", book.options?.timeoutMinutes, 90)) * 60_000;
const BUDGET = opt("budget", book.options?.budgetUsd, null);
// one Codex run took ~15% of the Plus plan's 5-hour window; don't start one that would likely run out halfway
const CODEX_MAX_USED = Number(opt("codex-max-used", book.options?.codexMaxUsedPercent, 75));
const LIMIT_POLL_MS = 30 * 60_000;     // while waiting out a usage limit, look again this often
const MAX_LIMIT_WAITS = 8;             // per run, before giving up on it
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const clock = t => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const say = (...a) => console.log(...a);
const step = s => say(`\n▸ ${s}`);
const die = msg => { console.error(`\n✗ ${msg}`); process.exit(1); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// The plan's allowance ran out: not the model's fault, so the attempt is discarded and retried once it resets
class LimitError extends Error { constructor(msg, notBefore) { super(msg); this.notBefore = notBefore; } }
// Something failed before the blog prompt (boot, MCP, the CLI itself): discarded and retried once
class InfraError extends Error {}

// ---------------------------------------------------------------- helpers

function bench(script, scriptArgs = [], { allowFail = false, quiet = false } = {}) {
  const r = spawnSync(process.execPath, [path.join(ROOT, "bench", script), ...scriptArgs], { cwd: ROOT, encoding: "utf8", stdio: quiet ? "pipe" : "inherit" });
  if (r.status !== 0 && !allowFail) throw new Error(`bench/${script} ${scriptArgs.join(" ")} exited with ${r.status}${quiet ? `:\n${r.stderr || r.stdout}` : ""}`);
  return r;
}

const projectChanges = () => {
  const ch = changes();
  return [...ch.added, ...ch.modified, ...ch.deleted].filter(f => f !== ".mcp.json");
};

const runBySession = id => listRuns().find(r => r.metrics?.sessionId === id);

// Throws an attempt away: stops Umbraco and restores the pristine scaffold (database and build output included),
// archiving whatever the model wrote as refs/runs/<ref>
function discard(ref) {
  stopSite();
  const r = bench("reset.mjs", ["--force", "--as", ref], { allowFail: true, quiet: true });
  say(`  ↺ discarded the attempt (archived as refs/runs/${ref})${r.status ? " — reset reported a problem:\n" + (r.stderr || r.stdout) : ""}`);
}

// OpenAI models run through Codex, everything else through Claude Code
const providerOf = model => /^(gpt|o\d|codex)/i.test(model) ? "openai" : "anthropic";

// "opus:high,gpt-5.6-terra" → [{ provider: "anthropic", model: "opus", effort: "high" }, { provider: "openai", model: "gpt-5.6-terra", effort: … }]
// Without --model: run-book anthropic.models, then openai.models, each with its section's effort.
// "sonnet-5-5" is short for "claude-sonnet-5-5". Haiku 4.5 has no effort setting, so it never gets --effort.
function parseModels() {
  const fromFlags = args.model || args.models;
  const flagEffort = args.effort !== undefined && args.effort !== true ? args.effort : undefined;
  const entries = fromFlags
    ? String(fromFlags).split(",").map(s => ({ s, section: null }))
    : ["anthropic", "openai"].flatMap(p => (book[p]?.models || []).map(s => ({ s, section: p })));
  return entries.map(({ s, section }) => ({ s: String(s).trim(), section })).filter(e => e.s).map(({ s, section }) => {
    let [model, effort] = s.split(":");
    if (/^(opus|sonnet|haiku|fable)-\d/i.test(model)) model = "claude-" + model;
    const provider = section || providerOf(model);
    effort = effort || flagEffort || book[provider]?.effort;
    if (/haiku/i.test(model) || effort === "default") effort = undefined;
    return { provider, model, effort };
  });
}

function parseTests() {
  const t = args.test || args.tests || book.run || "mcp";
  return (Array.isArray(t) ? t : String(t).split(",")).map(s => String(s).trim()).filter(Boolean);
}

let active = null; // the running Claude or Codex session, killed on Ctrl+C
let releaseAwake = () => {};
process.on("SIGINT", () => {
  console.error("\nInterrupted — stopping the session and Umbraco.");
  active?.kill();
  stopSite();
  releaseAwake();
  process.exit(130);
});

// Asks Windows not to sleep while this process runs (SetThreadExecutionState from a helper that lives as long as we do).
// Nothing is changed in the power settings; the request ends with the process.
function keepAwake() {
  if (process.platform !== "win32") return () => {};
  const ps = `$t = Add-Type -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);' -Name Power -Namespace Bench -PassThru;
    $null = $t::SetThreadExecutionState([uint32]"0x80000001");
    while (Get-Process -Id ${process.pid} -ErrorAction SilentlyContinue) { Start-Sleep -Seconds 30 }`;
  const c = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], { stdio: "ignore", windowsHide: true });
  return () => killTree(c.pid);
}

function session({ label, cwd, cliArgs, logFile }) {
  return (active = new ClaudeSession({ bin: BIN, cwd, args: cliArgs, logFile, label, quiet: !!args.quiet }).start());
}

// A Claude Code turn that ended because the plan's limit was reached (resets within the 5-hour window)
const claudeLimit = turn => turn?.isError && isUsageLimitError(`${turn.text} ${JSON.stringify(turn.result ?? {})}`);

// Is the Codex allowance good for another run? Throws LimitError with the reset time when it isn't.
async function codexPreflight() {
  let rl;
  try { rl = await codexRateLimits(CODEX); } catch (e) { say(`  ⚠ couldn't read the Codex usage limits (${e.message}); trying anyway`); return null; }
  say(`  Codex allowance: ${rl.usedPercent}% of the 5-hour window used (resets ${rl.resetsAt ? clock(rl.resetsAt) : "?"}), ${rl.weeklyUsedPercent}% of the week`);
  if (rl.weeklyUsedPercent >= 95) throw new LimitError(`the weekly Codex allowance is ${rl.weeklyUsedPercent}% used`, (rl.weeklyResetsAt ?? Date.now() + 86_400_000) + 120_000);
  if (!rl.allowed || rl.limitReached || rl.usedPercent > CODEX_MAX_USED) throw new LimitError(`the Codex 5-hour window is ${rl.usedPercent}% used`, (rl.resetsAt ?? Date.now() + LIMIT_POLL_MS) + 120_000);
  return rl;
}

// ---------------------------------------------------------------- grading

async function grade(run) {
  const m = run.metrics || {};
  const what = m.provider === "openai" ? "Codex thread" : "Claude Code session";
  step(`Grading ${run.id} with ${GRADER} (${GRADER_EFFORT}) — exam-prompt.md`);
  const logFile = path.join(LOGS, `auto-${stamp()}-grader.jsonl`);
  const cliArgs = ["--model", GRADER, "--effort", GRADER_EFFORT, "--permission-mode", PERMISSION_MODE, "--permission-prompts", "none",
    "--strict-mcp-config", "-n", `bench grader ${run.id}`, ...(BUDGET ? ["--max-budget-usd", String(BUDGET)] : [])];
  const s = session({ label: "grader", cwd: ROOT, cliArgs, logFile });
  const prompt = `Follow exam-prompt.md.

Context from the automated runner (bench/auto.mjs): the run to grade is ${run.id} (${what} ${m.sessionId}, a headless run). It has already been collected. For step 1, run exactly this instead of a bare "npm run collect", which only looks for Claude Code transcripts:
npm run collect -- --transcript "${m.transcript}"
It updates the same run in place.
Nobody is watching this session and nobody will answer questions: work autonomously and finish every step, including "npm run reset" and the final "npm run status".`;
  let turn;
  try {
    turn = await s.send(prompt, { timeoutMs: 60 * 60_000, settleMs: 15_000 });
  } finally {
    await s.close();
    active = null;
  }
  const graded = resolveRun(run.id);
  const info = {
    model: GRADER, effort: GRADER_EFFORT, durationMs: turn.durationMs, costUsd: turn.costUsd, isError: turn.isError,
    log: path.relative(ROOT, logFile), finalMessage: turn.text,
  };
  fs.copyFileSync(logFile, path.join(graded.dir, "grader-stream.jsonl"));
  if (claudeLimit(turn)) throw new LimitError(`the grader hit the Claude usage limit: ${turn.text}`, Date.now() + LIMIT_POLL_MS);
  return { graded, info };
}

// The grader writes its own name into grade.json and can get its effort wrong (it said "low" for a high-effort session);
// the runner knows what it started, so that is what the grade records
function stampGrader(run) {
  const file = path.join(run.dir, "grade.json");
  const g = JSON.parse(fs.readFileSync(file, "utf8"));
  const actual = `${modelDisplayName(GRADER)} (${GRADER_EFFORT})`;
  if (g.grader !== actual) { g.graderSaidItWas = g.grader; g.grader = actual; writeJson(file, g); }
}

// Grades a collected run and makes sure the project ends up pristine. A grader that hits the Claude limit waits and
// tries again; one that fails twice leaves the run ungraded, archived under its own id.
async function gradeAndReset(run, auto) {
  let failures = 0, waits = 0;
  while (true) {
    try {
      const { graded, info } = await grade(resolveRun(run.id));
      auto.grader = info;
      writeJson(path.join(graded.dir, "auto.json"), auto);
      if (graded.grade) {
        stampGrader(graded);
        if (projectChanges().length) { say("  the grader didn't reset the project; resetting"); bench("reset.mjs", ["--run", run.id], { allowFail: true }); }
        return resolveRun(run.id);
      }
      say(`  ✗ the grader finished without writing grade.json (log: ${info.log})`);
    } catch (e) {
      if (e instanceof LimitError && ++waits <= MAX_LIMIT_WAITS) {
        say(`  ⏳ ${e.message}. Trying again at ${clock(e.notBefore)}.`);
        await sleep(e.notBefore - Date.now());
        continue;
      }
      say(`  ✗ grading failed: ${e.message}`);
    }
    if (++failures >= 2) break;
    stopSite();
    say("  grading once more");
  }
  stopSite();
  bench("reset.mjs", ["--force", "--run", run.id], { allowFail: true, quiet: true });
  auto.outcome = "ungraded: grading failed twice";
  writeJson(path.join(run.dir, "auto.json"), auto);
  return resolveRun(run.id);
}

// Before a sweep: a project left dirty by an earlier run gets that run graded, or is discarded
async function settleProject() {
  if (!projectChanges().length) return;
  const runs = listRuns();
  const last = runs.at(-1);
  if (last && !last.grade && !args["no-grade"]) {
    say(`Umbraco.Bench holds ${last.id}, which isn't graded yet: grading it first.`);
    await gradeAndReset(last, { ...(last.auto || {}) });
  }
  if (projectChanges().length) discard(`leftover-${stamp()}`);
}

// ---------------------------------------------------------------- the model under test, per provider

// Claude Code: one `claude -p` process fed over stdin. Only the project's own settings and the test's MCP servers
// (from the .mcp.json setup just wrote): no user plugins, hooks, connectors or default model leak into the run.
// Auto mode isn't available for every model (Haiku 4.5 starts in "default" instead, and headless that denies every
// write). Those run with bypassPermissions, the nearest thing: nothing asks, nothing is refused. auto.json records it.
const PERMISSION_FALLBACK = new Map();
const permissionModeFor = model => PERMISSION_FALLBACK.get(model) ?? (PERMISSION_MODE === "auto" && /haiku/i.test(model) ? "bypassPermissions" : PERMISSION_MODE);

function claudeDriver({ model, effort }, label, logFile, auto) {
  const sessionId = randomUUID();
  const mcpJson = path.join(PROJECT, ".mcp.json");
  const mode = permissionModeFor(model);
  const cliArgs = ["--model", model, ...(effort ? ["--effort", effort] : []), "--session-id", sessionId,
    "--permission-mode", mode, "--permission-prompts", "none", "--setting-sources", "project,local",
    "--strict-mcp-config", ...(fs.existsSync(mcpJson) ? ["--mcp-config", mcpJson] : []),
    "-n", `bench ${label}`, ...(BUDGET ? ["--max-budget-usd", String(BUDGET)] : [])];
  Object.assign(auto, { sessionId, claudeCli: BIN, claudeVersion: VERSION, permissionMode: mode, settingSources: "project,local",
    ...(mode !== PERMISSION_MODE ? { permissionFallback: `${PERMISSION_MODE} mode isn't available for ${model}; ran with ${mode}` } : {}) });
  if (mode !== PERMISSION_MODE) say(`  ⚠ ${PERMISSION_MODE} mode isn't available for ${model}: running with ${mode}`);
  const s = session({ label: "model", cwd: PROJECT, cliArgs, logFile });
  return {
    s, sessionId,
    send: (text, o) => s.send(text, o),
    limit: turn => claudeLimit(turn) ? Date.now() + LIMIT_POLL_MS : null,
    // prompt 1 must have reached the test's tools, or the blog prompt would be a wasted run: a successful call, or the
    // server reported connected (the same bar as Codex: a model may answer "connected" without calling anything)
    gate: async (t1, prefix) => {
      const want = prefix.slice(5, -2);
      const servers = (t1.init?.mcp_servers || []).map(m => `${m.name}=${m.status}`).join(", ") || "none reported";
      const ok = t1.calls.filter(c => c.name.startsWith(prefix) && c.done && !c.isError).length;
      const connected = (t1.init?.mcp_servers || []).some(m => m.name === want && m.status === "connected");
      return { ok: ok > 0 || connected, servers, calls: ok, why: `no successful ${prefix}* call and ${want} isn't connected` };
    },
    transcript: () => {
      const f = path.join(CLAUDE_PROJECTS, projectDirName(PROJECT), `${sessionId}.jsonl`);
      return fs.existsSync(f) ? f : null;
    },
  };
}

// Codex: one `codex app-server` process, the test's MCP servers translated from .mcp.json, the desktop app's
// plugins, browser and computer use switched off. Full access with Codex's own automatic reviewer is the closest
// match to Claude Code's auto mode (its workspace sandbox blocks the network even when told not to).
async function codexDriver({ model, effort }, label, logFile, auto) {
  const mcp = mcpServerArgs(path.join(PROJECT, ".mcp.json"), PROJECT);
  const cliArgs = [...DISABLED_FEATURES.flatMap(f => ["--disable", f]), ...userMcpServerOffArgs(mcp.names), ...mcp.args];
  const thread = { model, approvalPolicy: "on-request", approvalsReviewer: "auto_review", sandbox: "danger-full-access" };
  const s = new CodexSession({ bin: CODEX, cwd: PROJECT, cliArgs, thread, logFile, label: "model", quiet: !!args.quiet });
  active = s;
  await s.open();
  // the first turn's tools are fixed when it starts: wait for the MCP servers, or the model never sees their tools
  if (!(await s.waitForMcp(mcp.names))) console.log(`  ⚠ MCP server(s) ${mcp.names.join(", ")} not ready after 2 min; starting anyway`);
  Object.assign(auto, { sessionId: s.threadId, codexCli: CODEX, codexVersion: CODEX_VERSION, permissionMode: "on-request / auto_review / danger-full-access",
    disabledFeatures: DISABLED_FEATURES, mcpServers: mcp.names });
  return {
    s, sessionId: s.threadId,
    send: (text, o) => s.send(text, { ...o, effort }),
    // a turn that failed on the plan's allowance; the reset time comes from the usage windows
    limit: async turn => {
      if (!turn?.isError || !isUsageLimitError(JSON.stringify([turn.errors, turn.result, turn.text]))) return null;
      const rl = await codexRateLimits(CODEX).catch(() => null);
      return (rl?.resetsAt ?? Date.now() + LIMIT_POLL_MS) + 120_000;
    },
    // Codex finds MCP tools through its own tool search, and a model may answer without looking, so the server's
    // own status is the check: connected, with tools
    gate: async (t1, prefix) => {
      const status = await s.mcpStatus();
      const want = prefix.slice(5, -2);
      const srv = status.find(x => x.name === want);
      const calls = t1.calls.filter(c => c.name.startsWith(prefix) && !c.isError).length;
      return { ok: !!srv && srv.tools > 0 && srv.startup !== "failed", servers: status.map(x => `${x.name}=${x.startup ?? "?"} (${x.tools} tools)`).join(", "), calls,
        why: `the ${want} MCP server isn't connected with tools` };
    },
    transcript: () => findRollout(s.threadId),
  };
}

// ---------------------------------------------------------------- one run

async function runOne({ provider, model, effort }, variant) {
  const v = VARIANTS[variant];
  const { prompt1, prompt2 } = readPrompts(variant);
  if (!prompt2 || (v.hasPrompt1 && !prompt1)) throw new Error(`Couldn't read the prompts from ${v.promptFile}`);
  const label = `${model}${effort ? ":" + effort : ""} · ${v.name}`;
  const logFile = path.join(LOGS, `auto-${stamp()}-${variant}-${model.replace(/[^a-z0-9.-]+/gi, "-")}.jsonl`);
  const t0 = Date.now();
  const auto = { driver: "bench/auto.mjs", provider, model, effort: effort ?? null, variant, startedAt: new Date().toISOString() };

  say(`\n════════ ${label} ════════  (${clock(t0)})`);
  const dirty = projectChanges();
  if (dirty.length) throw new InfraError(`Umbraco.Bench isn't pristine (${dirty.length} changed file(s)).`);
  if (provider === "openai") await codexPreflight();

  // ---- everything up to the blog prompt is infrastructure: a failure here says nothing about the model
  let d, sessionId;
  try {
    step(`Setting up the ${v.name} test`);
    bench("setup.mjs", [variant]);
    step("Booting Umbraco (first boot installs the database, outside the timing)");
    bench("up.mjs");
    if (!v.hasPrompt1) { step("Stopping Umbraco"); bench("down.mjs"); }
    d = provider === "openai" ? await codexDriver({ model, effort }, label, logFile, auto) : claudeDriver({ model, effort }, label, logFile, auto);
    sessionId = d.sessionId;
    if (v.hasPrompt1) {
      step(`Prompt 1: ${prompt1}`);
      const t1 = await d.send(prompt1, { timeoutMs: 15 * 60_000, settleMs: 5_000 });
      auto.prompt1 = { durationMs: t1.durationMs, costUsd: t1.costUsd, isError: t1.isError, toolCalls: t1.calls.length };
      const limitedUntil = await d.limit(t1);
      if (limitedUntil) throw new LimitError(`${provider === "openai" ? "Codex" : "Claude"} usage limit reached during prompt 1`, limitedUntil);
      const prefix = variant === "playwright" ? "mcp__playwright__" : "mcp__umbraco__";
      const g = await d.gate(t1, prefix);
      Object.assign(auto.prompt1, { mcpServers: g.servers, successfulToolCalls: g.calls });
      if (t1.isError) throw new InfraError(`Prompt 1 ended in an error: ${t1.text || JSON.stringify(t1.result)}`);
      if (!g.ok) throw new InfraError(`Prompt 1: ${g.why} (MCP servers: ${g.servers}). Not sending the blog prompt.`);
      say(`  ✓ ${g.calls} successful ${prefix.slice(5, -2)} call(s); MCP servers: ${g.servers}`);
      step("Stopping Umbraco");
      bench("down.mjs");
    }
  } catch (e) {
    if (d) { await d.s.close().catch(() => {}); active = null; }
    // started in another permission mode than asked: the retry uses the fallback
    if (provider === "anthropic" && /permission mode "default", not "auto"/.test(e.message) && !PERMISSION_FALLBACK.has(model)) PERMISSION_FALLBACK.set(model, "bypassPermissions");
    throw e instanceof LimitError || e instanceof InfraError ? e : new InfraError(e.message);
  }

  // ---- the blog prompt: a timeout or an error is the model's result and is graded as it stands, a usage limit isn't
  try {
    step(`Prompt 2 (the blog), timeout ${fmtDuration(TIMEOUT_MS)}`);
    let t2;
    try {
      t2 = await d.send(prompt2, { timeoutMs: TIMEOUT_MS, settleMs: 20_000 });
    } catch (e) {
      if (!/timed out/i.test(e.message)) throw new InfraError(`the session broke during the blog prompt: ${e.message}`);
      auto.prompt2 = { timedOut: true, error: e.message };
      say(`\n  ✗ ${e.message} — collecting and grading what it built`);
    }
    if (t2) {
      const limitedUntil = await d.limit(t2);
      if (limitedUntil) throw new LimitError(`${provider === "openai" ? "Codex" : "Claude"} usage limit reached during the blog prompt`, limitedUntil);
      auto.prompt2 = { durationMs: t2.durationMs, costUsd: t2.costUsd, isError: t2.isError, toolCalls: t2.calls.length,
        failedToolCalls: t2.calls.filter(c => c.isError).length, results: t2.results.length, terminalReason: t2.result?.terminal_reason ?? null,
        ...(t2.declined?.length ? { declinedRequests: t2.declined } : {}) };
      say(`\n  Blog prompt finished in ${fmtDuration(t2.durationMs)}, ${t2.calls.length} tool calls${provider === "anthropic" ? `, $${t2.costUsd.toFixed(2)}` : ""}${t2.isError ? " — ended in an ERROR" : ""}`);
      if (t2.text) say(`  Final report:\n${t2.text.split("\n").map(l => "    " + l).join("\n")}`);
    }
  } finally {
    await d.s.close();
    active = null;
  }

  step("Collecting the run");
  const transcript = d.transcript();
  const c = bench("collect.mjs", transcript ? ["--transcript", transcript] : ["--session", sessionId], { allowFail: true });
  const run = runBySession(sessionId);
  if (c.status !== 0 || !run) throw new InfraError(`collect didn't produce a run for session ${sessionId}`);
  auto.transcript = transcript;
  fs.copyFileSync(logFile, path.join(run.dir, provider === "openai" ? "codex-stream.jsonl" : "claude-stream.jsonl"));
  auto.runId = run.id;
  auto.log = path.relative(ROOT, logFile);
  writeJson(path.join(run.dir, "auto.json"), auto);

  if (args["no-grade"]) {
    say(`\nNot grading (--no-grade). Umbraco.Bench still holds the solution: grade it with "npm run auto -- --grade-only" or exam-prompt.md.`);
    return { label, run, ms: Date.now() - t0, status: "ungraded" };
  }

  const graded = await gradeAndReset(run, auto);
  if (graded.grade) say(`\n  ✓ Graded ${graded.grade.total}/${graded.grade.max} — ${graded.grade.summary}`);
  return { label, run: graded, ms: Date.now() - t0, status: graded.grade ? "graded" : "ungraded" };
}

// ---------------------------------------------------------------- main

let BIN, VERSION;
try { BIN = resolveClaudeBin(args.claude); } catch (e) { die(e.message); }
VERSION = claudeVersion(BIN);
if (!hasBaseline()) die(`No baseline. Run "npm run baseline" on a pristine Umbraco.Bench first.`);

const models = parseModels();
const tests = parseTests();
for (const t of tests) if (!VARIANTS[t]) die(`Unknown test "${t}". Tests: ${Object.keys(VARIANTS).join(", ")}`);
if (!args["grade-only"] && !models.length) die(usage);
const matrix = models.flatMap(m => tests.map(t => ({ m, t })));
if (matrix.length > 1 && args["no-grade"]) die("--no-grade leaves the project un-reset, so it only works for a single run.");

say(`Run-book    ${fs.existsSync(RUNBOOK_FILE) ? path.relative(ROOT, RUNBOOK_FILE) + (args.model || args.models ? " (models from --model)" : "") : "none"}`);
say(`Claude CLI  ${BIN} (${VERSION ?? "version unknown"})`);
const auth = authStatus(BIN);
say(`Auth        ${auth.loggedIn ? `logged in (${auth.authMethod}${auth.email ? ", " + auth.email : ""})` : "NOT logged in"}`);
if (args["grade-only"]) say(`Plan        grade ${args.run ? args.run : "the newest run"} with ${GRADER} (${GRADER_EFFORT})`);
else {
  say(`Plan        ${matrix.length} run(s), one after another, permission mode ${PERMISSION_MODE}, ${args["no-grade"] ? "no grading" : `graded by ${GRADER} (${GRADER_EFFORT})`}`);
  for (const { m, t } of matrix) say(`              ${m.model}${m.effort ? ":" + m.effort : ""} · ${VARIANTS[t].name} · ${m.provider === "openai" ? "Codex" : "Claude Code"}`);
}
// Codex only when an OpenAI model is in the plan (the grader is always Claude Code)
let CODEX = null, CODEX_VERSION = null;
if (matrix.some(({ m }) => m.provider === "openai")) {
  try { CODEX = resolveCodexBin(args.codex); } catch (e) { die(e.message); }
  CODEX_VERSION = codexVersion(CODEX);
  const cAuth = codexAuth(CODEX);
  say(`Codex CLI   ${CODEX} (${CODEX_VERSION ?? "version unknown"}), ${cAuth.loggedIn ? `logged in (${cAuth.authMethod})` : "NOT logged in"}`);
  if (!cAuth.loggedIn) die(`Codex isn't logged in. Run "${CODEX}" login, then retry.`);
  const rl = await codexRateLimits(CODEX).catch(() => null);
  if (rl) say(`Codex use   ${rl.usedPercent}% of the 5-hour window (resets ${rl.resetsAt ? clock(rl.resetsAt) : "?"}), ${rl.weeklyUsedPercent}% of the week, ${rl.plan} plan; a run starts only at ≤${CODEX_MAX_USED}%`);
}
// Claude Code runs the anthropic models and every grading session
const needClaude = args["grade-only"] || !args["no-grade"] || matrix.some(({ m }) => m.provider === "anthropic");
if (needClaude && !auth.loggedIn) die(`The CLI isn't logged in. Run "${BIN}" auth login (or claude setup-token and set CLAUDE_CODE_OAUTH_TOKEN), then retry.`);
if (args["dry-run"]) { say("\nDry run — nothing started."); process.exit(0); }

releaseAwake = keepAwake();
const t0 = Date.now();
const done = [];
const SWEEP_LOG = path.join(RESULTS, `sweep-${stamp()}.json`);
const queue = matrix.map(({ m, t }) => ({ m, t, label: `${m.model}${m.effort ? ":" + m.effort : ""} · ${VARIANTS[t].name}`, infraTries: 0, limitWaits: 0, notBefore: 0 }));
const writeSweepLog = (state = "running") => {
  if (args["grade-only"]) return;
  writeJson(SWEEP_LOG, {
    state, startedAt: new Date(t0).toISOString(), updatedAt: new Date().toISOString(),
    done: done.map(d => ({ label: d.label, status: d.status, runId: d.run?.id ?? null, grade: d.run?.grade ? `${d.run.grade.total}/${d.run.grade.max}` : null, error: d.error ?? null })),
    queued: queue.map(q => ({ label: q.label, notBefore: q.notBefore ? new Date(q.notBefore).toISOString() : null, infraTries: q.infraTries, limitWaits: q.limitWaits })),
  });
};

try {
  if (args["grade-only"]) {
    const run = resolveRun(args.run);
    if (run.grade) die(`${run.id} is already graded (${run.grade.total}/${run.grade.max}).`);
    const graded = await gradeAndReset(run, { ...(run.auto || {}) });
    done.push({ label: run.id, run: graded, status: graded.grade ? "graded" : "ungraded" });
    if (!graded.grade) process.exitCode = 1;
  } else {
    await settleProject();
    writeSweepLog();
    while (queue.length) {
      const now = Date.now();
      const i = queue.findIndex(q => q.notBefore <= now);
      if (i < 0) {
        // everything left is waiting out a usage limit: sleep (in steps, looking at Codex's windows meanwhile)
        const wake = Math.min(...queue.map(q => q.notBefore));
        say(`\n⏳ Waiting for usage limits to reset — next try at ${clock(wake)} (${queue.map(q => q.label).join(", ")})`);
        await sleep(Math.max(60_000, Math.min(wake - now, LIMIT_POLL_MS)));
        if (CODEX && queue.some(q => q.m.provider === "openai" && q.notBefore > Date.now())) {
          const rl = await codexRateLimits(CODEX).catch(() => null);
          if (rl) say(`  Codex allowance: ${rl.usedPercent}% used (resets ${rl.resetsAt ? clock(rl.resetsAt) : "?"})`);
          if (rl && rl.allowed && !rl.limitReached && rl.usedPercent <= CODEX_MAX_USED && rl.weeklyUsedPercent < 95)
            for (const q of queue) if (q.m.provider === "openai") q.notBefore = 0;
        }
        continue;
      }
      const q = queue.splice(i, 1)[0];
      writeSweepLog();
      try {
        done.push(await runOne(q.m, q.t));
      } catch (e) {
        active?.kill(); active = null;
        console.error(`\n✗ ${q.label}: ${e.message}`);
        const tag = `${e instanceof LimitError ? "limited" : "failed"}-${q.m.model}-${stamp()}`.replace(/[^a-z0-9.-]+/gi, "-");
        discard(tag);
        if (e instanceof LimitError && ++q.limitWaits <= MAX_LIMIT_WAITS) {
          q.notBefore = e.notBefore;
          // the whole provider is limited, not just this model
          for (const o of queue) if (o.m.provider === q.m.provider) o.notBefore = Math.max(o.notBefore, e.notBefore);
          queue.splice(i, 0, q);
          say(`  ⏳ ${q.label} goes back in the queue; ${q.m.provider === "openai" ? "Codex" : "Claude"} runs wait until ${clock(e.notBefore)}, others go first.`);
        } else if (e instanceof InfraError && ++q.infraTries <= 1) {
          queue.splice(i, 0, q);
          say(`  ↻ trying ${q.label} once more`);
        } else {
          done.push({ label: q.label, status: "failed", error: e.message });
          say(`  ✗ giving up on ${q.label}`);
        }
      }
      writeSweepLog();
    }
  }
} catch (e) {
  console.error(`\n✗ ${e.message}`);
  stopSite();
  process.exitCode = 1;
}
writeSweepLog(process.exitCode ? "stopped" : "finished");
releaseAwake();

if (done.some(d => d.run?.grade)) {
  step("Rebuilding the report");
  bench("report.mjs", [], { quiet: true, allowFail: true });
  say("  results/report.md and results/report.txt");
}
say(`\n════════ Summary (${fmtDuration(Date.now() - t0)}) ════════`);
for (const d of done) {
  if (!d.run) { say(`  ${d.label.padEnd(46)} FAILED: ${d.error}`); continue; }
  const m = d.run.metrics;
  say(`  ${d.run.id.padEnd(46)} ${fmtDuration(m.time.blogPromptMs).padStart(6)}  ${fmtInt(m.tokens.total).padStart(11)} tok  ${d.run.grade ? `${d.run.grade.total}/${d.run.grade.max}` : "ungraded"}`);
}
// --no-grade asks for an ungraded run, so that is success
if (done.some(d => d.status !== "graded" && !(args["no-grade"] && d.status === "ungraded"))) process.exitCode = process.exitCode || 1;
