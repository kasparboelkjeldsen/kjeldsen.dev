// Drives the Codex CLI for the autonomous runner (bench/auto.mjs), the counterpart of claude.mjs.
// One `codex app-server` process per run, spoken to over JSON-RPC on stdio (initialize → thread/start → turn/start…),
// so prompt 1 and prompt 2 share a process and the MCP servers stay connected while Umbraco is restarted —
// `codex exec resume` would start them fresh with Umbraco down, and their tools never appear.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fmtDuration } from "./common.mjs";
import { cleanEnv, killTree } from "./claude.mjs";

export const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");

// Sessions run without the desktop app's extras: Claude has no browser or computer use in the benchmark, and a browser
// could click through the backoffice. The test's own MCP servers come in through mcpServerArgs.
export const DISABLED_FEATURES = ["plugins", "apps", "browser_use", "browser_use_external", "computer_use", "in_app_browser", "image_generation", "memories"];

// ---------------------------------------------------------------- binary

export function resolveCodexBin(explicit) {
  const pick = explicit || process.env.BENCH_CODEX;
  if (pick) {
    if (!fs.existsSync(pick)) throw new Error(`Codex CLI not found at ${pick}`);
    return pick;
  }
  const where = spawnSync(process.platform === "win32" ? "where.exe" : "which", ["codex"], { encoding: "utf8" });
  const onPath = (where.stdout || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const native = onPath.find(p => /\.exe$/i.test(p)) || onPath.find(p => !/\.(cmd|bat|ps1)$/i.test(p));
  if (native) return native;
  // the desktop app keeps its CLI in %LOCALAPPDATA%\OpenAI\Codex\bin\<hash>\codex.exe
  const root = path.join(process.env.LOCALAPPDATA || "", "OpenAI", "Codex", "bin");
  const bundled = fs.existsSync(root) ? fs.readdirSync(root).map(d => path.join(root, d, "codex.exe")).filter(f => fs.existsSync(f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs) : [];
  if (bundled[0]) return bundled[0];
  throw new Error("Codex CLI not found. Install the Codex app or CLI, or pass --codex <path> / set BENCH_CODEX.");
}

export const codexVersion = bin => (spawnSync(bin, ["--version"], { encoding: "utf8", env: cleanEnv() }).stdout || "").trim().replace(/^codex-cli\s*/, "") || null;

export function codexAuth(bin) {
  const r = spawnSync(bin, ["login", "status"], { encoding: "utf8", env: cleanEnv() });
  const text = `${r.stdout || ""}${r.stderr || ""}`.trim();
  return { loggedIn: r.status === 0 && /logged in/i.test(text), authMethod: text.replace(/^Logged in using\s*/i, "") };
}

// The ChatGPT plan's usage windows, read from a short-lived app-server (free: no model call).
// → { usedPercent, resetsAt (ms), weeklyUsedPercent, weeklyResetsAt, allowed, limitReached, plan }
export async function codexRateLimits(bin) {
  const child = spawn(bin, ["app-server"], { env: cleanEnv(), stdio: ["pipe", "pipe", "ignore"], windowsHide: true });
  try {
    let buf = "", id = 0;
    const waits = new Map();
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", d => {
      buf += d;
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 1);
        try { const m = JSON.parse(line); if (m.id != null && waits.has(m.id) && !m.method) waits.get(m.id)(m); } catch {}
      }
    });
    const rpc = (method, params) => Promise.race([
      new Promise(r => { const n = ++id; waits.set(n, r); child.stdin.write(JSON.stringify({ id: n, method, params }) + "\n"); }),
      new Promise((_, rej) => setTimeout(() => rej(new Error(`codex ${method} timed out`)), 30_000)),
    ]);
    await rpc("initialize", { clientInfo: { name: "umbraco-bench", version: "1.0.0" } });
    child.stdin.write(JSON.stringify({ method: "initialized", params: {} }) + "\n");
    const r = (await rpc("account/rateLimits/read", {})).result || {};
    const l = r.rateLimits || {};
    return {
      usedPercent: l.primary?.usedPercent ?? null, resetsAt: l.primary?.resetsAt ? l.primary.resetsAt * 1000 : null,
      weeklyUsedPercent: l.secondary?.usedPercent ?? null, weeklyResetsAt: l.secondary?.resetsAt ? l.secondary.resetsAt * 1000 : null,
      allowed: r.ordinaryUsageAllowed !== false, limitReached: l.rateLimitReachedType ?? null, plan: l.planType ?? null,
    };
  } finally { killTree(child.pid); }
}

