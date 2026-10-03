// npm run check [-- --run <id>] [--no-build]
// Mechanical half of the exam: build, boot, snapshot Umbraco over the Management API, crawl the site,
// and run static convention checks. Writes check.json, snapshot.json, build.log, changes.patch and pages/ into the run folder.
// Leaves Umbraco running so the grader can poke at it (npm run api / curl).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { SITE, SITE_NAME, PROJECT, parseArgs, resolveRun, writeJson } from "./lib/common.mjs";
import { BASE_URL, api, walkTree, stopSite, startSite, waitForReady, findSiteProcesses } from "./lib/umbraco.mjs";
import { changes, diffPatch, hasBaseline } from "./lib/baseline.mjs";
import { repeatedImages } from "./lib/images.mjs";

const args = parseArgs();
const run = resolveRun(args.run);
const out = run.dir;
const variant = run.metrics.variant || "mcp";
const checks = [];
const add = (id, ok, detail = "") => checks.push({ id, ok, detail });
console.log(`Checking run ${run.id} (${variant} test)`);

// ---------------------------------------------------------------- build
let build = { skipped: true };
if (!args["no-build"]) {
  stopSite();
  console.log("Building…");
  const r = spawnSync("dotnet", ["build", "-nologo", "-tl:off"], { cwd: SITE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const text = (r.stdout || "") + (r.stderr || "");
  fs.writeFileSync(path.join(out, "build.log"), text);
  const n = re => Number(text.match(re)?.[1] ?? NaN);
  build = { ok: r.status === 0, exitCode: r.status, warnings: n(/(\d+) Warning\(s\)/), errors: n(/(\d+) Error\(s\)/),
    errorLines: [...new Set(text.split("\n").filter(l => /\berror\b/i.test(l) && /(CS|MSB|RZ|NU)\d{4}/.test(l)).map(l => l.trim()))].slice(0, 20) };
  add("build.ok", build.ok, `${build.errors} error(s), ${build.warnings} warning(s)`);
}

// ---------------------------------------------------------------- boot
if (!findSiteProcesses().length) {
  console.log("Starting Umbraco…");
  startSite();
}
let booted = true;
try { await waitForReady({ timeoutMs: 240_000 }); } catch (e) { booted = false; add("site.boots", false, e.message); }
if (booted) add("site.boots", true);

// ---------------------------------------------------------------- snapshot
const snapshot = { docTypes: [], dataTypes: [], templates: [], documents: [], media: [] };
if (booted) {
  console.log("Snapshotting Umbraco…");
  await walkTree("document-type", async (item, trail) => {
    if (item.isFolder) return;
    const d = await api(`/document-type/${item.id}`);
    snapshot.docTypes.push({ id: d.id, alias: d.alias, name: d.name, folder: trail.join("/"), isElement: d.isElement, allowedAsRoot: d.allowedAsRoot,
      icon: d.icon, properties: d.properties.map(p => ({ alias: p.alias, name: p.name, dataTypeId: p.dataType?.id, containerId: p.container?.id })),
      containers: d.containers, compositionIds: d.compositions.map(c => c.documentType.id), allowedChildIds: d.allowedDocumentTypes.map(a => a.documentType.id),
      allowedTemplateIds: d.allowedTemplates.map(t => t.id), defaultTemplateId: d.defaultTemplate?.id ?? null });
  });
  await walkTree("data-type", async (item, trail) => {
    if (item.isFolder) return;
    const d = await api(`/data-type/${item.id}`);
    snapshot.dataTypes.push({ id: d.id, name: d.name, folder: trail.join("/"), editorAlias: d.editorAlias, editorUiAlias: d.editorUiAlias, values: d.values });
  });
  await walkTree("template", async item => {
    const t = await api(`/template/${item.id}`);
    snapshot.templates.push({ id: t.id, alias: t.alias, name: t.name, masterTemplateId: t.masterTemplate?.id ?? null });
  });
  await walkTree("document", async (item, trail, name) => {
    const d = await api(`/document/${item.id}`);
    let domains = null;
    try { domains = await api(`/document/${item.id}/domains`); } catch {}
    snapshot.documents.push({ id: d.id, name, path: [...trail, name].join(" / "), docTypeId: d.documentType.id, templateId: d.template?.id ?? null,
      state: d.variants.map(v => v.state).join(","), domains: domains?.domains ?? [], values: d.values });
  });
  if (snapshot.documents.length) {
    const urls = await api(`/document/urls?${snapshot.documents.map(d => `id=${d.id}`).join("&")}`);
    for (const u of urls) {
      const doc = snapshot.documents.find(d => d.id === u.id);
      if (doc) doc.urls = u.urlInfos.map(i => i.url).filter(Boolean);
    }
  }
  const mediaTypes = new Map();
  await walkTree("media", async (item, trail, name) => {
    const m = await api(`/media/${item.id}`);
    if (!mediaTypes.has(m.mediaType.id)) mediaTypes.set(m.mediaType.id, (await api(`/media-type/${m.mediaType.id}`)).alias);
    const file = m.values.find(v => v.alias === "umbracoFile")?.value;
    snapshot.media.push({ id: m.id, name, folder: trail.join("/"), mediaType: mediaTypes.get(m.mediaType.id), src: file?.src ?? null });
  });

  // resolve ids to aliases for readability
  const dtAlias = new Map(snapshot.docTypes.map(d => [d.id, d.alias]));
  const tplAlias = new Map(snapshot.templates.map(t => [t.id, t.alias]));
  for (const d of snapshot.docTypes) {
    d.compositions = d.compositionIds.map(id => dtAlias.get(id) || id);
    d.allowedChildren = d.allowedChildIds.map(id => dtAlias.get(id) || id);
    d.allowedTemplates = d.allowedTemplateIds.map(id => tplAlias.get(id) || id);
    d.defaultTemplate = tplAlias.get(d.defaultTemplateId) ?? null;
    for (const p of d.properties) p.editorAlias = snapshot.dataTypes.find(x => x.id === p.dataTypeId)?.editorAlias;
  }
  for (const doc of snapshot.documents) { doc.docType = dtAlias.get(doc.docTypeId); doc.template = tplAlias.get(doc.templateId) ?? null; }
  writeJson(path.join(out, "snapshot.json"), snapshot);
}

// ---------------------------------------------------------------- crawl
const crawl = { pages: [], assets: [] };
if (booted) {
  console.log("Crawling the site…");
  fs.rmSync(path.join(out, "pages"), { recursive: true, force: true });
  fs.mkdirSync(path.join(out, "pages"), { recursive: true });
  const origin = new URL(BASE_URL).origin;
  const queue = ["/", ...snapshot.documents.flatMap(d => d.urls || []).filter(u => u.startsWith("/"))];
  const seen = new Set();
  const assetUrls = new Map();
  const decode = s => s.replace(/&amp;/g, "&");
  const attrs = (html, tag, attr) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))].map(m => m[0])
    .map(t => ({ tag: t, val: t.match(new RegExp(`\\b${attr}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] })).filter(x => x.val);
  while (queue.length && crawl.pages.length < 40) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    let status = 0, html = "";
    try {
      const r = await fetch(origin + p, { signal: AbortSignal.timeout(30000) });
      status = r.status; html = await r.text();
    } catch (e) { html = String(e); }
    const file = (p.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "_") || "index") + ".html";
    fs.writeFileSync(path.join(out, "pages", file), html);
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const page = {
      path: p, status, file: `pages/${file}`,
      title: html.match(/<title[^>]*>([^<]*)/i)?.[1]?.trim() ?? null,
      h1: html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? null,
      renderErrors: [...new Set(html.match(/Could not render component[^<]*|An unhandled exception[^<]*|[A-Za-z.]+Exception:[^<]{0,160}/g) || [])].slice(0, 5),
      usesBlockGridMarkup: /umb-block-grid/.test(html),
      textLength: text.length,
      links: [], images: [],
    };
    for (const { val } of attrs(html, "a", "href")) {
      const href = decode(val);
      if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/umbraco")) continue;
      const clean = href.split("#")[0].split("?")[0];
      if (/\.[a-z0-9]{2,4}$/i.test(clean)) continue;
      page.links.push(clean);
      if (!seen.has(clean)) queue.push(clean);
    }
    for (const { val } of attrs(html, "img", "src")) { page.images.push(decode(val)); assetUrls.set(decode(val), "img"); }
    for (const { tag, val } of attrs(html, "link", "href")) if (/stylesheet/i.test(tag)) assetUrls.set(decode(val), "css");
    for (const { val } of attrs(html, "script", "src")) assetUrls.set(decode(val), "js");
    page.links = [...new Set(page.links)];
    crawl.pages.push(page);
  }
  for (const [u, kind] of [...assetUrls].slice(0, 80)) {
    const external = /^https?:\/\//i.test(u) && !u.startsWith(origin);
    const url = u.startsWith("/") ? origin + u : u;
    let status = 0;
    try { status = (await fetch(url, { signal: AbortSignal.timeout(20000) })).status; } catch {}
    crawl.assets.push({ url: u, kind, external, status, unsignedResize: kind === "img" && /[?&](width|height)=/.test(u) && !/[?&]hmac=/.test(u) });
  }
}

// ---------------------------------------------------------------- site checks
if (booted) {
  const home = crawl.pages.find(p => p.path === "/");
  add("site.frontPage200", home?.status === 200, `GET / → ${home?.status}`);
  const bad = crawl.pages.filter(p => p.status !== 200 || p.renderErrors.length);
  add("site.allPagesRender", bad.length === 0, bad.map(p => `${p.path} → ${p.status}${p.renderErrors.length ? " " + p.renderErrors[0] : ""}`).join("; ") || `${crawl.pages.length} page(s) OK`);
  const alias = id => snapshot.docTypes.find(d => d.id === id)?.alias || "";
  const posts = snapshot.documents.filter(d => /post|article/i.test(alias(d.docTypeId)));
  add("content.twoBlogPosts", posts.length >= 2, `${posts.length} document(s) with a post-like type: ${posts.map(p => p.name).join(", ")}`);
  const postUrls = posts.flatMap(p => p.urls || []);
  const linked = postUrls.filter(u => home?.links.includes(u));
  add("site.frontPageLinksPosts", postUrls.length > 0 && linked.length >= Math.min(2, postUrls.length), `front page links ${linked.length}/${postUrls.length} post URL(s)`);
  const imgs = crawl.assets.filter(a => a.kind === "img");
  const brokenImgs = imgs.filter(a => a.status !== 200);
  add("site.imagesLoad", imgs.length > 0 && brokenImgs.length === 0, imgs.length ? `${imgs.length - brokenImgs.length}/${imgs.length} images load${brokenImgs.length ? "; broken: " + brokenImgs.map(a => `${a.url} (${a.status})`).slice(0, 5).join(", ") : ""}` : "no <img> on any page");
  add("site.imagesFromMediaLibrary", imgs.length > 0 && imgs.every(a => !a.external), `${imgs.filter(a => a.external).length} hot-linked external image(s)`);
  add("site.noUnsignedResizeUrls", !imgs.some(a => a.unsignedResize), imgs.filter(a => a.unsignedResize).map(a => a.url).slice(0, 3).join(", "));
  const css = crawl.assets.filter(a => a.kind === "css" && !a.external);
  add("site.stylesheetsLoad", css.length > 0 && css.every(a => a.status === 200), css.map(a => `${a.url} → ${a.status}`).join(", ") || "no local stylesheet linked");
  add("site.usesBlockGrid", crawl.pages.some(p => p.usesBlockGridMarkup), "umb-block-grid markup present on a page");
  const repeats = repeatedImages(path.join(out, "pages"));
  add("content.noRepeatedImages", repeats.length === 0, repeats.map(r => `${r.page}: ${r.repeated.map(x => `${x.file} ×${x.times}`).join(", ")}`).join("; ") || "no page shows the same image twice");

  // ---------------------------------------------------------------- schema / content checks
  const FOLDERS = ["Pages", "Blocks", "Compositions", "Data", "Repositories", "Repository Items"];
  const top = d => d.folder.split("/")[0];
  const misfiled = snapshot.docTypes.filter(d => !FOLDERS.includes(top(d)));
  add("schema.docTypesInFolders", misfiled.length === 0, misfiled.map(d => `${d.alias} in "${d.folder || "(root)"}"`).join(", "));
  const wrongKind = snapshot.docTypes.filter(d => FOLDERS.includes(top(d)) &&
    (d.isElement ? !["Blocks", "Compositions", "Data"].includes(top(d)) : !["Pages", "Repositories", "Repository Items"].includes(top(d))));
  add("schema.elementVsDocumentFolders", wrongKind.length === 0, wrongKind.map(d => `${d.alias} (${d.isElement ? "element" : "document"}) in ${top(d)}`).join(", "));
  const camel = /^[a-z][a-zA-Z0-9]*$/;
  const badAliases = [...snapshot.docTypes.filter(d => !camel.test(d.alias)).map(d => d.alias),
    ...snapshot.docTypes.flatMap(d => d.properties.filter(p => !camel.test(p.alias)).map(p => `${d.alias}.${p.alias}`))];
  add("schema.aliasesCamelCase", badAliases.length === 0, badAliases.join(", "));
  const rootDataTypes = snapshot.dataTypes.filter(d => !d.folder);
  add("schema.dataTypesNotAtRoot", rootDataTypes.length === 0, rootDataTypes.map(d => d.name).join(", "));
  const gridTypes = snapshot.dataTypes.filter(d => d.editorAlias === "Umbraco.BlockGrid");
  const gridIds = new Set(gridTypes.map(g => g.id));
  const pagesWithGrid = snapshot.docTypes.filter(d => !d.isElement && d.properties.some(p => gridIds.has(p.dataTypeId)));
  add("schema.blockGridOnPages", pagesWithGrid.length > 0, `block grid on: ${pagesWithGrid.map(d => d.alias).join(", ") || "none"}`);
  const usedComps = new Set(snapshot.docTypes.flatMap(d => d.compositionIds));
  const compsInBlocks = snapshot.docTypes.filter(d => usedComps.has(d.id) && top(d) === "Blocks");
  add("schema.blocksNotUsedAsCompositions", compsInBlocks.length === 0, compsInBlocks.map(d => d.alias).join(", "));

  const gridBlockAliases = [...new Set(gridTypes.flatMap(g => (g.values.find(v => v.alias === "blocks")?.value || []).map(b => snapshot.docTypes.find(d => d.id === b.contentElementTypeKey)?.alias).filter(Boolean)))];
  snapshot.blockGridBlockAliases = gridBlockAliases;

  const withDomain = snapshot.documents.filter(d => d.domains.length);
  add("content.domainAssigned", withDomain.length > 0, withDomain.map(d => `${d.name}: ${d.domains.map(x => x.domainName).join(",")}`).join("; ") || "no domain on any document");
  const unpublished = snapshot.documents.filter(d => !/^Published$/.test(d.state));
  add("content.allPublished", unpublished.length === 0, unpublished.map(d => `${d.name} (${d.state})`).join(", "));
  const rootMedia = snapshot.media.filter(m => !m.folder && m.mediaType !== "Folder");
  add("content.mediaInFolders", rootMedia.length === 0, rootMedia.map(m => m.name).join(", "));
  add("content.hasMedia", snapshot.media.some(m => m.mediaType !== "Folder"), `${snapshot.media.filter(m => m.mediaType !== "Folder").length} media item(s)`);
  // the scaffold ships its photos in unsplash/; Umbraco keeps the file name in the media path (/media/<id>/cubes.jpg)
  const provided = fs.existsSync(path.join(PROJECT, "unsplash")) ? fs.readdirSync(path.join(PROJECT, "unsplash")).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).map(f => f.toLowerCase()) : [];
  if (provided.length) {
    const files = snapshot.media.filter(m => m.src).map(m => path.posix.basename(m.src.split("?")[0]).toLowerCase());
    const used = files.filter(f => provided.includes(f)), other = files.filter(f => !provided.includes(f));
    add("content.mediaFromProvidedPhotos", files.length > 0 && other.length === 0, `${used.length} of ${files.length} media file(s) are the provided photos${other.length ? "; other: " + other.slice(0, 5).join(", ") : ""}`);
  }
  writeJson(path.join(out, "snapshot.json"), snapshot);

  // ---------------------------------------------------------------- code checks that need the schema
  const adapterDir = path.join(SITE, "Views", "Partials", "blockgrid", "Components");
  const adapters = fs.existsSync(adapterDir) ? fs.readdirSync(adapterDir).filter(f => f.endsWith(".cshtml")) : [];
  const actualDirName = fs.existsSync(path.join(SITE, "Views", "Partials", "blockgrid")) ? fs.readdirSync(path.join(SITE, "Views", "Partials", "blockgrid")).find(f => f.toLowerCase() === "components") : null;
  add("code.adapterFolderCasing", actualDirName ? actualDirName === "Components" : null, actualDirName ? `folder is "${actualDirName}"` : "no Components folder");
  const missingAdapters = gridBlockAliases.filter(a => !adapters.includes(`${a}.cshtml`));
  add("code.adapterPerBlock", gridBlockAliases.length ? missingAdapters.length === 0 : null, missingAdapters.length ? `missing (exact-case) adapters for: ${missingAdapters.join(", ")}` : `${adapters.length} adapter(s): ${adapters.join(", ")}`);
}

// ---------------------------------------------------------------- static code checks
const rel = f => path.relative(PROJECT, f).replace(/\\/g, "/");
const walk = (dir, filter) => !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
  const full = path.join(dir, d.name);
  if (d.isDirectory()) return ["bin", "obj", "node_modules", "ModelsBuilder", "umbraco", "wwwroot"].includes(d.name) ? [] : walk(full, filter);
  return filter(d.name) ? [full] : [];
});
const read = f => fs.readFileSync(f, "utf8");
const cshtml = walk(SITE, n => n.endsWith(".cshtml"));
const csFiles = walk(SITE, n => n.endsWith(".cs"));
let changed = { added: [], modified: [], deleted: [] };
if (hasBaseline()) {
  changed = changes();
  fs.writeFileSync(path.join(out, "changes.patch"), diffPatch());
}
const touched = new Set([...changed.added, ...changed.modified].map(f => f.replace(/\\/g, "/")));
const isTouched = f => touched.has(rel(f));
const S = SITE_NAME + "/";

add("code.programCsUnchanged", !touched.has(S + "Program.cs"));
add("code.appsettingsJsonUnchanged", !touched.has(S + "appsettings.json"), "production settings must not be softened");
const migrationChanges = [...touched, ...changed.deleted].filter(f => f.startsWith(S + "Migrations/"));
if (variant === "migrations") {
  // append-only: new step files + ProjectMigrationPlan extended, shipped steps untouched
  const plan = S + "Migrations/ProjectMigrationPlan.cs";
  const shippedEdited = [...changed.modified, ...changed.deleted].filter(f => f.startsWith(S + "Migrations/") && f !== plan);
  const planText = fs.existsSync(path.join(PROJECT, plan)) ? read(path.join(PROJECT, plan)) : "";
  const shippedSteps = ["umbraco.bench-v1-document-type-folders", "umbraco.bench-v2-site-root-document-type", "umbraco.bench-v3-www-content", "umbraco.bench-v4-organize-data-types"];
  const lostSteps = shippedSteps.filter(s => !planText.includes(s));
  const newSteps = changed.added.filter(f => f.startsWith(S + "Migrations/"));
  add("code.migrationsWritten", newSteps.length > 0, `${newSteps.length} new migration file(s)`);
  add("code.shippedMigrationsUntouched", shippedEdited.length === 0 && lostSteps.length === 0,
    [...shippedEdited.map(f => `edited ${f}`), ...lostSteps.map(s => `plan lost step ${s}`)].join(", "));
} else {
  add("code.noMigrationsWritten", migrationChanges.length === 0, migrationChanges.join(", "));
}

// the test's intended channel for schema + content (from the transcript)
const ch = run.metrics.channel || {};
const sideDoors = [ch.managementApiShellCalls && `${ch.managementApiShellCalls} shell call(s) to the Management API`,
  ch.uSyncFileWrites && `${ch.uSyncFileWrites} uSync file write(s)`, ch.databaseShellCalls && `${ch.databaseShellCalls} shell call(s) touching the SQLite db`];
const channelProblems = {
  mcp: [!ch.umbracoMcpWrites && "no Umbraco MCP writes", ch.migrationFileWrites && `${ch.migrationFileWrites} migration file write(s)`, ...sideDoors],
  migrations: [!ch.migrationFileWrites && "no migration files written", ch.umbracoMcpCalls && `${ch.umbracoMcpCalls} Umbraco MCP call(s)`, ch.browserCalls && `${ch.browserCalls} browser call(s)`, ...sideDoors],
  playwright: [!ch.browserCalls && "no browser calls", ch.umbracoMcpCalls && `${ch.umbracoMcpCalls} Umbraco MCP call(s)`, ch.migrationFileWrites && `${ch.migrationFileWrites} migration file write(s)`, ...sideDoors],
}[variant].filter(Boolean);
add("process.intendedChannel", channelProblems.length === 0, channelProblems.join("; ") || `built through ${variant}`);
const roomProblems = [ch.memoryAccess && `${ch.memoryAccess} memory access(es)`, ch.benchFolderShellRefs && `${ch.benchFolderShellRefs} shell call(s) into the bench's own folders`,
  ch.outsideFolderPaths?.length && `outside the project: ${ch.outsideFolderPaths.slice(0, 5).join(", ")}`].filter(Boolean);
add("process.stayedInFolder", roomProblems.length === 0, roomProblems.join("; "));
const modelsRootCs = fs.existsSync(path.join(SITE, "Models")) ? fs.readdirSync(path.join(SITE, "Models")).filter(f => f.endsWith(".cs")) : [];
add("code.noCsInModelsRoot", modelsRootCs.length === 0, modelsRootCs.join(", "));
const badServices = walk(path.join(SITE, "Services"), n => n.endsWith(".cs")).filter(f => !/Service\.cs$/.test(f)).map(rel);
add("code.servicesNamedService", badServices.length === 0, badServices.join(", "));

const baselinePartials = /Views\/Partials\/(blockgrid|blocklist|singleblock)\/[^/]+\.cshtml$/;
const loopy = cshtml.filter(f => isTouched(f) && !baselinePartials.test(rel(f)))
  .filter(f => { const s = read(f); return /foreach\s*\(/.test(s) && /BlockGrid(Model|Item)|BlockList(Model|Item)|foreach\s*\([^)]*\b[Bb]locks?\b/.test(s); }).map(rel);
add("code.noCustomBlockLoops", loopy.length === 0, loopy.join(", "));
const parallel = [...cshtml.filter(f => /_Blocks\.cshtml$/i.test(f)).map(rel), ...(fs.existsSync(path.join(SITE, "Views", "Partials", "blocks")) ? ["Views/Partials/blocks/"] : [])];
add("code.noParallelBlockPartials", parallel.length === 0, parallel.join(", "));
const helperUsers = cshtml.filter(f => /GetBlock(Grid|List)HtmlAsync/.test(read(f))).map(rel);
add("code.pagesUseBlockGridHelper", helperUsers.length > 0, helperUsers.join(", ") || "no view calls GetBlockGridHtmlAsync");

const adapterFiles = cshtml.filter(f => /Views[\\/]Partials[\\/]blockgrid[\\/]Components[\\/]/i.test(f));
const markupAdapters = adapterFiles.filter(f => {
  // drop comments and @directive/@expression lines (their generics look like tags)
  let s = read(f).replace(/@\*[\s\S]*?\*@/g, "").replace(/^\s*@(?!\{).*$/gm, "");
  // drop @{ ... } code blocks (naive brace matching)
  let outS = "", i = 0;
  while (i < s.length) {
    if (s.startsWith("@{", i)) { let depth = 0, j = i + 1; for (; j < s.length; j++) { if (s[j] === "{") depth++; else if (s[j] === "}" && --depth === 0) break; } i = j + 1; }
    else outS += s[i++];
  }
  return /<[a-zA-Z][^>]*>/.test(outS);
}).map(rel);
add("code.adaptersHaveNoMarkup", adapterFiles.length ? markupAdapters.length === 0 : null, markupAdapters.join(", "));
const adaptersInvoking = adapterFiles.filter(f => /Component\.InvokeAsync/.test(read(f)));
add("code.adaptersInvokeViewComponents", adapterFiles.length ? adaptersInvoking.length === adapterFiles.length : null, `${adaptersInvoking.length}/${adapterFiles.length} adapters call Component.InvokeAsync`);

const vcs = csFiles.flatMap(f => [...read(f).matchAll(/class\s+(\w+?)(ViewComponent)?\s*(?:\([^)]*\))?\s*:\s*ViewComponent\b/g)].map(m => ({ name: m[1], file: rel(f) })));
const vcMissingView = vcs.filter(v => !fs.existsSync(path.join(SITE, "Views", "Shared", "Components", v.name, "Default.cshtml")));
add("code.viewComponentPerBlock", vcs.length ? vcMissingView.length === 0 : false, vcs.length ? (vcMissingView.length ? `missing Default.cshtml for: ${vcMissingView.map(v => v.name).join(", ")}` : `${vcs.length} view component(s): ${vcs.map(v => v.name).join(", ")}`) : "no ViewComponent classes");
const sharedComponents = path.join(SITE, "Views", "Shared", "Components");
const loose = fs.existsSync(sharedComponents) ? fs.readdirSync(sharedComponents, { withFileTypes: true }).filter(d => d.isFile()).map(d => d.name) : [];
add("code.noLooseFilesInSharedComponents", loose.length === 0, loose.join(", "));
const componentViewsUmbraco = walk(sharedComponents, n => n.endsWith(".cshtml")).filter(f => /BlockGridItem|IPublishedContent|UmbracoViewPage/.test(read(f))).map(rel);
add("code.componentViewsArePlain", componentViewsUmbraco.length === 0, componentViewsUmbraco.join(", "));
const injected = [...cshtml, ...csFiles].filter(f => isTouched(f) && /IPublishedUrlProvider|IImageUrlGenerator/.test(read(f))).map(rel);
add("code.noInjectedUrlServices", injected.length === 0, injected.join(", "));
const handQuery = cshtml.filter(f => /\?(width|height|w|h)=/.test(read(f))).map(rel);
add("code.noHandWrittenImageQueries", handQuery.length === 0, handQuery.join(", "));
add("code.frontendBuilt", fs.existsSync(path.join(SITE, "wwwroot", "dist", "site.css")), "wwwroot/dist/site.css exists");

// ---------------------------------------------------------------- write
const passed = checks.filter(c => c.ok === true).length, failed = checks.filter(c => c.ok === false).length;
writeJson(path.join(out, "check.json"), {
  runId: run.id, variant, checkedAt: new Date().toISOString(), summary: { passed, failed, notApplicable: checks.length - passed - failed },
  checks, build, changes: changed,
  crawl: { pages: crawl.pages.map(({ links, images, ...p }) => ({ ...p, links: links.length, images: images.length })), assets: crawl.assets },
  counts: { docTypes: snapshot.docTypes.length, elementTypes: snapshot.docTypes.filter(d => d.isElement).length, customDataTypes: snapshot.dataTypes.filter(d => d.folder.startsWith("Custom")).length,
    templates: snapshot.templates.length, documents: snapshot.documents.length, media: snapshot.media.filter(m => m.mediaType !== "Folder").length },
});

for (const c of checks) console.log(`${c.ok === true ? "PASS" : c.ok === false ? "FAIL" : " n/a"}  ${c.id}${c.detail ? "  — " + c.detail : ""}`);
console.log(`\n${passed} passed, ${failed} failed. Wrote ${path.join(out, "check.json")}. Umbraco is left running on ${BASE_URL}.`);
