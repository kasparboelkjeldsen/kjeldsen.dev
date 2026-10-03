// Drives the Claude Code CLI headlessly for the autonomous runner (bench/auto.mjs):
// finds the binary, checks it is logged in, and runs one long-lived session fed over stdin (stream-json),
// so prompt 1 and prompt 2 share a process (and the MCP server connection) like a session typed by hand.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fmtDuration } from "./common.mjs";

// ---------------------------------------------------------------- binary

const verKey = v => v.split(".").map(n => String(Number(n) || 0).padStart(6, "0")).join(".");

// The desktop app ships its own CLI under claude-code/<version>/<hash>/claude.exe (MSIX-virtualised for the app's own processes)
function bundledClaudes() {
  const roots = [
    path.join(process.env.APPDATA || "", "Claude", "claude-code"),
    ...(() => {
      const pk = path.join(process.env.LOCALAPPDATA || "", "Packages");
      if (!fs.existsSync(pk)) return [];
      return fs.readdirSync(pk).filter(d => /^Claude_/i.test(d)).map(d => path.join(pk, d, "LocalCache", "Roaming", "Claude", "claude-code"));
    })(),
  ];
  const found = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const ver of fs.readdirSync(root)) {
      const vdir = path.join(root, ver);
      if (!fs.statSync(vdir).isDirectory()) continue;
      for (const sub of fs.readdirSync(vdir)) {
        const exe = path.join(vdir, sub, "claude.exe");
        if (fs.existsSync(exe)) found.push({ exe, ver });
      }
    }
  }
  return found.sort((a, b) => verKey(b.ver).localeCompare(verKey(a.ver))).map(f => f.exe);
}

export function resolveClaudeBin(explicit) {
  const pick = explicit || process.env.BENCH_CLAUDE;
  if (pick) {
    if (!fs.existsSync(pick)) throw new Error(`Claude CLI not found at ${pick}`);
    return pick;
  }
  const where = spawnSync(process.platform === "win32" ? "where.exe" : "which", ["claude"], { encoding: "utf8" });
  const onPath = (where.stdout || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  // prefer the .exe / native binary over npm's .cmd shim
  const native = onPath.find(p => /\.exe$/i.test(p)) || onPath.find(p => !/\.(cmd|bat|ps1)$/i.test(p)) || onPath[0];
  if (native) return native;
  const local = path.join(os.homedir(), ".local", "bin", process.platform === "win32" ? "claude.exe" : "claude");
  if (fs.existsSync(local)) return local;
  const bundled = bundledClaudes()[0];
  if (bundled) return bundled;
  throw new Error("Claude Code CLI not found. Install it (claude.ai/code), put it on PATH, or pass --claude <path> / set BENCH_CLAUDE.");
}

const needsShell = bin => /\.(cmd|bat)$/i.test(bin);

export function claudeVersion(bin) {
  const r = spawnSync(bin, ["--version"], { encoding: "utf8", env: cleanEnv(), shell: needsShell(bin) });
  return (r.stdout || "").trim().split(/\s/)[0] || null;
}

export function authStatus(bin) {
  const env = cleanEnv();
  if (env.CLAUDE_CODE_OAUTH_TOKEN) return { loggedIn: true, authMethod: "CLAUDE_CODE_OAUTH_TOKEN" };
  if (env.ANTHROPIC_API_KEY) return { loggedIn: true, authMethod: "ANTHROPIC_API_KEY" };
  const r = spawnSync(bin, ["auth", "status"], { encoding: "utf8", env, shell: needsShell(bin) });
  try { return JSON.parse(r.stdout); } catch { return { loggedIn: false, raw: (r.stdout || r.stderr || "").trim() }; }
}

// ---------------------------------------------------------------- environment

// A Claude Code session exports its own state (CLAUDECODE, CLAUDE_EFFORT, CLAUDE_CODE_ENTRYPOINT,
// MCP_CONNECTION_NONBLOCKING, …). Started from inside one, a nested CLI would inherit it, so strip it all
// except what deliberately configures auth or the config folder.
const KEEP = new Set(["CLAUDE_CODE_OAUTH_TOKEN", "CLAUDE_CONFIG_DIR", "CLAUDE_CODE_GIT_BASH_PATH"]);
export function cleanEnv() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (/^(CLAUDECODE|CLAUDE_|MCP_|OTEL_)/i.test(k) && !KEEP.has(k.toUpperCase())) continue;
    env[k] = v;
  }
  // npx-launched MCP servers need node; it may not be on PATH (e.g. fnm without shell setup)
  const pathKey = Object.keys(env).find(k => k.toUpperCase() === "PATH") || "PATH";
  env[pathKey] = `${path.dirname(process.execPath)}${path.delimiter}${env[pathKey] || ""}`;
  // A ~/.bashrc with `fnm env --use-on-cd` aliases cd to fnm's hook, which fails without fnm's own variables, and then
  // every `cd x && …` in Claude Code's Bash tool fails. Giving the session fnm's environment makes the hook work.
  if (!env.FNM_MULTISHELL_PATH) {
    const fnm = fnmEnv();
    if (fnm) { Object.assign(env, fnm); env[pathKey] = `${fnm.FNM_MULTISHELL_PATH}${path.delimiter}${env[pathKey]}`; }
  }
  return env;
}

