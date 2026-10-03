// Turns a session transcript into benchmark metrics: phase timings, token usage (total and by activity),
// tool-call breakdown. Heuristic by design — good enough to compare models.
// Two readers produce one normalized session: Claude Code transcripts (~/.claude/projects/…/<session>.jsonl, below)
// and Codex rollouts (~/.codex/sessions/…/rollout-*.jsonl, codex-rollout.mjs). analyzeNormalized does the rest.
import fs from "node:fs";
import path from "node:path";
import { detectVariant } from "./variants.mjs";
import { BENCH_FOLDER_REF } from "./common.mjs";
import { normalizeCodex, isCodexRollout } from "./codex-rollout.mjs";

const P1_MARKER = /\bverify\b/i;
const P2_MARKER = /spin up a simple blog/i;

export function readTranscript(file) {
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

export const ts = e => Date.parse(e.timestamp);

export function textOf(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map(c => (c.type === "text" ? c.text : typeof c.content === "string" ? c.content : Array.isArray(c.content) ? textOf(c.content) : "")).join("\n");
}

const countImages = content => !Array.isArray(content) ? 0
  : content.reduce((n, c) => n + (c.type === "image" ? 1 : Array.isArray(c.content) ? countImages(c.content) : 0), 0);

function promptText(entry) {
  const c = entry.message?.content;
  const parts = typeof c === "string" ? [c] : (c || []).filter(x => x.type === "text").map(x => x.text);
  return parts.filter(t => !/^\s*<(ide_|system-reminder)/.test(t)).join("\n").trim();
}

function isHumanPrompt(e) {
  if (e.type !== "user" || e.isSidechain || e.isMeta || e.isCompactSummary) return false;
  if (e.origin && e.origin.kind !== "human") return false;
  const c = e.message?.content;
  if (Array.isArray(c) && c.some(x => x.type === "tool_result")) return false;
  const t = promptText(e);
  if (!t || /^\[Request interrupted/.test(t) || /^<(command-|local-command)/.test(t)) return false;
  return true;
}

export function modelDisplayName(id = "", marketing) {
  if (marketing) return marketing.replace(/\s*\(.*?\)\s*$/, "").trim();
  // gpt-5.6-terra → GPT-5.6-Terra
  if (/^gpt-/i.test(id)) return id.split("-").map((p, i) => (i === 0 ? p.toUpperCase() : p[0].toUpperCase() + p.slice(1))).join("-");
  const m = id.match(/claude-([a-z]+)-(\d+)(?:-(\d{1,2}))?(?!\d)/i);
  if (!m) return id || "unknown";
  return `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}${m[3] ? "." + m[3] : ""}`;
}

// ---------------------------------------------------------------- classification

const isBrowserTool = n => /^mcp__playwright__/.test(n);

export function toolCategory(name) {
  if (name === "Bash") return "Shell (Bash)";
  if (name === "PowerShell") return "Shell (PowerShell)";
  if (name.startsWith("mcp__umbraco__")) return "Umbraco MCP";
  if (isBrowserTool(name)) return "Browser (Playwright)";
  if (name.startsWith("mcp__")) return "Other MCP";
  if (["Read", "Grep", "Glob"].includes(name)) return "Read / Grep / Glob";
  if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(name)) return "Edit / Write";
  if (name === "ToolSearch") return "ToolSearch";
  if (["TaskStop", "TaskOutput", "BashOutput", "KillShell", "KillBash", "Monitor"].includes(name)) return "Background task control";
  if (["Agent", "Task", "Workflow"].includes(name)) return "Subagents";
  if (["WebFetch", "WebSearch"].includes(name)) return "Web";
  return "Other";
}

// What the tokens were spent on — the "MCP vs coding" split
export const ACTIVITIES = {
  mcp: "Umbraco MCP",
  browser: "Browser (Playwright)",
  migrations: "Coding: migrations",
  site: "Coding: site (views, components, models)",
  run: "Build, run & verify",
  web: "Web research",
  other: "Other tools",
  base: "Base context & reasoning",
};

const MIGRATION_PATH = /Migrations?[\\/]|Migration[A-Za-z]*\.cs\b/i;
const RUN_CMD = /dotnet\s+(build|run|watch|restore|clean)|taskkill|Stop-Process|\bkill\b|\bcurl\b|Invoke-WebRequest|Invoke-RestMethod|\bwget\b|Start-Sleep|\bsleep\b|\bnpm\s+(run|install|i|ci)\b|\bnpx\s+vite|Get-Process|netstat|Get-NetTCPConnection|Test-NetConnection/i;

function activityOf(call) {
  const n = call.name, input = call.input || {};
  if (n.startsWith("mcp__umbraco__")) return "mcp";
  if (isBrowserTool(n)) return "browser";
  if (n === "ToolSearch") {
    const q = String(input.query || "");
    return /umbraco/i.test(q) ? "mcp" : /playwright|browser/i.test(q) ? "browser" : "other";
  }
  if (n === "WebFetch" || n === "WebSearch") return "web";
  if (["Read", "Edit", "Write", "MultiEdit", "NotebookEdit", "Grep", "Glob"].includes(n)) {
    // Playwright MCP writes page snapshots to .playwright-mcp/ and the model reads them back
    if (/\.playwright-mcp/.test(String(input.file_path || input.path || ""))) return "browser";
    return MIGRATION_PATH.test(String(input.file_path || input.path || input.pattern || input.glob || "")) ? "migrations" : "site";
  }
  if (n === "Bash" || n === "PowerShell") {
    const cmd = String(input.command || "");
    if (/playwright/i.test(cmd)) return "browser";
    const w = shellWrites(cmd);
    if (w.targets.length) return w.targets.some(t => MIGRATION_PATH.test(t)) ? "migrations" : "site";
    if (RUN_CMD.test(cmd)) return "run";
    return MIGRATION_PATH.test(cmd) ? "migrations" : "site";
  }
  if (["TaskStop", "TaskOutput", "BashOutput", "KillShell", "KillBash", "Monitor"].includes(n)) return "run";
  return "other";
}

const mcpShort = n => n.replace(/^mcp__umbraco__/, "");
const isMcpWrite = n => /^(create|update|put|delete|move|publish|unpublish|copy|sort|post|patch|restore|empty)/.test(mcpShort(n));
const isSchemaWrite = n => n.startsWith("mcp__umbraco__") && isMcpWrite(n) && /(document-type|element-type|data-type|template)/.test(mcpShort(n));
const isContentWrite = n => n.startsWith("mcp__umbraco__") && isMcpWrite(n) && !/document-type/.test(mcpShort(n)) && /(^|-)(document|media)(-|$)/.test(mcpShort(n));
const isPageWrite = n => n.startsWith("mcp__umbraco__") && isMcpWrite(n) && !/document-type/.test(mcpShort(n)) && /(^|-)document(s)?(-|$)/.test(mcpShort(n));

const HEREDOC_TARGETS = [
  /\bcat\s*>{1,2}\s*("[^"]+"|'[^']+'|[^\s<>|;&]+)\s*<</g,
  /\bcat\s*<<-?\s*['"]?\w+['"]?\s*>{1,2}\s*("[^"]+"|'[^']+'|[^\s<>|;&]+)/g,
  /\btee\s+(?:-a\s+)?("[^"]+"|'[^']+'|[^\s<>|;&-][^\s<>|;&]*)\s*<</g,
];
const PS_WRITE = /\b(Set-Content|Out-File|Add-Content)\b|\[(System\.)?IO\.File\]::Write/g;

function shellWrites(cmd) {
  const targets = [];
  for (const re of HEREDOC_TARGETS) for (const m of cmd.matchAll(re)) targets.push(m[1].replace(/^['"]|['"]$/g, ""));
  const psWrites = (cmd.match(PS_WRITE) || []).length;
  return { targets, psWrites, heredoc: /<<-?\s*['"]?\w+/.test(cmd) };
}

const RAZOR_OR_CS = /\.(cshtml|cs)$/i;
const BUILD_FAIL = /Build FAILED|error CS\d{4}|error MSB\d{4}|error RZ\d{4}/;

// ---------------------------------------------------------------- tokens

export function sumTokens(reqs) {
  const t = { requests: reqs.length, input: 0, cacheCreate: 0, cacheRead: 0, output: 0, thinking: 0 };
  for (const r of reqs) for (const k of ["input", "cacheCreate", "cacheRead", "output", "thinking"]) t[k] += r[k];
  t.total = t.input + t.cacheCreate + t.cacheRead + t.output;
  t.totalExclCacheRead = t.total - t.cacheRead;
  return t;
}

// Splits every request's tokens over activities. `order` is the session's requests in sequence, each with
//   calls   — the tool calls that request emitted ({ id | act, w })
//   pending — what entered the context since the previous request: tool results and prompts ({ id | act, w })
//   reset   — a compaction happened before it
// and per request:
//  - output          → the tool calls it emitted (weighted by input size); no calls → base/reasoning
//  - input + cache creation (the context added since the previous request) → the tool results and
//    previous output that make up that new context (weighted by estimated size)
//  - cache read (re-reading the whole context) → the activity mix of everything in the context so far
export function spreadAttribution(order, activityById, inRun) {
  const act = i => i.act ?? activityById.get(i.id) ?? "other";
  const acts = Object.keys(ACTIVITIES);
  const out = Object.fromEntries(acts.map(a => [a, { input: 0, cacheCreate: 0, cacheRead: 0, output: 0 }]));
  let context = new Map();
  let prevOutput = [];
  const spread = (amount, items) => {
    const total = items.reduce((n, i) => n + i.w, 0);
    if (!amount) return [];
    if (!total) return [{ act: "base", v: amount }];
    return items.map(i => ({ act: act(i), v: (amount * i.w) / total }));
  };
  for (const r of order) {
    if (r.reset) { context = new Map(); prevOutput = []; }
    const ctxItems = [...context].map(([a, w]) => ({ act: a, w }));
    const readParts = spread(r.cacheRead, ctxItems);
    const newParts = spread(r.input + r.cacheCreate, [...prevOutput, ...r.pending]);
    const outParts = spread(r.output, r.calls.length ? r.calls : [{ act: "base", w: 1 }]);
    // an empty context means this read is the cached system prompt etc. — seed the context with it
    for (const p of [...(ctxItems.length ? [] : readParts), ...newParts]) context.set(p.act, (context.get(p.act) || 0) + p.v);
    prevOutput = outParts.map(p => ({ act: p.act, w: p.v }));
    if (!inRun(r.t)) continue;
    const newTotal = r.input + r.cacheCreate;
    for (const p of readParts) out[p.act].cacheRead += p.v;
    for (const p of newParts) {
      out[p.act].input += newTotal ? (p.v * r.input) / newTotal : 0;
      out[p.act].cacheCreate += newTotal ? (p.v * r.cacheCreate) / newTotal : 0;
    }
    for (const p of outParts) out[p.act].output += p.v;
  }
  for (const a of acts) {
    const x = out[a];
    for (const k of Object.keys(x)) x[k] = Math.round(x[k]);
    x.total = x.input + x.cacheCreate + x.cacheRead + x.output;
    x.totalExclCacheRead = x.total - x.cacheRead;
    x.label = ACTIVITIES[a];
  }
  return out;
}

// ---------------------------------------------------------------- Claude Code transcripts

// Usage per API request (a request is streamed as several transcript lines that repeat the usage)
function collectRequests(entries) {
  const reqs = new Map();
  for (const e of entries) {
    if (e.type !== "assistant" || !e.message?.usage) continue;
    if (e.message.model === "<synthetic>") continue;
    const key = e.requestId || e.message.id || e.uuid;
    const u = e.message.usage;
    const rec = reqs.get(key) || { key, t: ts(e), model: e.message.model, input: 0, cacheCreate: 0, cacheRead: 0, output: 0, thinking: 0 };
    rec.input = Math.max(rec.input, u.input_tokens || 0);
    rec.cacheCreate = Math.max(rec.cacheCreate, u.cache_creation_input_tokens || 0);
    rec.cacheRead = Math.max(rec.cacheRead, u.cache_read_input_tokens || 0);
    rec.output = Math.max(rec.output, u.output_tokens || 0);
    rec.thinking = Math.max(rec.thinking, u.output_tokens_details?.thinking_tokens || 0);
    reqs.set(key, rec);
  }
  return [...reqs.values()];
}

function claudeAttributionOrder(main) {
  const order = [];
  const reqs = new Map();
  let pending = [];
  let resetBefore = false;
  for (const e of main) {
    if (e.type === "system" && e.subtype === "compact_boundary") { resetBefore = true; continue; }
    if (e.type === "assistant" && e.message?.usage && e.message.model !== "<synthetic>") {
      const key = e.requestId || e.message.id || e.uuid;
      let r = reqs.get(key);
      if (!r) {
        r = { key, t: ts(e), pending, reset: resetBefore, calls: [], seen: new Set(), input: 0, cacheCreate: 0, cacheRead: 0, output: 0 };
        pending = []; resetBefore = false;
        reqs.set(key, r); order.push(r);
      }
      const u = e.message.usage;
      r.input = Math.max(r.input, u.input_tokens || 0);
      r.cacheCreate = Math.max(r.cacheCreate, u.cache_creation_input_tokens || 0);
      r.cacheRead = Math.max(r.cacheRead, u.cache_read_input_tokens || 0);
      r.output = Math.max(r.output, u.output_tokens || 0);
      for (const c of e.message.content || []) {
        if (c.type !== "tool_use" || r.seen.has(c.id)) continue;
        r.seen.add(c.id);
        r.calls.push({ id: c.id, w: JSON.stringify(c.input || {}).length + 50 });
      }
    } else if (e.type === "user" && Array.isArray(e.message?.content) && e.message.content.some(c => c.type === "tool_result")) {
      for (const c of e.message.content) {
        if (c.type !== "tool_result") continue;
        pending.push({ id: c.tool_use_id, w: textOf(c.content).length / 3.5 + countImages(c.content) * 1500 + 20 });
      }
    } else if (e.type === "user" || e.type === "attachment") {
      const len = e.type === "user" ? JSON.stringify(e.message?.content || "").length : (e.rendered || []).reduce((n, r) => n + String(r.content || "").length, 0);
      if (len) pending.push({ act: "base", w: len / 3.5 });
    }
  }
  return order;
}

function collectToolCalls(entries) {
  const calls = new Map();
  for (const e of entries) {
    if (e.type === "assistant" && Array.isArray(e.message?.content)) {
      for (const c of e.message.content) {
        if (c.type !== "tool_use" || calls.has(c.id)) continue;
        calls.set(c.id, { id: c.id, name: c.name, input: c.input || {}, t: ts(e), doneAt: null, isError: false, resultText: "" });
      }
    }
  }
  for (const e of entries) {
    if (e.type !== "user" || !Array.isArray(e.message?.content)) continue;
    for (const c of e.message.content) {
      if (c.type !== "tool_result") continue;
      const call = calls.get(c.tool_use_id);
      if (!call) continue;
      call.doneAt = ts(e);
      call.isError = !!c.is_error;
      call.resultText = textOf(c.content).slice(0, 4000);
    }
  }
  return [...calls.values()].sort((a, b) => a.t - b.t);
}

function loadSubagentEntries(transcriptFile, sessionId, mainEntries) {
  const side = mainEntries.filter(e => e.isSidechain);
  const dir = path.join(path.dirname(transcriptFile), sessionId, "subagents");
  if (fs.existsSync(dir)) {
    // workflow agents sit deeper: subagents/workflows/<id>/agent-*.jsonl (journal.jsonl is the workflow's own log)
    const files = fs.readdirSync(dir, { recursive: true }).map(f => f.replaceAll("\\", "/"));
    for (const f of files.filter(f => f.endsWith(".jsonl") && (!f.includes("/") || path.posix.basename(f).startsWith("agent-")))) side.push(...readTranscript(path.join(dir, f)));
  }
  return side;
}

// A Claude Code transcript as the normalized session analyzeNormalized works on
function normalizeClaude(file) {
  const all = readTranscript(file);
  const main = all.filter(e => !e.isSidechain);
  const sessionId = all.find(e => e.sessionId)?.sessionId || path.basename(file, ".jsonl");
  const assistants = main.filter(e => e.type === "assistant");
  const inRange = (e, a, b) => ts(e) >= a && ts(e) <= b;
  const cost = all.filter(e => e.type === "cost-state").at(-1);
  return {
    provider: "anthropic",
    sessionId,
    prompts: main.filter(isHumanPrompt).sort((a, b) => ts(a) - ts(b))
      .map(e => ({ t: ts(e), text: promptText(e), cwd: e.cwd, version: e.version, entrypoint: e.entrypoint, permissionMode: e.permissionMode })),
    assistantTimes: assistants.map(ts),
    assistantTexts: assistants.map(e => ({ t: ts(e), text: (e.message?.content || []).filter(c => c.type === "text").map(c => c.text).join("\n\n") })).filter(x => x.text),
    calls: collectToolCalls(main),
    requestsIn: (a, b) => collectRequests(main.filter(e => inRange(e, a, b))),
    subRequestsIn: inRun => collectRequests(loadSubagentEntries(file, sessionId, all).filter(e => inRun(ts(e)))),
    attribute: (activityById, inRun) => spreadAttribution(claudeAttributionOrder(main), activityById, inRun),
    identityBefore: t => all.filter(e => e.type === "attachment" && e.attachment?.type === "model" && ts(e) <= t).at(-1)?.attachment?.identity,
    effortSamplesIn: (a, b) => assistants.filter(e => inRange(e, a, b)).map(e => e.effort).filter(Boolean),
    // ultracode is a session mode on top of the effort level; the transcript marks it with ultra_effort_enter/exit
    ultraAt: t => all.filter(e => e.type === "attachment" && /^ultra_effort_(enter|exit)$/.test(e.attachment?.type || "") && ts(e) <= t).at(-1)?.attachment.type === "ultra_effort_enter",
    costUsd: cost?.totalCostUSD ?? null,
    interruptionTimes: main.filter(e => e.type === "user" && /^\[Request interrupted/.test(promptText(e))).map(ts),
    compactionTimes: main.filter(e => e.isCompactSummary || e.subtype === "compact_boundary").map(ts),
    apiErrorTimes: main.filter(e => e.type === "system" && e.subtype === "api_error").map(ts),
  };
}

// ---------------------------------------------------------------- main

export function analyzeTranscript(file, opts = {}) {
  const norm = isCodexRollout(file) ? normalizeCodex(file) : normalizeClaude(file);
  return { ...analyzeNormalized(norm, opts), transcript: file };
}

export function analyzeNormalized(norm, { includeFollowups = false } = {}) {
  const { sessionId, prompts } = norm;
  const warnings = [];

  let p2 = prompts.find(p => P2_MARKER.test(p.text));
  if (!p2) {
    warnings.push("Blog prompt marker not found — using the last human prompt as the blog prompt.");
    p2 = prompts.at(-1);
  }
  if (!p2) throw new Error(`Could not find the benchmark prompts in session ${sessionId}`);
  const before = prompts.filter(p => p.t < p2.t).at(-1);
  const p1 = before && P1_MARKER.test(before.text) ? before : null;
  const variant = detectVariant(p2.text);

  const after = prompts.filter(p => p.t > p2.t);
  const lastAssistantBefore = limit => norm.assistantTimes.filter(t => t < limit).at(-1);

  const segEndLimit = !includeFollowups && after.length ? after[0].t : Infinity;
  const tStart2 = p2.t;
  const tEnd = lastAssistantBefore(segEndLimit) ?? tStart2;
  const tStart1 = p1 ? p1.t : null;
  const tEnd1 = p1 ? (lastAssistantBefore(tStart2) ?? p1.t) : null;

  const inRun = t => (tStart1 != null && t >= tStart1 && t <= tEnd1) || (t >= tStart2 && t <= tEnd);
  const inBlog = t => t >= tStart2 && t <= tEnd;

  // ---- tool calls (whole session for activity lookup, run segments for counting)
  const sessionCalls = norm.calls;
  const activityById = new Map(sessionCalls.map(c => [c.id, activityOf(c)]));
  const calls = sessionCalls.filter(c => inRun(c.t));
  const calls2 = calls.filter(c => c.t >= tStart2);

  // ---- tokens
  const req1 = p1 ? norm.requestsIn(tStart1, tEnd1) : [], req2 = norm.requestsIn(tStart2, tEnd);
  const reqSub = norm.subRequestsIn(inRun);
  const tokens = sumTokens([...req1, ...req2, ...reqSub]);
  tokens.subagentRequests = reqSub.length;
  const byActivity = norm.attribute(activityById, inRun);
  if (reqSub.length) {
    const s = sumTokens(reqSub);
    Object.assign(byActivity.other, { input: byActivity.other.input + s.input, cacheCreate: byActivity.other.cacheCreate + s.cacheCreate,
      cacheRead: byActivity.other.cacheRead + s.cacheRead, output: byActivity.other.output + s.output });
    byActivity.other.total = byActivity.other.input + byActivity.other.cacheCreate + byActivity.other.cacheRead + byActivity.other.output;
    byActivity.other.totalExclCacheRead = byActivity.other.total - byActivity.other.cacheRead;
  }
  tokens.byActivity = byActivity;
  const tokensBlogOnly = sumTokens(req2);

  const byCategory = {}, byTool = {}, callsByActivity = {};
  for (const c of calls) {
    byCategory[toolCategory(c.name)] = (byCategory[toolCategory(c.name)] || 0) + 1;
    byTool[c.name] = (byTool[c.name] || 0) + 1;
    const a = activityById.get(c.id);
    callsByActivity[a] = (callsByActivity[a] || 0) + 1;
  }
  const mcpCalls = calls.filter(c => c.name.startsWith("mcp__umbraco__"));
  const shellCalls = calls.filter(c => c.name === "Bash" || c.name === "PowerShell");
  const cmd = c => String(c.input.command || "");

  let heredocCalls = 0, heredocFiles = 0, psWrites = 0;
  const filesWritten = new Set();
  const codeWrites = [];
  for (const c of calls) {
    if (["Write", "Edit", "MultiEdit"].includes(c.name) && c.input.file_path) {
      filesWritten.add(c.input.file_path);
      codeWrites.push({ t: c.t, done: c.doneAt || c.t, file: c.input.file_path });
    }
    if (c.name === "Bash" || c.name === "PowerShell") {
      const w = shellWrites(cmd(c));
      if (w.heredoc && w.targets.length) heredocCalls++;
      heredocFiles += w.targets.length;
      psWrites += w.psWrites;
      for (const f of w.targets) { filesWritten.add(f); codeWrites.push({ t: c.t, done: c.doneAt || c.t, file: f }); }
      if (w.psWrites) codeWrites.push({ t: c.t, done: c.doneAt || c.t, file: MIGRATION_PATH.test(cmd(c)) ? "Migrations/(PowerShell write).cs" : "(PowerShell write).cs" });
    }
  }

  const builds = shellCalls.filter(c => /dotnet\s+build/.test(cmd(c)));
  const buildFailures = builds.filter(c => BUILD_FAIL.test(c.resultText));
  const starts = shellCalls.filter(c => /dotnet\s+(run|watch)/.test(cmd(c)));
  const failed = calls.filter(c => c.isError).map(c => ({
    tool: c.name, atSec: Math.round((c.t - tStart2) / 1000), error: c.resultText.replace(/\s+/g, " ").slice(0, 240),
  }));
  const browserCalls = calls.filter(c => isBrowserTool(c.name) || ((c.name === "Bash" || c.name === "PowerShell") && /playwright/i.test(cmd(c))));

  // did the model build schema/content through the channel the test asked for?
  const channel = {
    umbracoMcpCalls: mcpCalls.length,
    umbracoMcpWrites: mcpCalls.filter(c => isMcpWrite(c.name)).length,
    browserCalls: browserCalls.length,
    migrationFileWrites: codeWrites.filter(w => MIGRATION_PATH.test(w.file)).length,
    managementApiShellCalls: shellCalls.filter(c => /management\/api/i.test(cmd(c))).length,
    uSyncFileWrites: codeWrites.filter(w => /uSync[\\/]/i.test(w.file)).length,
    databaseShellCalls: shellCalls.filter(c => /sqlite3?\b|\.sqlite\.db/i.test(cmd(c)) && !/ls |dir |Test-Path/i.test(cmd(c))).length,
  };

  // clean room: file tools reaching outside the project folder (package caches and the scratchpad are fine).
  // Codex reads files through the shell; its reader passes those paths as input.readPaths.
  const norm_ = p => String(p).replace(/\\/g, "/").toLowerCase();
  const root = norm_(p2.cwd || "").replace(/\/$/, "") + "/";
  const MEMORY = /\/\.claude\/projects\/[^/]+\/memory(\/|$)/;
  const pathOf = c => c.input.file_path || c.input.path || c.input.notebook_path;
  const filePaths = [
    ...calls.filter(c => ["Read", "Edit", "Write", "MultiEdit", "NotebookEdit", "Grep", "Glob"].includes(c.name) && pathOf(c)).map(c => norm_(pathOf(c))),
    ...calls.flatMap(c => c.input.readPaths || []).map(p => norm_(path.isAbsolute(p) || !p2.cwd ? p : path.join(p2.cwd, p))),
  ];
  channel.memoryAccess = filePaths.filter(p => MEMORY.test(p)).length + shellCalls.filter(c => MEMORY.test(norm_(cmd(c)))).length;
  channel.outsideFolderPaths = [...new Set(filePaths.filter(p => /^([a-z]:)?\//.test(p) && !(p + "/").startsWith(root) && !MEMORY.test(p)
    && !/\/\.nuget\/|\/appdata\/local\/temp\/claude\//.test(p)))].slice(0, 25);
  channel.benchFolderShellRefs = shellCalls.filter(c => BENCH_FOLDER_REF.test(cmd(c))).length;

  // ---- phase markers (blog prompt), per test
  const first = (list, pred, from) => list.find(c => c.t >= from && pred(c));
  const stopOrBuild = c => ["TaskStop", "KillShell", "KillBash"].includes(c.name)
    || ((c.name === "Bash" || c.name === "PowerShell") && /dotnet\s+build|taskkill|Stop-Process|\bpkill\b|\bkill\s+-?\d|\bkill\s+%/.test(cmd(c)));
  const razorStartAfter = from => {
    if (from == null) return null;
    const c = [first(calls2, stopOrBuild, from)?.t, codeWrites.find(w => w.t >= from && RAZOR_OR_CS.test(w.file) && !MIGRATION_PATH.test(w.file))?.t].filter(x => x != null);
    return c.length ? Math.min(...c) : null;
  };
  const changeDone = [
    ...codeWrites.filter(w => w.t >= tStart2).map(w => w.done),
    ...builds.filter(c => c.t >= tStart2).map(c => c.doneAt || c.t),
    ...starts.filter(c => c.t >= tStart2).map(c => c.doneAt || c.t),
    ...calls2.filter(c => c.name.startsWith("mcp__umbraco__") && isMcpWrite(c.name)).map(c => c.doneAt || c.t),
  ].filter(t => t <= tEnd);
  const tLastChange = changeDone.length ? Math.max(...changeDone) : null;

  let markerDefs;
  if (variant === "migrations") {
    const tMig = codeWrites.find(w => w.t >= tStart2 && MIGRATION_PATH.test(w.file))?.t ?? null;
    const tBoot = tMig != null ? calls2.find(c => c.t > tMig && (c.name === "Bash" || c.name === "PowerShell") && /dotnet\s+(build|run|watch)/.test(cmd(c)))?.t ?? null : null;
    const tRazor = tBoot != null ? codeWrites.find(w => w.t > tBoot && /\.cshtml$/i.test(w.file))?.t ?? null : null;
    markerDefs = [
      ["Read rules, plan → first migration written", tMig],
      ["Writing migrations", tBoot],
      ["Build, boot & fix migrations", tRazor],
      ["Razor, build, restart", tLastChange],
    ];
  } else if (variant === "playwright") {
    const tBrowser = browserCalls.find(c => c.t >= tStart2)?.t ?? null;
    markerDefs = [
      ["Boot, read rules, plan → first browser action", tBrowser],
      ["Backoffice: modeling and content (browser)", razorStartAfter(tBrowser)],
      ["Stop, build, Razor, restart", tLastChange],
    ];
  } else {
    const tModel = first(calls2, c => isSchemaWrite(c.name), tStart2)?.t ?? null;
    // Modelling ends with the last schema change before the first page is written. Some models upload media or make
    // folders in between, which counts as modelling; "first content write" made that phase 0 s for them.
    const tFirstPage = first(calls2, c => isPageWrite(c.name), tModel ?? tStart2)?.t ?? null;
    const lastSchema = tFirstPage != null ? calls2.filter(c => isSchemaWrite(c.name) && c.t >= (tModel ?? tStart2) && c.t < tFirstPage).at(-1) : null;
    const tContent = lastSchema ? Math.min(lastSchema.doneAt ?? lastSchema.t, tFirstPage) : first(calls2, c => isContentWrite(c.name), tModel ?? tStart2)?.t ?? null;
    markerDefs = [
      ["Boot, read rules, plan → first type created", tModel],
      ["Content modeling", tContent],
      ["Content: media, pages, publish", razorStartAfter(tContent)],
      ["Stop, build, Razor, restart", tLastChange],
    ];
  }
  markerDefs.push(["Checking the result and final report", tEnd]);

  const phases = [{ key: "prompt1", label: variant === "playwright" ? "Prompt 1: verify browser" : "Prompt 1: verify MCP", ms: p1 ? tEnd1 - tStart1 : null }];
  const markers = { blogPrompt: 0 };
  let prev = tStart2;
  for (const [label, t] of markerDefs) {
    if (t == null) warnings.push(`Phase "${label}": end marker not detected — phase collapsed to 0.`);
    const at = Math.min(Math.max(t ?? prev, prev), tEnd);
    phases.push({ key: label, label, ms: at - prev });
    markers[label] = Math.round((at - tStart2) / 1000);
    prev = at;
  }
  if (variant !== "migrations") {
    const tContent = calls2.find(c => isContentWrite(c.name))?.t ?? browserCalls.find(c => c.t >= tStart2)?.t;
    const firstRazorWrite = codeWrites.find(w => w.t >= tStart2 && /\.cshtml$/i.test(w.file))?.t;
    if (firstRazorWrite && tContent && firstRazorWrite < tContent) warnings.push("Razor views were written before content was created (order of operations not followed).");
  }

  // ---- identity
  const reqModels = {};
  for (const r of [...req1, ...req2]) reqModels[r.model] = (reqModels[r.model] || 0) + 1;
  const modelId = Object.entries(reqModels).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";
  const identity = norm.identityBefore(tStart2);
  const effortCounts = {};
  for (const e of norm.effortSamplesIn(tStart2, tEnd)) effortCounts[e] = (effortCounts[e] || 0) + 1;
  const baseEffort = Object.entries(effortCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const effort = norm.ultraAt(tEnd) ? "ultracode" : baseEffort;

  // final report = assistant text after the last tool call of the run
  const lastToolT = calls2.at(-1)?.t ?? tStart2;
  const finalReport = norm.assistantTexts.filter(a => inBlog(a.t) && a.t >= lastToolT).map(a => a.text).join("\n\n").trim();

  return {
    sessionId,
    provider: norm.provider,
    variant,
    claudeCodeVersion: p2.version || null,
    entrypoint: p2.entrypoint || null,
    permissionMode: p2.permissionMode || null,
    cwd: p2.cwd || null,
    model: { id: modelId, name: modelDisplayName(modelId, identity?.marketingName), marketingName: identity?.marketingName || null, requestsByModel: reqModels },
    effort,
    baseEffort,
    startedAt: new Date(tStart1 ?? tStart2).toISOString(),
    endedAt: new Date(tEnd).toISOString(),
    prompts: {
      prompt1: p1 ? p1.text : null,
      prompt2: p2.text,
      followUpsDuringRun: includeFollowups ? after.filter(p => p.t <= tEnd).map(p => p.text) : [],
      promptsAfterRunExcluded: includeFollowups ? 0 : after.length,
    },
    time: {
      phases,
      prompt1Ms: phases[0].ms,
      blogPromptMs: tEnd - tStart2,
      totalMs: (phases[0].ms || 0) + (tEnd - tStart2),
    },
    tokens,
    tokensBlogOnly,
    // session cost includes anything said after the run, so only trust it when nothing was excluded
    estimatedSessionCostUSD: after.length && !includeFollowups ? null : norm.costUsd ?? null,
    tools: {
      total: calls.length,
      perRequest: req1.length + req2.length ? +(calls.length / (req1.length + req2.length)).toFixed(2) : null,
      byCategory,
      byActivity: callsByActivity,
      byTool,
      mcp: { total: mcpCalls.length, writes: mcpCalls.filter(c => isMcpWrite(c.name)).length, reads: mcpCalls.filter(c => !isMcpWrite(c.name)).length },
      failed,
      heredoc: { calls: heredocCalls, files: heredocFiles },
      powershellFileWrites: psWrites,
      filesWritten: [...filesWritten],
      dotnetBuilds: builds.length,
      dotnetBuildFailures: buildFailures.length,
      dotnetRuns: starts.length,
    },
    channel,
    interruptions: norm.interruptionTimes.filter(inBlog).length,
    compactions: norm.compactionTimes.filter(inBlog).length,
    apiErrorsRetried: norm.apiErrorTimes.filter(inBlog).length,
    finalReport,
    markers,
    warnings,
  };
}

export function findTranscripts(projectsDir, dirPattern) {
  if (!fs.existsSync(projectsDir)) return [];
  const out = [];
  for (const d of fs.readdirSync(projectsDir, { withFileTypes: true })) {
    if (!d.isDirectory() || !dirPattern.test(d.name)) continue;
    const dir = path.join(projectsDir, d.name);
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".jsonl")) continue;
      const full = path.join(dir, f);
      out.push({ file: full, sessionId: f.replace(/\.jsonl$/, ""), mtime: fs.statSync(full).mtimeMs });
    }
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}

export function looksLikeBenchmark(file) {
  return P2_MARKER.test(fs.readFileSync(file, "utf8"));
}
