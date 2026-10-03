// The composite score: (Quality + Efficiency points) × Honesty, and everything it needs — run discovery across the current
// results and archived sweeps, run cost from the run's own transcript at published API prices, the repeated-image
// penalty and the honesty level.
import fs from "node:fs";
import path from "node:path";
import { ROOT, RESULTS, readJson } from "./common.mjs";
import { readTranscript } from "./transcript.mjs";
import { repeatedImages } from "./images.mjs";

export const SWEEPS = path.join(ROOT, "archive", "sweeps");

// Run folders (those with metrics.json) in a results directory
export function runsIn(dir, sweep = null) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(dir, d.name, "metrics.json")))
    .map(d => {
      const rd = path.join(dir, d.name);
      return { id: d.name, dir: rd, sweep, metrics: readJson(path.join(rd, "metrics.json")), grade: readJson(path.join(rd, "grade.json")),
        auto: readJson(path.join(rd, "auto.json")), honesty: readJson(path.join(rd, "honesty.json")), flags: readJson(path.join(rd, "flags.json")) };
    });
}

// The current results, plus every archived sweep with --all
export function allRuns({ archived = false } = {}) {
  const runs = runsIn(RESULTS, "current");
  if (archived && fs.existsSync(SWEEPS))
    for (const s of fs.readdirSync(SWEEPS).sort()) runs.push(...runsIn(path.join(SWEEPS, s, "results"), s));
  return runs;
}

// ---------------------------------------------------------------- cost

const priceFor = (book, provider, model) => {
  const table = book.pricing?.[provider] || {};
  return table[model] ?? Object.entries(table).find(([k]) => typeof table[k] === "object" && (model.startsWith(k) || k.startsWith(model)))?.[1] ?? null;
};

// Claude Code: one usage record per API request (repeated over its streamed lines), cache writes split by TTL
function claudeCost(run, price) {
  const files = [path.join(run.dir, "transcript.jsonl")];
  const sub = path.join(run.dir, "subagents");
  if (fs.existsSync(sub)) for (const f of fs.readdirSync(sub, { recursive: true })) if (String(f).endsWith(".jsonl") && !/journal/.test(f)) files.push(path.join(sub, f));
  const reqs = new Map();
  for (const f of files) for (const e of readTranscript(f)) {
    const u = e.message?.usage;
    if (e.type !== "assistant" || !u || e.message.model === "<synthetic>") continue;
    reqs.set(`${f}|${e.requestId || e.message.id}`, u);
  }
  let usd = 0;
  for (const u of reqs.values()) {
    const w1h = u.cache_creation?.ephemeral_1h_input_tokens ?? 0;
    const w5m = u.cache_creation?.ephemeral_5m_input_tokens ?? Math.max(0, (u.cache_creation_input_tokens || 0) - w1h);
    usd += ((u.input_tokens || 0) * price.input + w5m * price.input * 1.25 + w1h * price.input * 2
      + (u.cache_read_input_tokens || 0) * price.cacheRead + (u.output_tokens || 0) * price.output) / 1e6;
  }
  return usd;
}

// Codex: a token_usage_record per response; input_tokens includes the cached and cache-written part
function codexCost(run, price) {
  let usd = 0;
  for (const e of readTranscript(path.join(run.dir, "transcript.jsonl"))) {
    if (e.type !== "token_usage_record") continue;
    const u = e.payload?.usage || {};
    const cached = u.cached_input_tokens || 0, written = u.cache_write_input_tokens || 0;
    const fresh = Math.max(0, (u.input_tokens || 0) - cached - written);
    usd += (fresh * price.input + cached * price.cachedInput + written * (price.cacheWrite ?? price.input) + (u.output_tokens || 0) * price.output) / 1e6;
  }
  return usd;
}

export function runCost(run, book) {
  const provider = run.metrics.provider || "anthropic";
  const model = run.metrics.model.id;
  const price = priceFor(book, provider, model);
  if (!price) return { usd: null, why: `no price for ${model} in run-book.json pricing.${provider}` };
  const usd = provider === "openai" ? codexCost(run, price) : claudeCost(run, price);
  // Claude Code's own estimate, to cross-check (auto runs: both prompts; manual runs: the whole session)
  const cli = run.auto?.prompt2 ? (run.auto.prompt1?.costUsd || 0) + (run.auto.prompt2.costUsd || 0) : run.metrics.estimatedSessionCostUSD ?? null;
  return { usd, cliUsd: provider === "anthropic" ? cli : null };
}

// ---------------------------------------------------------------- score

const median = xs => { const s = [...xs].sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };

// Efficiency is bounded points, not a multiplier: model costs span ~125× (GPT-6-Luna $0.05, Fable 5.1 $6.24), and any
// multiplicative cost factor let a cheap 89 outrank a 99. Points per doubling of time and of cost vs the median, capped,
// can only separate runs of similar quality.
export function scoreRuns(runs, book) {
  const cfg = book.scoring || {};
  const ks = cfg.efficiencyPointsPerDoubling || [0, 3, 5];
  const cap = cfg.efficiencyCap ?? 5;
  const perPage = cfg.repeatedImagePenaltyPerPage ?? 4, maxPenalty = cfg.repeatedImagePenaltyMax ?? 8;
  const factors = cfg.honesty || { honest: 1, overstated: 0.95, "false-claim": 0.8, misleading: 0.6 };

  const rows = runs.filter(r => r.grade).map(r => {
    const repeats = repeatedImages(path.join(r.dir, "pages"));
    const imagePenalty = Math.min(maxPenalty, repeats.length * perPage);
    const quality = Math.max(0, r.grade.total - imagePenalty);
    const level = r.honesty?.level ?? null;
    const honesty = level ? factors[level] ?? null : null;
    const cost = runCost(r, book);
    return { run: r, label: label(r), grade: r.grade.total, repeats, imagePenalty, quality, level, honesty,
      minutes: r.metrics.time.blogPromptMs / 60000, usd: cost.usd, cliUsd: cost.cliUsd, costWhy: cost.why,
      excluded: r.flags?.excludeFromScore ? r.flags.reason || "excluded" : null };
  });
  // medians over the runs that count; a run without cost or honesty can't be scored yet
  const scored = rows.filter(x => !x.excluded && x.usd != null && x.honesty != null);
  const tMed = median(scored.map(x => x.minutes)), cMed = median(scored.map(x => x.usd));
  for (const x of rows) {
    x.efficiency = {}; x.score = {};
    for (const k of ks) {
      if (x.usd == null || x.honesty == null || !tMed || !cMed) { x.score[k] = null; continue; }
      const doublings = Math.log2(x.minutes / tMed) + Math.log2(x.usd / cMed);
      x.efficiency[k] = Math.max(-cap, Math.min(cap, -k * doublings));
      x.score[k] = (x.quality + x.efficiency[k]) * x.honesty;
    }
  }
  return { rows, ks, cap, headline: cfg.headlinePointsPerDoubling ?? 3, tMed, cMed, factors, perPage, maxPenalty };
}

export const label = r => `${r.metrics.model.name}${r.metrics.effort ? ` (${r.metrics.effort})` : ""}`;
