// Reads a Codex rollout (~/.codex/sessions/YYYY/MM/DD/rollout-<time>-<threadId>.jsonl) into the normalized session
// that transcript.mjs's analyzeNormalized turns into metrics. Codex's actions are mapped onto Claude Code tool names
// so one set of rules classifies both: shell commands → Bash/PowerShell, file edits → Write/Edit,
// MCP calls → mcp__<server>__<tool>, web searches → WebSearch.
import fs from "node:fs";
import path from "node:path";
import { readTranscript, ts, spreadAttribution } from "./transcript.mjs";

export function isCodexRollout(file) {
  try {
    const fd = fs.openSync(file, "r");
    const buf = Buffer.alloc(4096);
    const n = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    return /^\{"timestamp":"[^"]+","type":"session_meta"/.test(buf.toString("utf8", 0, n)) || /"type":"session_meta"/.test(buf.toString("utf8", 0, n).split("\n")[0]);
  } catch { return false; }
}

const textOfContent = c => (Array.isArray(c) ? c.map(x => x.text ?? "").join("\n") : String(c ?? "")).trim();

// ["powershell.exe", "-Command", "Get-Content x"] → { shell: "PowerShell", command: "Get-Content x" }
function shellCommand(cmd) {
  const parts = Array.isArray(cmd) ? cmd : [String(cmd ?? "")];
  const exe = path.basename(String(parts[0] || "")).toLowerCase();
  const i = parts.findIndex(p => /^-(Command|c)$/i.test(p) || p === "/c");
  const command = i >= 0 ? parts.slice(i + 1).join(" ") : parts.join(" ");
  return { shell: /powershell|pwsh|cmd/.test(exe) ? "PowerShell" : "Bash", command };
}

// The tool calls one completed Codex item stands for (a FileChange touching three files is three Write/Edit calls)
function callsFromItem(item, t, doneAt) {
  const base = { t, doneAt, isError: item.status === "failed" };
  switch (item.type) {
    case "CommandExecution": {
      const { shell, command } = shellCommand(item.command);
      const out = item.aggregated_output ?? `${item.stdout ?? ""}${item.stderr ?? ""}`;
      return [{ ...base, id: item.id, name: shell, input: { command, readPaths: (item.parsed_cmd || []).filter(p => p.type === "read" && p.path).map(p => p.path) },
        isError: base.isError || (item.exit_code != null && item.exit_code !== 0), resultText: String(out), resultLen: String(out).length }];
    }
    case "FileChange": {
      const changes = Array.isArray(item.changes) ? item.changes.map(c => [c.path, c]) : Object.entries(item.changes || {});
      return changes.map(([file, c], i) => ({ ...base, id: `${item.id}#${i}`, name: (c.type || c.kind) === "add" ? "Write" : "Edit",
        input: { file_path: file }, resultText: String(item.stdout ?? ""), resultLen: String(item.stdout ?? "").length }));
    }
    case "McpToolCall": {
      const result = item.error ? JSON.stringify(item.error) : textOfContent(item.result?.content) || JSON.stringify(item.result ?? "");
      return [{ ...base, id: item.id, name: `mcp__${item.server}__${item.tool}`, input: item.arguments || {},
        isError: base.isError || !!item.error || !!item.result?.isError, resultText: result, resultLen: result.length }];
    }
    case "WebSearch":
      return [{ ...base, id: item.id, name: "WebSearch", input: { query: item.query ?? item.action?.query ?? "" }, resultText: "", resultLen: 200 }];
    case "CollabAgentToolCall":
    case "SubAgent":
      return [{ ...base, id: item.id, name: "Agent", input: { prompt: item.prompt ?? "" }, resultText: "", resultLen: 200 }];
    default:
      return [];
  }
}

function requestFrom(e, ctx) {
  const u = e.payload.usage || {};
  const cacheRead = u.cached_input_tokens || 0, cacheCreate = u.cache_write_input_tokens || 0;
  return {
    key: e.payload.response_id || `${ts(e)}`, t: ts(e), model: ctx.model || "unknown", effort: ctx.effort || null,
    input: Math.max(0, (u.input_tokens || 0) - cacheRead - cacheCreate), cacheCreate, cacheRead,
    output: u.output_tokens || 0, thinking: u.reasoning_output_tokens || 0,
  };
}

// Sub-agents run as their own threads with their own rollout files, which name their parent thread
function subRolloutRequests(file, sessionId) {
  const dir = path.dirname(path.resolve(file));
  const out = [];
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".jsonl") && path.join(dir, f).toLowerCase() !== path.resolve(file).toLowerCase())) {
    const full = path.join(dir, f);
    const head = fs.readFileSync(full, "utf8").split("\n")[0] || "";
    if (!head.includes(sessionId)) continue;
    let ctx = {};
    for (const e of readTranscript(full)) {
      if (e.type === "turn_context") ctx = e.payload;
      else if (e.type === "token_usage_record") out.push(requestFrom(e, ctx));
    }
  }
  return out;
}

