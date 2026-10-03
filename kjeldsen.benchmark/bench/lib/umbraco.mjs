// Start/stop the benchmark Umbraco site and talk to its Management API with the MCP client credentials.
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { SITE, SITE_NAME, LOGS, readJson } from "./common.mjs";

// Local dev cert is self-signed — same as the MCP server's NODE_TLS_REJECT_UNAUTHORIZED=0
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.removeAllListeners("warning");

// Ports come from the profile "dotnet run" uses, so this follows the scaffold if it changes
const profileUrls = (readJson(`${SITE}/Properties/launchSettings.json`)?.profiles?.["Umbraco.Web.UI"]?.applicationUrl || "https://localhost:44317").split(";");
export const BASE_URL = process.env.UMBRACO_MCP_URL || profileUrls.find(u => u.startsWith("https")) || profileUrls[0];
const PORTS = profileUrls.map(u => new URL(u).port).filter(Boolean);
const CLIENT_ID = "umbraco-back-office-mcp-local-only";
const CLIENT_SECRET = "mcp-local-dev-secret-b3ll4b00t-not-a-real-secret";

function ps(script) {
  const r = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], { encoding: "utf8" });
  return (r.stdout || "").trim();
}

// Everything that could hold the site's ports or lock its bin/obj folders
export function findSiteProcesses() {
  const out = ps(`
    $ids = @()
    $ids += Get-NetTCPConnection -State Listen -LocalPort ${PORTS.join(",")} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    $ids += Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq '${SITE_NAME}.exe' -or ($_.Name -eq 'dotnet.exe' -and $_.CommandLine -like '*${SITE_NAME}*') } | Select-Object -ExpandProperty ProcessId
    $ids | Where-Object { $_ -gt 0 } | Sort-Object -Unique`);
  return out.split(/\s+/).filter(Boolean).map(Number);
}

export function stopSite() {
  const pids = findSiteProcesses();
  for (const pid of pids) spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { encoding: "utf8" });
  // MSBuild/Razor build servers can keep obj/ locked after a build
  spawnSync("dotnet", ["build-server", "shutdown"], { encoding: "utf8", cwd: SITE });
  return pids;
}

export async function isUp() {
  try {
    const r = await fetch(`${BASE_URL}/umbraco`, { redirect: "manual", signal: AbortSignal.timeout(5000) });
    return r.status < 500;
  } catch { return false; }
}

export function startSite() {
  fs.mkdirSync(LOGS, { recursive: true });
  const logFile = path.join(LOGS, `umbraco-${new Date().toISOString().replace(/[:.]/g, "-")}.log`);
  const fd = fs.openSync(logFile, "a");
  const child = spawn("dotnet", ["run", "--launch-profile", "Umbraco.Web.UI"], {
    cwd: SITE, detached: true, stdio: ["ignore", fd, fd], windowsHide: true,
  });
  child.unref();
  return { pid: child.pid, logFile };
}

// Ready = the MCP API user can get a token (it's provisioned at ApplicationStarted, after install)
export async function waitForReady({ timeoutMs = 300_000, onTick } = {}) {
  const until = Date.now() + timeoutMs;
  let lastErr;
  while (Date.now() < until) {
    try { await getToken(); return true; } catch (e) { lastErr = e; }
    onTick?.();
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error(`Umbraco did not become ready within ${timeoutMs / 1000}s: ${lastErr?.message}`);
}

let tokenCache;
export async function getToken() {
  if (tokenCache && tokenCache.exp > Date.now()) return tokenCache.token;
  const r = await fetch(`${BASE_URL}/umbraco/management/api/v1/security/back-office/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`token: HTTP ${r.status}`);
  const j = await r.json();
  tokenCache = { token: j.access_token, exp: Date.now() + (j.expires_in - 30) * 1000 };
  return tokenCache.token;
}

export async function api(pathAndQuery, { method = "GET", body } = {}) {
  const url = `${BASE_URL}/umbraco/management/api/v1${pathAndQuery.startsWith("/") ? "" : "/"}${pathAndQuery}`;
  const r = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${await getToken()}`, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${pathAndQuery}: HTTP ${r.status} ${text.slice(0, 300)}`);
  try { return JSON.parse(text); } catch { return text; }
}

// Walk a management-API tree (document-type, data-type, document, media, template)
export async function walkTree(kind, visit, parentId = null, trail = []) {
  const q = parentId ? `/tree/${kind}/children?parentId=${parentId}&skip=0&take=1000` : `/tree/${kind}/root?skip=0&take=1000`;
  const page = await api(q);
  for (const item of page.items || []) {
    const name = item.name ?? item.variants?.[0]?.name ?? "";
    await visit(item, trail, name);
    if (item.hasChildren) await walkTree(kind, visit, item.id, [...trail, name]);
  }
}