let fnmCache;
function fnmEnv() {
  if (fnmCache !== undefined) return fnmCache;
  const r = spawnSync("fnm", ["env", "--json"], { encoding: "utf8", windowsHide: true });
  try { fnmCache = r.status === 0 ? JSON.parse(r.stdout) : null; } catch { fnmCache = null; }
  if (fnmCache && !fnmCache.FNM_MULTISHELL_PATH) fnmCache = null;
  return fnmCache;
}

export function killTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { encoding: "utf8" });
  else try { process.kill(-pid, "SIGKILL"); } catch { try { process.kill(pid, "SIGKILL"); } catch {} }
}

// ---------------------------------------------------------------- session

const oneLine = (s, n) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
};

function describeCall(c) {
  const i = c.input || {};
  const arg = i.command ?? i.file_path ?? i.path ?? i.pattern ?? i.url ?? i.query ?? i.description ?? i.prompt ?? (Object.keys(i).length ? JSON.stringify(i) : "");
  return `${c.name.replace(/^mcp__([^_]+)__/, "$1:")}  ${oneLine(arg, 110)}`;
}

export class TurnTimeout extends Error {}

// One CLI process; send() a prompt per turn. A turn is over when a result has arrived and the session has then
// been quiet for settleMs: a background task finishing can wake the model again after its first result.
export class ClaudeSession {
  constructor({ bin, cwd, args, logFile, label = "claude", quiet = false }) {
    Object.assign(this, { bin, cwd, args, logFile, label, quiet });
    const i = args.indexOf("--permission-mode");
    this.expectPermissionMode = i >= 0 ? args[i + 1] : null;
    this.events = [];
    this.turn = null;
    this.exited = null;
  }