// A turn or session error that means the plan's allowance ran out, not that the model failed
export const isUsageLimitError = s => /usage.?limit|rate.?limit|usageLimit|quota|too many requests|\b429\b|limit reached|hit your .*limit/i.test(String(s ?? ""));

// ---------------------------------------------------------------- config

const toml = v => Array.isArray(v) ? `[${v.map(toml).join(",")}]`
  : v && typeof v === "object" ? `{${Object.entries(v).map(([k, x]) => `${/^[A-Za-z0-9_-]+$/.test(k) ? k : JSON.stringify(k)}=${toml(x)}`).join(",")}}`
  : typeof v === "string" ? JSON.stringify(v) : String(v);

// ${VAR:-default} as Claude Code expands it in .mcp.json
const expand = s => String(s).replace(/\$\{(\w+)(?::-([^}]*))?\}/g, (_, k, d) => process.env[k] ?? d ?? "");

// The project's .mcp.json as `-c mcp_servers.<name>.…` overrides. On Windows a bare "npx" isn't something Codex can
// spawn (it's npx.cmd) and the server silently never starts, so commands go through cmd.exe like the desktop app's own.
export function mcpServerArgs(mcpJsonFile, cwd) {
  if (!mcpJsonFile || !fs.existsSync(mcpJsonFile)) return { args: [], names: [] };
  const servers = JSON.parse(fs.readFileSync(mcpJsonFile, "utf8")).mcpServers || {};
  const args = [];
  for (const [name, s] of Object.entries(servers)) {
    const wrap = process.platform === "win32" && !/\.exe$/i.test(s.command) && !path.isAbsolute(s.command);
    const command = wrap ? "cmd.exe" : s.command;
    const cmdArgs = wrap ? ["/d", "/c", s.command, ...(s.args || [])] : (s.args || []);
    const env = Object.fromEntries(Object.entries(s.env || {}).map(([k, v]) => [k, expand(v)]));
    const p = `mcp_servers.${name}`;
    args.push("-c", `${p}.command=${toml(command)}`, "-c", `${p}.args=${toml(cmdArgs)}`, "-c", `${p}.cwd=${toml(cwd)}`, "-c", `${p}.startup_timeout_sec=120`);
    if (Object.keys(env).length) args.push("-c", `${p}.env=${toml(env)}`);
  }
  return { args, names: Object.keys(servers) };
}

// MCP servers from the user's own config.toml (e.g. the desktop app's node_repl), switched off for the run
export function userMcpServerOffArgs(keep = []) {
  const file = path.join(CODEX_HOME, "config.toml");
  if (!fs.existsSync(file)) return [];
  const names = [...new Set([...fs.readFileSync(file, "utf8").matchAll(/^\[mcp_servers\.([A-Za-z0-9_-]+)\]/gm)].map(m => m[1]))];
  return names.filter(n => !keep.includes(n)).flatMap(n => ["-c", `mcp_servers.${n}.enabled=false`]);
}

export function findRollout(threadId) {
  const dir = path.join(CODEX_HOME, "sessions");
  if (!fs.existsSync(dir)) return null;
  const hit = fs.readdirSync(dir, { recursive: true }).find(f => String(f).endsWith(`${threadId}.jsonl`));
  return hit ? path.join(dir, hit) : null;
}

// ---------------------------------------------------------------- session

const oneLine = (s, n) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
};

function describeItem(it) {
  switch (it.type) {
    case "commandExecution": return `shell  ${oneLine(String(it.command).replace(/^"[^"]*powershell\.exe"\s+-Command\s+/i, ""), 110)}`;
    case "mcpToolCall": return `${it.server}:${it.tool}  ${oneLine(JSON.stringify(it.arguments ?? {}), 90)}`;
    case "fileChange": return `edit  ${(it.changes || []).map(c => `${c.kind?.type ?? c.kind ?? ""} ${path.basename(c.path)}`).join(", ")}`;
    case "webSearch": return `web search  ${oneLine(it.query, 100)}`;
    default: return null;
  }
}