export function normalizeCodex(file) {
  const all = readTranscript(file);
  const meta = all.find(e => e.type === "session_meta")?.payload || {};
  const sessionId = meta.id || meta.session_id || path.basename(file, ".jsonl");
  const prompts = [], assistantTimes = [], assistantTexts = [], calls = [], requests = [], subRequests = [], order = [];
  const interruptionTimes = [], compactionTimes = [], apiErrorTimes = [];
  const startedAt = new Map();
  let ctx = {}, lastCallT = null, lastActionDone = null, current = null, pending = [], resetBefore = false;

  for (const e of all) {
    const p = e.payload || {};
    const t = ts(e);
    if (e.type === "turn_context") { ctx = p; continue; }
    if (e.type === "compacted" || (e.type === "event_msg" && /compact/.test(p.type || ""))) { compactionTimes.push(t); resetBefore = true; continue; }
    if (e.type === "token_usage_record") {
      const r = requestFrom(e, ctx);
      if (p.thread_id && p.thread_id !== sessionId) { subRequests.push(r); continue; }
      requests.push(r);
      assistantTimes.push(t);
      current = { ...r, pending, reset: resetBefore, calls: [] };
      pending = []; resetBefore = false;
      order.push(current);
      continue;
    }
    if (e.type === "response_item" && /call$/.test(p.type || "")) { lastCallT = t; lastActionDone = null; assistantTimes.push(t); continue; }
    if (e.type !== "event_msg") continue;
    if (p.type === "turn_aborted") { interruptionTimes.push(t); continue; }
    if (/error/.test(p.type || "")) { apiErrorTimes.push(t); continue; }
    if (p.type === "item_started" && p.item?.id) { startedAt.set(p.item.id, t); continue; }
    if (p.type !== "item_completed" || !p.item) continue;
    const item = p.item;
    if (item.type === "UserMessage") {
      const text = textOfContent(item.content);
      prompts.push({ t, text, cwd: ctx.cwd || meta.cwd, version: meta.cli_version || null, entrypoint: `codex ${meta.originator || meta.source || ""}`.trim(),
        permissionMode: [ctx.approval_policy, ctx.approvals_reviewer, ctx.sandbox_policy?.type].filter(Boolean).join(" / ") || null });
      pending.push({ act: "base", w: text.length / 3.5 });
      continue;
    }
    if (item.type === "AgentMessage") {
      assistantTimes.push(t);
      assistantTexts.push({ t, text: textOfContent(item.content) });
      continue;
    }
    // One `exec` script can run many actions in a row, so the script's own time isn't each action's start:
    // completion minus the item's duration is, else the previous action's completion in the same script
    const dur = item.duration ? (item.duration.secs || 0) * 1000 + Math.round((item.duration.nanos || 0) / 1e6) : null;
    const start = startedAt.get(item.id) ?? (dur != null ? t - dur : Math.max(lastCallT ?? t, lastActionDone ?? -Infinity));
    lastActionDone = t;
    for (const c of callsFromItem(item, Math.min(start, t), t)) {
      calls.push({ ...c, resultText: c.resultText.slice(0, 4000) });
      current?.calls.push({ id: c.id, w: JSON.stringify(c.input).length + 50 });
      pending.push({ id: c.id, w: c.resultLen / 3.5 + 20 });
    }
  }
  if (fs.existsSync(path.dirname(file))) subRequests.push(...subRolloutRequests(file, sessionId));

  assistantTimes.sort((a, b) => a - b);
  calls.sort((a, b) => a.t - b.t);
  return {
    provider: "openai",
    sessionId,
    prompts: prompts.sort((a, b) => a.t - b.t),
    assistantTimes,
    assistantTexts,
    calls,
    requestsIn: (a, b) => requests.filter(r => r.t >= a && r.t <= b),
    subRequestsIn: inRun => subRequests.filter(r => inRun(r.t)),
    attribute: (activityById, inRun) => spreadAttribution(order, activityById, inRun),
    identityBefore: () => null,
    effortSamplesIn: (a, b) => requests.filter(r => r.t >= a && r.t <= b).map(r => r.effort).filter(Boolean),
    ultraAt: () => false,
    costUsd: null, // subscription; no per-token price in the rollout
    interruptionTimes,
    compactionTimes,
    apiErrorTimes,
  };
}