  start() {
    fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    this.log = fs.createWriteStream(this.logFile, { flags: "a" });
    const args = ["-p", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose", ...this.args];
    this.child = spawn(this.bin, args, { cwd: this.cwd, env: cleanEnv(), stdio: ["pipe", "pipe", "pipe"], windowsHide: true, shell: needsShell(this.bin) });
    this.exited = new Promise(resolve => this.child.on("exit", (code, signal) => {
      this.exitCode = code;
      if (this.turn) this.turn.fail(new Error(`${this.label}: the CLI exited (code ${code}${signal ? ", " + signal : ""}) mid-turn. Log: ${this.logFile}`));
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
        let ev;
        try { ev = JSON.parse(line); } catch { continue; }
        this.onEvent(ev);
      }
    });
    this.child.stderr.setEncoding("utf8");
    this.child.stderr.on("data", s => {
      this.log.write(JSON.stringify({ type: "stderr", text: s }) + "\n");
      if (!this.quiet && s.trim()) process.stderr.write(`  [${this.label} stderr] ${s.trim()}\n`);
    });
    return this;
  }

  print(text) {
    if (this.quiet || !this.turn) return;
    console.log(`  ${fmtDuration(Date.now() - this.turn.t0).padStart(7)}  ${text}`);
  }

  onEvent(ev) {
    this.events.push(ev);
    const t = this.turn;
    if (!t) return;
    if (ev.type === "system" && ev.subtype === "init") {
      t.init ??= ev;
      // e.g. auto mode isn't available to this account/model and the CLI fell back: in -p every prompt would be denied
      if (this.expectPermissionMode && ev.permissionMode && ev.permissionMode !== this.expectPermissionMode) {
        this.kill();
        t.fail(new Error(`${this.label}: the CLI started in permission mode "${ev.permissionMode}", not "${this.expectPermissionMode}". Stopped before it did anything.`));
      }
      return;
    }
    if (ev.type === "result") {
      t.results.push(ev);
      t.armSettle();
      return;
    }
    // anything after a result means the model woke up again (e.g. a background task finished)
    if (t.results.length) t.disarmSettle();
    if (ev.type === "assistant" && !ev.parent_tool_use_id) {
      for (const c of ev.message?.content || []) {
        if (c.type === "tool_use") {
          t.calls.set(c.id, { id: c.id, name: c.name, input: c.input, isError: false, done: false });
          this.print(describeCall(c));
        } else if (c.type === "text" && c.text.trim()) this.print(`» ${oneLine(c.text, 120)}`);
      }
    } else if (ev.type === "user" && Array.isArray(ev.message?.content)) {
      for (const c of ev.message.content) {
        if (c.type !== "tool_result") continue;
        const call = t.calls.get(c.tool_use_id);
        if (!call) continue;
        call.done = true;
        call.isError = !!c.is_error;
        if (call.isError) this.print(`  ✗ ${call.name}: ${oneLine(typeof c.content === "string" ? c.content : JSON.stringify(c.content), 110)}`);
      }
    }
  }

  // Sends one user message and resolves when the turn has settled
  send(text, { timeoutMs = 90 * 60_000, settleMs = 20_000 } = {}) {
    if (this.turn) throw new Error("a turn is already running");
    return new Promise((resolve, reject) => {
      const t = {
        t0: Date.now(), init: null, results: [], calls: new Map(), settle: null,
        armSettle: () => { clearTimeout(t.settle); t.settle = setTimeout(() => t.finish(), settleMs); },
        disarmSettle: () => { clearTimeout(t.settle); t.settle = null; },
        finish: () => {
          clearTimeout(t.settle); clearTimeout(t.timer);
          this.turn = null;
          const last = t.results.at(-1);
          resolve({
            init: t.init, result: last, results: t.results, calls: [...t.calls.values()],
            durationMs: Date.now() - t.t0,
            costUsd: t.results.reduce((n, r) => n + (r.total_cost_usd || 0), 0),
            isError: !!last?.is_error,
            text: last?.result ?? "",
          });
        },
        fail: err => { clearTimeout(t.settle); clearTimeout(t.timer); this.turn = null; reject(err); },
      };
      t.timer = setTimeout(() => {
        killTree(this.child.pid);
        t.fail(new TurnTimeout(`${this.label}: turn timed out after ${fmtDuration(timeoutMs)}`));
      }, timeoutMs);
      this.turn = t;
      this.child.stdin.write(JSON.stringify({ type: "user", message: { role: "user", content: text } }) + "\n");
    });
  }

  // Closes stdin so the CLI exits; kills the process tree (MCP servers, a "dotnet run" it left behind) if it lingers
  async close({ graceMs = 30_000 } = {}) {
    try { this.child.stdin.end(); } catch {}
    const code = await Promise.race([this.exited, new Promise(r => setTimeout(() => r("timeout"), graceMs))]);
    if (code === "timeout") killTree(this.child.pid);
    await this.exited;
    await new Promise(r => this.log.end(r));
    return this.exitCode;
  }

  kill() { if (this.child?.pid) killTree(this.child.pid); }
}