// app-server requests that would need a human: with the auto reviewer and full access they shouldn't come, but nothing
// may hang waiting for an answer, so each is declined (and printed)
const DECLINE = {
  "item/commandExecution/requestApproval": { decision: "decline" },
  "item/fileChange/requestApproval": { decision: "decline" },
  "item/permissions/requestApproval": { decision: "decline" },
  "execCommandApproval": { decision: "denied" },
  "applyPatchApproval": { decision: "denied" },
  "mcpServer/elicitation/request": { action: "decline" },
};

export class CodexSession {
  constructor({ bin, cwd, cliArgs = [], thread, logFile, label = "codex", quiet = false }) {
    Object.assign(this, { bin, cwd, cliArgs, thread, logFile, label, quiet });
    this.nextId = 1;
    this.pending = new Map();
    this.turn = null;
    this.mcpStartup = new Map();
  }

  async open() {
    fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    this.log = fs.createWriteStream(this.logFile, { flags: "a" });
    this.child = spawn(this.bin, ["app-server", ...this.cliArgs], { cwd: this.cwd, env: cleanEnv(), stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    this.exited = new Promise(resolve => this.child.on("exit", code => {
      this.exitCode = code;
      const err = new Error(`${this.label}: codex app-server exited (code ${code}). Log: ${this.logFile}`);
      for (const p of this.pending.values()) p.reject(err);
      this.pending.clear();
      if (this.turn) this.turn.fail(err);
      resolve(code);
    }));
    let buf = "";
    this.child.stdout.setEncoding("utf8");
    this.child.stdout.on("data", chunk => {
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        this.log.write(line + "\n");
        let m;
        try { m = JSON.parse(line); } catch { continue; }
        this.onMessage(m);
      }
    });
    this.child.stderr.setEncoding("utf8");
    this.child.stderr.on("data", s => this.log.write(JSON.stringify({ type: "stderr", text: s }) + "\n"));

    await this.rpc("initialize", { clientInfo: { name: "umbraco-bench", version: "1.0.0" } });
    this.notify("initialized", {});
    const r = await this.rpc("thread/start", { cwd: this.cwd, ...this.thread });
    this.threadId = r.thread?.id ?? r.threadId;
    this.threadInfo = r;
    return this;
  }

  rpc(method, params) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject, method });
      this.child.stdin.write(JSON.stringify({ id, method, params }) + "\n");
    });
  }

  notify(method, params) { this.child.stdin.write(JSON.stringify({ method, params }) + "\n"); }

  print(text) {
    if (this.quiet || !this.turn) return;
    console.log(`  ${fmtDuration(Date.now() - this.turn.t0).padStart(7)}  ${text}`);
  }

  onMessage(m) {
    if (m.id != null && !m.method) {
      const p = this.pending.get(m.id);
      if (!p) return;
      this.pending.delete(m.id);
      if (m.error) p.reject(new Error(`${p.method}: ${JSON.stringify(m.error)}`)); else p.resolve(m.result);
      return;
    }
    if (m.id != null && m.method) {
      const answer = DECLINE[m.method];
      if (!this.quiet) console.log(`  ⚠ ${this.label}: ${m.method} — declined (nobody can answer)`);
      this.child.stdin.write(JSON.stringify(answer ? { id: m.id, result: answer } : { id: m.id, error: { code: -32601, message: "not supported by the benchmark runner" } }) + "\n");
      if (this.turn) this.turn.declined.push(m.method);
      return;
    }
    const p = m.params || {};
    if (m.method === "mcpServer/startupStatus/updated") {
      this.mcpStartup.set(p.name, { status: p.status, error: p.error });
      this.onMcpStartup?.();
      if (p.status === "failed" && !this.quiet) console.log(`  ⚠ MCP server ${p.name} failed to start: ${p.error ?? ""}`);
      return;
    }
    const t = this.turn;
    if (!t || (p.threadId && p.threadId !== this.threadId)) return;
    if (m.method === "item/started") {
      const d = describeItem(p.item || {});
      if (d) this.print(d);
    } else if (m.method === "item/completed") {
      const it = p.item || {};
      if (it.type === "agentMessage") { t.lastText = it.text; if (it.text?.trim()) this.print(`» ${oneLine(it.text, 120)}`); return; }
      if (!describeItem(it)) return;
      const name = it.type === "mcpToolCall" ? `mcp__${it.server}__${it.tool}` : it.type;
      const isError = it.status === "failed" || !!it.error || (it.type === "commandExecution" && it.exitCode != null && it.exitCode !== 0);
      t.calls.push({ id: it.id, name, done: true, isError });
      if (isError && it.type === "mcpToolCall") this.print(`  ✗ ${name}: ${oneLine(JSON.stringify(it.error ?? it.result), 110)}`);
    } else if (m.method === "turn/completed") {
      if (t.turnId && p.turn?.id && p.turn.id !== t.turnId) return;
      t.finish(p.turn);
    } else if (m.method === "error" && !p.willRetry) {
      t.errors.push(p.error ?? p);
      this.print(`  ✗ error: ${oneLine(JSON.stringify(p.error ?? p), 150)}`);
    }
  }

  // Starts a turn and resolves when Codex reports it completed (the same result shape as ClaudeSession.send)
  send(text, { timeoutMs = 90 * 60_000, effort } = {}) {
    if (this.turn) throw new Error("a turn is already running");
    return new Promise((resolve, reject) => {
      const t = {
        t0: Date.now(), calls: [], declined: [], errors: [], lastText: "",
        finish: turn => {
          clearTimeout(t.timer);
          this.turn = null;
          resolve({ turn, calls: t.calls, declined: t.declined, errors: t.errors, durationMs: Date.now() - t.t0, costUsd: 0,
            isError: turn?.status !== "completed", text: t.lastText, result: { terminal_reason: turn?.status, error: turn?.error ?? null }, results: [turn] });
        },
        fail: err => { clearTimeout(t.timer); this.turn = null; reject(err); },
      };
      t.timer = setTimeout(() => { this.kill(); t.fail(new Error(`${this.label}: turn timed out after ${fmtDuration(timeoutMs)}`)); }, timeoutMs);
      this.turn = t;
      this.rpc("turn/start", { threadId: this.threadId, input: [{ type: "text", text }], ...(effort ? { effort } : {}) })
        .then(r => { if (this.turn === t) t.turnId = r.turn?.id ?? r.turnId; })
        .catch(err => this.turn === t && t.fail(err));
    });
  }

  // Resolves once every named MCP server has finished starting (ready or failed), or after timeoutMs. A turn's tool
  // list is fixed when the turn starts, so a turn sent before the servers are ready never sees their tools.
  waitForMcp(names, timeoutMs = 120_000) {
    const settled = () => names.every(n => ["ready", "failed"].includes(this.mcpStartup.get(n)?.status));
    if (settled()) return Promise.resolve(true);
    return new Promise(resolve => {
      const timer = setTimeout(() => { this.onMcpStartup = null; resolve(false); }, timeoutMs);
      this.onMcpStartup = () => { if (settled()) { clearTimeout(timer); this.onMcpStartup = null; resolve(true); } };
    });
  }

  async mcpStatus() {
    const r = await this.rpc("mcpServerStatus/list", { detail: "toolsAndAuthOnly" });
    return (r.data || []).map(s => ({ name: s.name, tools: Object.keys(s.tools || {}).length, startup: this.mcpStartup.get(s.name)?.status ?? null }));
  }

  async close({ graceMs = 15_000 } = {}) {
    try { this.child.stdin.end(); } catch {}
    const code = await Promise.race([this.exited, new Promise(r => setTimeout(() => r("timeout"), graceMs))]);
    if (code === "timeout") killTree(this.child.pid);
    await this.exited;
    await new Promise(r => this.log.end(r));
    return this.exitCode;
  }

  kill() { if (this.child?.pid) killTree(this.child.pid); }
}
