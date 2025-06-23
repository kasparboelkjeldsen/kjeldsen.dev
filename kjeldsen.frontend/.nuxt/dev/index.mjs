import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import { resolve as resolve$1, dirname, join } from 'node:path';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { getRequestHeader, setResponseHeaders, setResponseStatus, send, getRequestHeaders, setResponseHeader, getRequestURL, getResponseHeader as getResponseHeader$1, defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, getResponseStatus, setHeaders, sendRedirect, proxyRequest, createError, getResponseHeaders, readBody, getHeader, getQuery as getQuery$1, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getRouterParam, sendError, getResponseStatusText } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/h3/dist/index.mjs';
import { createOnigurumaEngine } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/shiki/dist/engine-oniguruma.mjs';
import { createJavaScriptRegexEngine } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/shiki/dist/engine-javascript.mjs';
import { serialize as serialize$1 } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/cookie/dist/index.js';
import { createRenderer, getRequestDependencies, getPreloadLinks, getPrefetchLinks } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import destr from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/destr/dist/index.mjs';
import { withQuery, joinURL, withTrailingSlash, parseURL, withoutBase, getQuery, joinRelativeURL } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ufo/dist/index.mjs';
import { createHead as createHead$1, propsToString, renderSSRHead } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unhead/dist/server.mjs';
import { isVNode, toValue, isRef } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/index.mjs';
import { walkResolver } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unhead/dist/utils.mjs';
import { renderToString } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/server-renderer/index.mjs';
import { klona } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/scule/dist/index.mjs';
import { stringify as stringify$1, uneval } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/devalue/index.js';
import { DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unhead/dist/plugins.mjs';
import { createHooks } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/node-mock-http/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola, { consola as consola$1 } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/youch-core/build/index.js';
import { Youch } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/source-map/source-map.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unctx/dist/index.mjs';
import { captureRawStackTrace, parseRawStackTrace } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/errx/dist/index.js';
import { createStorage, prefixStorage } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/dist/index.mjs';
import { format, CacheControl } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@tusbar/cache-control/dist/cache-control.modern.js';
import unstorage_47drivers_47fs from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ohash/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/radix3/dist/index.mjs';

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  if (typeof defaultRes.body !== "string" && Array.isArray(defaultRes.body.stack)) {
    defaultRes.body.stack = defaultRes.body.stack.join("\n");
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = url.pathname + url.search + url.hash;
  errorObject.message ||= "Server Error";
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await Promise.resolve().then(function () { return errorDev; }) ;
    {
      errorObject.description = errorObject.message;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json || !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader$1(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve$1(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = `
if (!window.__NUXT_DEVTOOLS_TIME_METRIC__) {
  Object.defineProperty(window, '__NUXT_DEVTOOLS_TIME_METRIC__', {
    value: {},
    enumerable: false,
    configurable: true,
  })
}
window.__NUXT_DEVTOOLS_TIME_METRIC__.appInit = Date.now()
`;

const _oVhL5mtFOvJh7VffWtzNBlWFpdiJVRYW6Jyc0VoVA = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const rootDir = "X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend";

const appHead = {"meta":[{"name":"viewport","content":"width=device-width, initial-scale=1"},{"charset":"utf-8"}],"link":[],"style":[],"script":[],"noscript":[]};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appId = "nuxt-app";

const devReducers = {
  VNode: (data) => isVNode(data) ? { type: data.type, props: data.props } : void 0,
  URL: (data) => data instanceof URL ? data.toString() : void 0
};
const asyncContext = getContext("nuxt-dev", { asyncContext: true, AsyncLocalStorage });
const _Yf_N5DT8W3Inpepfou1EKEjiOFbHGrhqSerlKb94f0 = (nitroApp) => {
  const handler = nitroApp.h3App.handler;
  nitroApp.h3App.handler = (event) => {
    return asyncContext.callAsync({ logs: [], event }, () => handler(event));
  };
  onConsoleLog((_log) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    const rawStack = captureRawStackTrace();
    if (!rawStack || rawStack.includes("runtime/vite-node.mjs")) {
      return;
    }
    const trace = [];
    let filename = "";
    for (const entry of parseRawStackTrace(rawStack)) {
      if (entry.source === globalThis._importMeta_.url) {
        continue;
      }
      if (EXCLUDE_TRACE_RE.test(entry.source)) {
        continue;
      }
      filename ||= entry.source.replace(withTrailingSlash(rootDir), "");
      trace.push({
        ...entry,
        source: entry.source.startsWith("file://") ? entry.source.replace("file://", "") : entry.source
      });
    }
    const log = {
      ..._log,
      // Pass along filename to allow the client to display more info about where log comes from
      filename,
      // Clean up file names in stack trace
      stack: trace
    };
    ctx.logs.push(log);
  });
  nitroApp.hooks.hook("afterResponse", () => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    return nitroApp.hooks.callHook("dev:ssr-logs", { logs: ctx.logs, path: ctx.event.path });
  });
  nitroApp.hooks.hook("render:html", (htmlContext) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    try {
      const reducers = Object.assign(/* @__PURE__ */ Object.create(null), devReducers, ctx.event.context._payloadReducers);
      htmlContext.bodyAppend.unshift(`<script type="application/json" data-nuxt-logs="${appId}">${stringify$1(ctx.logs, reducers)}<\/script>`);
    } catch (e) {
      const shortError = e instanceof Error && "toString" in e ? ` Received \`${e.toString()}\`.` : "";
      console.warn(`[nuxt] Failed to stringify dev server logs.${shortError} You can define your own reducer/reviver for rich types following the instructions in https://nuxt.com/docs/api/composables/use-nuxt-app#payload.`);
    }
  });
};
const EXCLUDE_TRACE_RE = /\/node_modules\/(?:.*\/)?(?:nuxt|nuxt-nightly|nuxt-edge|nuxt3|consola|@vue)\/|core\/runtime\/nitro/;
function onConsoleLog(callback) {
  consola$1.addReporter({
    log(logObj) {
      callback(logObj);
    }
  });
  consola$1.wrapConsole();
}

const MULTI_CACHE_CONTEXT_KEY = "__MULTI_CACHE";
const MULTI_CACHE_ROUTE_CONTEXT_KEY = "__MULTI_CACHE_ROUTE";
const MULTI_CACHE_CDN_CONTEXT_KEY = "__MULTI_CACHE_CDN";
const MULTI_CACHE_PREFIX_KEY = "__MULTI_CACHE_PREFIX";
function getMultiCacheContext(event) {
  return event?.[MULTI_CACHE_CONTEXT_KEY];
}
function getMultiCacheRouteHelper(event) {
  return event?.[MULTI_CACHE_ROUTE_CONTEXT_KEY];
}
function getMultiCacheCDNHelper(event) {
  return event?.[MULTI_CACHE_CDN_CONTEXT_KEY];
}
function getCacheKeyWithPrefix(cacheKey, event) {
  const prefix = event[MULTI_CACHE_PREFIX_KEY];
  return prefix ? `${prefix}--${cacheKey}` : cacheKey;
}
function encodeRouteCacheKey(path) {
  const questionMarkIndex = path.indexOf("?");
  if (questionMarkIndex >= 0) {
    return path.substring(0, questionMarkIndex);
  }
  return path;
}
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function useMultiCacheApp() {
  const app = useNitroApp();
  return app.multiCache;
}

function handleCDN(app, event) {
  const cdnHelper = getMultiCacheCDNHelper(event);
  if (!cdnHelper) {
    return;
  }
  const cacheTagsValue = cdnHelper._tags.filter(onlyUnique).join(" ");
  if (cacheTagsValue) {
    setResponseHeader(event, app.config.cdn.cacheTagHeader, cacheTagsValue);
  }
  const cacheControlValue = format(cdnHelper._control);
  if (cacheControlValue) {
    setResponseHeader(
      event,
      app.config.cdn.cacheControlHeader,
      cacheControlValue
    );
  }
}
function onBeforeResponse(event, response) {
  const app = useMultiCacheApp();
  handleCDN(app, event);
}

class NuxtMultiCacheRouteCacheHelper {
  /**
   * The collected cache tags.
   */
  tags = [];
  /**
   * Indicates if the route should be cacheable.
   */
  cacheable = null;
  /**
   * The maximum age.
   */
  maxAge = null;
  /**
   * The stale if error age.
   */
  staleIfError = null;
  /**
   * Whether a stale response can be served during revalidation.
   */
  staleWhileRevalidate = null;
  /**
   * Add cache tags for this route.
   */
  addTags(tags = []) {
    this.tags.push(...tags);
    return this;
  }
  /**
   * Mark this route as cacheable.
   *
   * The initial value is null and this method only changes the value if it is
   * null. This means that once it's set to uncacheable, there is no way to
   * change it back.
   */
  setCacheable() {
    if (this.cacheable === null) {
      this.cacheable = true;
    }
    return this;
  }
  /**
   * Mark the route as uncacheable.
   *
   * After that there is no way to make it cacheable again.
   */
  setUncacheable() {
    this.cacheable = false;
    return this;
  }
  /**
   * Set a numeric value only if its smaller than the existing value.
   */
  setNumeric(property, value) {
    const current = this[property];
    if (current === null || value < current) {
      this[property] = value;
    }
    return this;
  }
  /**
   * Set the max age in seconds.
   *
   * The value is only set if it's smaller than the current max age or if it
   * hasn't been set yet. The initial value is `null`.
   *
   * You can always directly set the maxAge property on this object.
   */
  setMaxAge(v = 0) {
    return this.setNumeric("maxAge", v);
  }
  /**
   * Set the staleIfError in seconds.
   *
   * If set, then a stale route will be served if that refreshed route throws an error.
   */
  setStaleIfError(v = 0) {
    return this.setNumeric("staleIfError", v);
  }
  /**
   * Sets whether a stale respones can be returned while a new one is being generated.
   */
  allowStaleWhileRevalidate() {
    this.staleWhileRevalidate = true;
    return this;
  }
  /**
   * Get the expire timestamp as unix epoch (seconds).
   */
  getExpires(property) {
    const value = this[property];
    if (value === null) {
      return;
    }
    return Math.floor(Date.now() / 1e3) + value;
  }
}

class NuxtMultiCacheCDNHelper {
  _tags;
  _control;
  constructor() {
    this._tags = [];
    this._control = new CacheControl();
  }
  /**
   * Set a cache-control property.
   */
  set(key, value) {
    this._control[key] = value;
    return this;
  }
  /**
   * Add cache tags.
   */
  addTags(tags) {
    this._tags.push(...tags);
    return this;
  }
  /**
   * Sets a numeric value only if it's lower than the current value or if it
   * isn't yet set.
   *
   * For example, this can be used when setting maxAge: You can set a global
   * max age of 1 year for every response. But a component down the tree that
   * shows the current weather can set it to 1 hour. If another component tries
   * to set the max age to 7 days the value won't be set.
   *
   * This basically means that the lowest value will always "win".
   */
  setNumeric(key, value) {
    const currentValue = this._control[key];
    if (currentValue === null || currentValue === void 0 || value < currentValue) {
      this._control[key] = value;
    }
    return this;
  }
  /**
   * Set as private.
   *
   * Note that once it's set to private you can't change it back to public.
   * This is so that it's possible to change it at any time during the request
   * without running into race conditions.
   */
  private() {
    this._control.private = true;
    this._control.public = false;
    return this;
  }
  /**
   * Set public.
   *
   * Note that if `private` was already set to `true` this will have no effect.
   */
  public() {
    if (!this._control.private) {
      this._control.public = true;
    }
    return this;
  }
}

async function addCacheContext(event) {
  const { cache, serverOptions, config } = useMultiCacheApp();
  if (serverOptions.cacheKeyPrefix) {
    if (typeof serverOptions.cacheKeyPrefix === "string") {
      event[MULTI_CACHE_PREFIX_KEY] = serverOptions.cacheKeyPrefix;
    } else {
      event[MULTI_CACHE_PREFIX_KEY] = await serverOptions.cacheKeyPrefix(event);
    }
  }
  event[MULTI_CACHE_CONTEXT_KEY] = cache;
  if (cache.route) {
    event[MULTI_CACHE_ROUTE_CONTEXT_KEY] = new NuxtMultiCacheRouteCacheHelper();
  }
  if (config.cdn.enabled) {
    const helper = new NuxtMultiCacheCDNHelper();
    event[MULTI_CACHE_CDN_CONTEXT_KEY] = helper;
  }
  return cache;
}
function enabledForRequest(event) {
  const { serverOptions } = useMultiCacheApp();
  if (serverOptions.enabledForRequest) {
    return serverOptions.enabledForRequest(event);
  }
  return Promise.resolve(true);
}
function applies(path) {
  const { serverOptions } = useMultiCacheApp();
  if (serverOptions.route?.applies) {
    return serverOptions.route.applies(path);
  }
  if (path.startsWith("/_nuxt") || path.startsWith("/__nuxt_error")) {
    return false;
  }
  return !/.\.(ico|png|jpg|js|css|html|woff|woff2|ttf|otf|eot|svg)$/.test(path);
}
async function onRequest(event) {
  if (!event.path) {
    return;
  }
  if (!applies(event.path)) {
    return;
  }
  const cachingEnabled = await enabledForRequest(event);
  if (!cachingEnabled) {
    return;
  }
  await addCacheContext(event);
}

const DELIMITER = "<CACHE_ITEM>";
function encodeCacheItem(data, metadata) {
  return JSON.stringify(metadata) + DELIMITER + data;
}
function decodeCacheItem(cacheItem) {
  const delimiterPos = cacheItem.indexOf(DELIMITER);
  if (delimiterPos >= 0) {
    const metadata = JSON.parse(cacheItem.substring(0, delimiterPos));
    const data = cacheItem.substring(delimiterPos + DELIMITER.length);
    return { metadata, data };
  }
}
function encodeRouteCacheItem(data, headers, statusCode, expires, staleIfErrorExpires, staleWhileRevalidate, cacheTags) {
  return encodeCacheItem(data, {
    headers,
    statusCode,
    expires,
    cacheTags,
    staleIfErrorExpires,
    staleWhileRevalidate
  });
}
function decodeRouteCacheItem(cacheItem) {
  try {
    const decoded = decodeCacheItem(cacheItem);
    if (decoded) {
      return {
        ...decoded.metadata,
        data: decoded.data
      };
    }
  } catch (e) {
  }
}
function decodeComponentCacheItem(cacheItem) {
  try {
    const decoded = decodeCacheItem(cacheItem);
    if (decoded) {
      return {
        ...decoded.metadata,
        data: decoded.data
      };
    }
  } catch (e) {
  }
}
function handleRawCacheData(data) {
  if (typeof data === "string") {
    return data;
  } else if (data instanceof Buffer) {
    return data.toString();
  }
}

const logger = consola$1.withTag("nuxt-multi-cache");

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "dev",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/__blockpreview": {
        "ssr": true,
        "prerender": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "useCache": "",
    "murderClient": "Ov23liqsA45smHf8QZRR",
    "cmsHost": "https://localhost:44375",
    "mdc": {
      "components": {
        "prose": true,
        "map": {}
      },
      "headings": {
        "anchorLinks": {
          "h1": false,
          "h2": true,
          "h3": true,
          "h4": true,
          "h5": false,
          "h6": false
        }
      }
    }
  },
  "murderKey": "bc17eeb753ba880b1f73d74b75d34c731717f2a3",
  "deliveryKey": "woot",
  "multiCache": {
    "debug": false,
    "rootDir": "X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend",
    "cdn": {
      "enabled": false,
      "cacheControlHeader": "Surrogate-Control",
      "cacheTagHeader": "Cache-Tag"
    },
    "component": false,
    "data": true,
    "route": true,
    "api": {
      "enabled": true,
      "prefix": "/__nuxt_multi_cache",
      "cacheTagInvalidationDelay": 1000,
      "authorizationToken": "woot",
      "authorizationDisabled": false
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function defineNitroPlugin(def) {
  return def;
}

const serverAssets = [{"baseName":"server","dir":"X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/server/assets"}];

const assets = createStorage();

for (const asset of serverAssets) {
  assets.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend","watchOptions":{"ignored":[null]}}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/server","watchOptions":{"ignored":[null]}}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/.nuxt"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/.nuxt/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
class Hasher {
  buff = "";
  #context = /* @__PURE__ */ new Map();
  write(str) {
    this.buff += str;
  }
  dispatch(value) {
    const type = value === null ? "null" : typeof value;
    return this[type](value);
  }
  object(object) {
    if (object && typeof object.toJSON === "function") {
      return this.object(object.toJSON());
    }
    const objString = Object.prototype.toString.call(object);
    let objType = "";
    const objectLength = objString.length;
    objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
    objType = objType.toLowerCase();
    let objectNumber = null;
    if ((objectNumber = this.#context.get(object)) === void 0) {
      this.#context.set(object, this.#context.size);
    } else {
      return this.dispatch("[CIRCULAR:" + objectNumber + "]");
    }
    if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
      this.write("buffer:");
      return this.write(object.toString("utf8"));
    }
    if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
      if (this[objType]) {
        this[objType](object);
      } else {
        this.unknown(object, objType);
      }
    } else {
      const keys = Object.keys(object).sort();
      const extraKeys = [];
      this.write("object:" + (keys.length + extraKeys.length) + ":");
      const dispatchForKey = (key) => {
        this.dispatch(key);
        this.write(":");
        this.dispatch(object[key]);
        this.write(",");
      };
      for (const key of keys) {
        dispatchForKey(key);
      }
      for (const key of extraKeys) {
        dispatchForKey(key);
      }
    }
  }
  array(arr, unordered) {
    unordered = unordered === void 0 ? false : unordered;
    this.write("array:" + arr.length + ":");
    if (!unordered || arr.length <= 1) {
      for (const entry of arr) {
        this.dispatch(entry);
      }
      return;
    }
    const contextAdditions = /* @__PURE__ */ new Map();
    const entries = arr.map((entry) => {
      const hasher = new Hasher();
      hasher.dispatch(entry);
      for (const [key, value] of hasher.#context) {
        contextAdditions.set(key, value);
      }
      return hasher.toString();
    });
    this.#context = contextAdditions;
    entries.sort();
    return this.array(entries, false);
  }
  date(date) {
    return this.write("date:" + date.toJSON());
  }
  symbol(sym) {
    return this.write("symbol:" + sym.toString());
  }
  unknown(value, type) {
    this.write(type);
    if (!value) {
      return;
    }
    this.write(":");
    if (value && typeof value.entries === "function") {
      return this.array(
        [...value.entries()],
        true
        /* ordered */
      );
    }
  }
  error(err) {
    return this.write("error:" + err.toString());
  }
  boolean(bool) {
    return this.write("bool:" + bool);
  }
  string(string) {
    this.write("string:" + string.length + ":");
    this.write(string);
  }
  function(fn) {
    this.write("fn:");
    if (isNativeFunction(fn)) {
      this.dispatch("[native]");
    } else {
      this.dispatch(fn.toString());
    }
  }
  number(number) {
    return this.write("number:" + number);
  }
  null() {
    return this.write("Null");
  }
  undefined() {
    return this.write("Undefined");
  }
  regexp(regex) {
    return this.write("regex:" + regex.toString());
  }
  arraybuffer(arr) {
    this.write("arraybuffer:");
    return this.dispatch(new Uint8Array(arr));
  }
  url(url) {
    return this.write("url:" + url.toString());
  }
  map(map) {
    this.write("map:");
    const arr = [...map];
    return this.array(arr, false);
  }
  set(set) {
    this.write("set:");
    const arr = [...set];
    return this.array(arr, false);
  }
  bigint(number) {
    return this.write("bigint:" + number.toString());
  }
}
for (const type of [
  "uint8array",
  "uint8clampedarray",
  "unt8array",
  "uint16array",
  "unt16array",
  "uint32array",
  "unt32array",
  "float32array",
  "float64array"
]) {
  Hasher.prototype[type] = function(arr) {
    this.write(type + ":");
    return this.array([...arr], false);
  };
}
const nativeFunc = "[native code] }";
const nativeFuncLength = nativeFunc.length;
function isNativeFunction(f) {
  if (typeof f !== "function") {
    return false;
  }
  return Function.prototype.toString.call(f).slice(-nativeFuncLength) === nativeFunc;
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (typeof value === "string") {
    return value;
  }
  try {
    if (isPureObject(value) || Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (typeof value.toJSON === "function") {
      return stringify(value.toJSON());
    }
  } catch (_e) {
  }
}
async function onAfterResponse(event, response) {
  if (event.__MULTI_CACHE_SERVED_FROM_CACHE) {
    return;
  }
  if (!response?.body) {
    return;
  }
  const responseData = stringify(response.body);
  if (!responseData) {
    return;
  }
  const multiCache = getMultiCacheContext(event);
  if (!multiCache?.route) {
    return;
  }
  const routeHelper = getMultiCacheRouteHelper(event);
  if (!routeHelper?.cacheable) {
    return;
  }
  const statusCode = getResponseStatus(event);
  if (statusCode !== 200) {
    return;
  }
  const { serverOptions, state } = useMultiCacheApp();
  let responseHeaders = getResponseHeaders(event);
  responseHeaders["content-encoding"] = void 0;
  if (serverOptions.route?.alterCachedHeaders) {
    responseHeaders = serverOptions.route.alterCachedHeaders(responseHeaders);
  }
  const cacheKey = serverOptions?.route?.buildCacheKey ? serverOptions.route.buildCacheKey(event) : getCacheKeyWithPrefix(encodeRouteCacheKey(event.path), event);
  const expires = routeHelper.getExpires("maxAge");
  const staleIfErrorExpires = routeHelper.getExpires("staleIfError");
  const staleWhileRevalidate = !!routeHelper.staleWhileRevalidate;
  const cacheItem = encodeRouteCacheItem(
    responseData,
    responseHeaders,
    statusCode,
    expires,
    staleIfErrorExpires,
    staleWhileRevalidate,
    routeHelper.tags
  );
  const debugEnabled = useRuntimeConfig().multiCache.debug;
  if (debugEnabled) {
    logger.info("Storing route in cache: " + event.path, {
      cacheKey,
      expires,
      staleIfErrorExpires,
      cacheTags: routeHelper.tags,
      staleWhileRevalidate,
      statusCode
    });
  }
  await multiCache.route.setItemRaw(cacheKey, cacheItem, {
    ttl: routeHelper.maxAge
  });
  if (event.__MULTI_CACHE_REVALIDATION_KEY) {
    state.removeKeyBeingRevalidated(event.__MULTI_CACHE_REVALIDATION_KEY);
  }
}

function setCachedResponse(event, decoded) {
  if (decoded.headers) {
    setResponseHeaders(event, decoded.headers);
  }
  if (decoded.statusCode) {
    setResponseStatus(event, decoded.statusCode);
  }
  event.__MULTI_CACHE_SERVED_FROM_CACHE = true;
}

function onError(_error, ctx) {
  try {
    if (!ctx.event) {
      return;
    }
    const { state } = useMultiCacheApp();
    if (ctx.event.__MULTI_CACHE_REVALIDATION_KEY) {
      state.removeKeyBeingRevalidated(ctx.event.__MULTI_CACHE_REVALIDATION_KEY);
    }
    const decoded = ctx.event.__MULTI_CACHE_DECODED_CACHED_ROUTE;
    if (!decoded) {
      return;
    }
    if (!decoded.staleIfErrorExpires) {
      return;
    }
    const now = Date.now() / 1e3;
    if (now >= decoded.staleIfErrorExpires) {
      return;
    }
    setCachedResponse(ctx.event, decoded);
    const response = new Response(decoded.data, {
      headers: decoded.headers
    });
    return ctx.event.respondWith(response);
  } catch (_e) {
  }
}

class MultiCacheState {
  /**
   * Keys that are currently being revalidated.
   */
  keysBeingRevalidated = {};
  /**
   * Add a key that is currently being revalidated.
   */
  addKeyBeingRevalidated(key) {
    this.keysBeingRevalidated[key] = true;
  }
  /**
   * Remove a key from being revalidated.
   */
  removeKeyBeingRevalidated(key) {
    delete this.keysBeingRevalidated[key];
  }
  /**
   * Check if a key is currentl being revalidated.
   */
  isBeingRevalidated(key) {
    return this.keysBeingRevalidated[key] === true;
  }
}

function canBeServedFromCache(key, decoded, state) {
  const now = Date.now() / 1e3;
  const isExpired = decoded.expires ? now >= decoded.expires : false;
  if (!isExpired) {
    return true;
  }
  if (decoded.staleWhileRevalidate && state.isBeingRevalidated(key)) {
    return true;
  }
  return false;
}
async function serveCachedHandler(event) {
  try {
    const { serverOptions, state } = useMultiCacheApp();
    const context = getMultiCacheContext(event);
    if (!context?.route) {
      return;
    }
    const fullKey = serverOptions?.route?.buildCacheKey ? serverOptions.route.buildCacheKey(event) : getCacheKeyWithPrefix(encodeRouteCacheKey(event.path), event);
    const cachedRaw = handleRawCacheData(
      await context.route.getItemRaw(fullKey)
    );
    if (!cachedRaw) {
      return;
    }
    const decoded = decodeRouteCacheItem(cachedRaw);
    if (!decoded) {
      return;
    }
    event.__MULTI_CACHE_DECODED_CACHED_ROUTE = decoded;
    if (!canBeServedFromCache(fullKey, decoded, state)) {
      if (decoded.staleWhileRevalidate) {
        state.addKeyBeingRevalidated(fullKey);
        event.__MULTI_CACHE_REVALIDATION_KEY = fullKey;
      }
      return;
    }
    const debugEnabled = useRuntimeConfig().multiCache.debug;
    if (debugEnabled) {
      logger.info("Serving cached route for path: " + event.path, {
        fullKey
      });
    }
    setCachedResponse(event, decoded);
    return decoded.data;
  } catch (e) {
    if (e instanceof Error) {
      console.debug(e.message);
    }
  }
}

const serverOptions = {};

function createMultiCacheApp() {
  const runtimeConfig = useRuntimeConfig();
  const cacheContext = {};
  if (runtimeConfig.multiCache.component) {
    cacheContext.component = createStorage(serverOptions.component?.storage);
  }
  if (runtimeConfig.multiCache.data) {
    cacheContext.data = createStorage(serverOptions.data?.storage);
  }
  if (runtimeConfig.multiCache.route) {
    cacheContext.route = createStorage(serverOptions.route?.storage);
  }
  return {
    cache: cacheContext,
    serverOptions,
    config: runtimeConfig.multiCache,
    state: new MultiCacheState()
  };
}
const _5vHR7zmGgnhiQc3QyV2oIPK2iBb967YiFzjF70kK2ww = defineNitroPlugin((nitroApp) => {
  const multiCache = createMultiCacheApp();
  nitroApp.multiCache = multiCache;
  nitroApp.hooks.hook("request", onRequest);
  if (multiCache.config.cdn.enabled) {
    nitroApp.hooks.hook("beforeResponse", onBeforeResponse);
  }
  if (multiCache.config.route) {
    nitroApp.h3App.stack.unshift({
      route: "/",
      handler: serveCachedHandler
    });
    nitroApp.hooks.hook("afterResponse", onAfterResponse);
    nitroApp.hooks.hook("error", onError);
  }
});

const plugins = [
  _oVhL5mtFOvJh7VffWtzNBlWFpdiJVRYW6Jyc0VoVA,
_Yf_N5DT8W3Inpepfou1EKEjiOFbHGrhqSerlKb94f0,
_5vHR7zmGgnhiQc3QyV2oIPK2iBb967YiFzjF70kK2ww
];

const _ST3oji = defineEventHandler(async (event) => {
  if (event.node.req.method == "POST" && event.node.req.headers["kuhb-header"]) {
    const body = await readBody(event);
    event.context.body = body;
    event.context.blockPreview = true;
  }
});

const AUTH_HEADER = "x-nuxt-multi-cache-token";
function getCacheInstance(event) {
  const multiCache = useMultiCacheApp();
  const cacheName = event.context.params?.cacheName;
  if (cacheName) {
    const cache = multiCache.cache[cacheName];
    if (cache) {
      return cache;
    }
  }
  throw createError({
    statusCode: 404,
    statusMessage: `The given cache "${cacheName}" is not available.`
  });
}
async function checkAuth(event) {
  const { serverOptions, config } = useMultiCacheApp();
  const { authorizationDisabled, authorizationToken } = config.api || {};
  if (authorizationDisabled) {
    return;
  }
  if (authorizationToken) {
    const headerToken = getHeader(event, AUTH_HEADER);
    if (headerToken === authorizationToken) {
      return;
    }
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  const authorization = serverOptions.api?.authorization;
  if (!authorization) {
    throw createError({
      statusCode: 500,
      statusMessage: "No authorization configuration option provided."
    });
  }
  const result = await authorization(event);
  if (result) {
    return;
  }
  throw createError({
    statusCode: 401,
    statusMessage: "Unauthorized"
  });
}

const _kD_xYb = defineEventHandler(async (event) => {
  await checkAuth(event);
  const app = useMultiCacheApp();
  if (!app.cache) {
    return;
  }
  let key;
  for (key in app.cache) {
    const cache = app.cache[key];
    if (cache) {
      await cache.clear();
    }
  }
  return {
    status: "OK"
  };
});

const DEFAULT_CACHE_TAG_INVALIDATION_DELAY = 6e4;

async function getTagsToPurge(event) {
  const body = await readBody(event);
  if (body && Array.isArray(body)) {
    return body;
  }
  throw createError({
    statusCode: 400,
    statusMessage: "No valid tags provided."
  });
}
class DebouncedInvalidator {
  /**
   * Buffer of tags to invalidate in the next run.
   */
  tags;
  /**
   * Debounce delay.
   */
  delay;
  /**
   * The current timeout ID for the next run. Reset after each run.
   */
  timeout;
  /**
   * The cache context instance.
   */
  cacheContext;
  constructor() {
    this.tags = [];
    this.timeout = null;
    this.delay = DEFAULT_CACHE_TAG_INVALIDATION_DELAY;
  }
  setDelay(delay = DEFAULT_CACHE_TAG_INVALIDATION_DELAY) {
    this.delay = delay;
  }
  /**
   * Add tags to be purged.
   */
  add(tags = []) {
    tags.forEach((tag) => {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    });
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.invalidate();
      }, this.delay);
    }
  }
  async getCacheTags(cacheName, key) {
    if (cacheName === "data") {
      const item = await this.cacheContext?.[cacheName]?.getItem(key);
      if (item && typeof item === "object" && item !== null) {
        return item.cacheTags;
      }
    } else if (cacheName === "route") {
      const cached = handleRawCacheData(
        await this.cacheContext?.[cacheName]?.getItemRaw(key)
      );
      if (cached) {
        return decodeRouteCacheItem(cached)?.cacheTags;
      }
    } else if (cacheName === "component") {
      const cached = handleRawCacheData(
        await this.cacheContext?.[cacheName]?.getItemRaw(key)
      );
      if (cached) {
        return decodeComponentCacheItem(cached)?.cacheTags;
      }
    }
  }
  /**
   * Invalidate the tags in the buffer.
   */
  async invalidate() {
    if (!this.cacheContext) {
      return;
    }
    const tags = this.tags.filter(onlyUnique);
    this.tags = [];
    this.timeout = null;
    let key;
    for (key in this.cacheContext) {
      const cache = this.cacheContext[key];
      if (cache) {
        const cacheItemKeys = await cache.getKeys();
        for (const cacheKey of cacheItemKeys) {
          const itemCacheTags = await this.getCacheTags(key, cacheKey);
          if (itemCacheTags) {
            const shouldPurge = itemCacheTags.some((v) => {
              return tags.includes(v);
            });
            if (shouldPurge) {
              await cache.removeItem(cacheKey);
            }
          }
        }
      }
    }
    return true;
  }
}
const invalidator = new DebouncedInvalidator();
const _t3RxPu = defineEventHandler(async (event) => {
  await checkAuth(event);
  const tags = await getTagsToPurge(event);
  if (!invalidator.cacheContext) {
    const app = useMultiCacheApp();
    invalidator.cacheContext = app.cache;
    const delay = app.config.api.cacheTagInvalidationDelay;
    invalidator.setDelay(delay);
  }
  invalidator.add(tags);
  return {
    status: "OK",
    tags
  };
});

async function getKeysToPurge(event) {
  const body = await readBody(event);
  if (body && Array.isArray(body)) {
    return body;
  }
  throw createError({
    statusCode: 400,
    statusMessage: "No valid keys provided."
  });
}
const _N0A1PD = defineEventHandler(async (event) => {
  await checkAuth(event);
  const affectedKeys = await getKeysToPurge(event);
  const cache = getCacheInstance(event);
  affectedKeys.forEach((key) => cache.removeItem(key));
  return {
    status: "OK",
    affectedKeys
  };
});

const _6j1bIz = defineEventHandler(async (event) => {
  await checkAuth(event);
  const cache = getCacheInstance(event);
  const rows = await cache.getKeys().then((keys) => {
    return Promise.all(
      keys.map((key) => {
        return cache.getItem(key).then((data) => {
          return { key, data };
        });
      })
    );
  });
  return {
    status: "OK",
    rows,
    total: rows.length
  };
});

const _n5gYX8 = defineEventHandler(async (event) => {
  await checkAuth(event);
  const cache = getCacheInstance(event);
  const query = getQuery$1(event);
  const key = query.key;
  const item = await cache.getItem(key);
  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: "Cache item does not exist."
    });
  }
  return item;
});

const _9S25FR = eventHandler(async (event) => {
  const { code, lang, theme: themeString, options: optionsStr } = getQuery$1(event);
  const theme = JSON.parse(themeString);
  const options = optionsStr ? JSON.parse(optionsStr) : {};
  const highlighter = await Promise.resolve().then(function () { return mdcHighlighter; }).then((m) => m.default);
  return await highlighter(code, lang, theme, options);
});

const _lazy_xSnT1C = () => Promise.resolve().then(function () { return ____slug_$1; });
const _lazy_Q1FVpx = () => Promise.resolve().then(function () { return _id_$1; });
const _lazy_MeUgJg = () => Promise.resolve().then(function () { return navigation$1; });
const _lazy_sFjQTo = () => Promise.resolve().then(function () { return callback$1; });
const _lazy_SEwznU = () => Promise.resolve().then(function () { return list_get$1; });
const _lazy_JA75IE = () => Promise.resolve().then(function () { return push_post$1; });
const _lazy_pkLN9i = () => Promise.resolve().then(function () { return renderer$1; });

const handlers = [
  { route: '', handler: _ST3oji, lazy: false, middleware: true, method: undefined },
  { route: '/api/content/**:slug', handler: _lazy_xSnT1C, lazy: true, middleware: false, method: undefined },
  { route: '/api/content/children/:id', handler: _lazy_Q1FVpx, lazy: true, middleware: false, method: undefined },
  { route: '/api/content/navigation', handler: _lazy_MeUgJg, lazy: true, middleware: false, method: undefined },
  { route: '/api/github/callback', handler: _lazy_sFjQTo, lazy: true, middleware: false, method: undefined },
  { route: '/api/murder/list', handler: _lazy_SEwznU, lazy: true, middleware: false, method: "get" },
  { route: '/api/murder/push', handler: _lazy_JA75IE, lazy: true, middleware: false, method: "post" },
  { route: '/__nuxt_error', handler: _lazy_pkLN9i, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_multi_cache/purge/all', handler: _kD_xYb, lazy: false, middleware: false, method: "post" },
  { route: '/__nuxt_multi_cache/purge/tags', handler: _t3RxPu, lazy: false, middleware: false, method: "post" },
  { route: '/__nuxt_multi_cache/purge/:cacheName', handler: _N0A1PD, lazy: false, middleware: false, method: "post" },
  { route: '/__nuxt_multi_cache/stats/:cacheName', handler: _6j1bIz, lazy: false, middleware: false, method: "get" },
  { route: '/__nuxt_multi_cache/inspect/:cacheName', handler: _n5gYX8, lazy: false, middleware: false, method: "get" },
  { route: '/api/_mdc/highlight', handler: _9S25FR, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_pkLN9i, lazy: true, middleware: false, method: undefined }
];

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const envContext = event.node.req?.__unenv__;
      if (envContext) {
        Object.assign(event.context, envContext);
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (envContext?.waitUntil) {
          envContext.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(nodeHandler, aRequest);
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _messages = { "appName": "Nuxt", "version": "", "statusCode": 500, "statusMessage": "Server error", "description": "An error occurred in the application and the page could not be served. If you are the application owner, check your server logs for details.", "stack": "" };
const template$1 = (messages) => {
  messages = { ..._messages, ...messages };
  return '<!DOCTYPE html><html lang="en"><head><title>' + messages.statusCode + " - " + (messages.statusMessage || "Internal Server Error") + `</title><meta charset="utf-8"><meta content="width=device-width,initial-scale=1.0,minimum-scale=1.0" name="viewport"><style>.spotlight{background:linear-gradient(45deg,#00dc82,#36e4da 50%,#0047e1);bottom:-40vh;filter:blur(30vh);height:60vh;opacity:.8}*,:after,:before{border-color:var(--un-default-border-color,#e5e7eb);border-style:solid;border-width:0;box-sizing:border-box}:after,:before{--un-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-moz-tab-size:4;tab-size:4;-webkit-tap-highlight-color:transparent}body{line-height:inherit;margin:0}h1{font-size:inherit;font-weight:inherit}h1,p{margin:0}*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.fixed{position:fixed}.left-0{left:0}.right-0{right:0}.z-10{z-index:10}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.h-auto{height:auto}.min-h-screen{min-height:100vh}.flex{display:flex}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.overflow-y-auto{overflow-y:auto}.rounded-t-md{border-top-left-radius:.375rem;border-top-right-radius:.375rem}.bg-black\\/5{background-color:#0000000d}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255/var(--un-bg-opacity))}.p-8{padding:2rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.pt-14{padding-top:3.5rem}.text-6xl{font-size:3.75rem;line-height:1}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-black{--un-text-opacity:1;color:rgb(0 0 0/var(--un-text-opacity))}.font-light{font-weight:300}.font-medium{font-weight:500}.leading-tight{line-height:1.25}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media (prefers-color-scheme:dark){.dark\\:bg-black{--un-bg-opacity:1;background-color:rgb(0 0 0/var(--un-bg-opacity))}.dark\\:bg-white\\/10{background-color:#ffffff1a}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255/var(--un-text-opacity))}}@media (min-width:640px){.sm\\:text-2xl{font-size:1.5rem;line-height:2rem}.sm\\:text-8xl{font-size:6rem;line-height:1}}</style><script>!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver((e=>{for(const o of e)if("childList"===o.type)for(const e of o.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&r(e)})).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;const r=function(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?r.credentials="include":"anonymous"===e.crossOrigin?r.credentials="omit":r.credentials="same-origin",r}(e);fetch(e.href,r)}}();<\/script></head><body class="antialiased bg-white dark:bg-black dark:text-white flex flex-col font-sans min-h-screen pt-14 px-10 text-black"><div class="fixed left-0 right-0 spotlight"></div><h1 class="font-medium mb-6 sm:text-8xl text-6xl">` + messages.statusCode + '</h1><p class="font-light leading-tight mb-8 sm:text-2xl text-xl">' + messages.description + '</p><div class="bg-black/5 bg-white dark:bg-white/10 flex-1 h-auto overflow-y-auto rounded-t-md"><div class="font-light leading-tight p-8 text-xl z-10">' + messages.stack + "</div></div></body></html>";
};

const errorDev = /*#__PURE__*/Object.freeze({
  __proto__: null,
  template: template$1
});

let configs;
function getMdcConfigs () {
if (!configs) {
  configs = Promise.all([
  ]);
}
return configs
}

function createShikiHighlighter({
  langs = [],
  themes = [],
  bundledLangs = {},
  bundledThemes = {},
  getMdcConfigs,
  options: shikiOptions,
  engine
} = {}) {
  let shiki;
  let configs;
  async function _getShiki() {
    const { createHighlighterCore, addClassToHast, isSpecialLang, isSpecialTheme } = await import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/shiki/dist/core.mjs');
    const { transformerNotationDiff, transformerNotationErrorLevel, transformerNotationFocus, transformerNotationHighlight } = await import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/transformers/dist/index.mjs');
    const shiki2 = await createHighlighterCore({
      langs,
      themes,
      engine: engine || createJavaScriptRegexEngine()
    });
    for await (const config of await getConfigs()) {
      await config.shiki?.setup?.(shiki2);
    }
    return {
      shiki: shiki2,
      addClassToHast,
      isSpecialLang,
      isSpecialTheme,
      transformers: [
        transformerNotationDiff(),
        transformerNotationErrorLevel(),
        transformerNotationFocus(),
        transformerNotationHighlight()
      ]
    };
  }
  async function getShiki() {
    if (!shiki) {
      shiki = _getShiki();
    }
    return shiki;
  }
  async function getConfigs() {
    if (!configs) {
      configs = Promise.resolve(getMdcConfigs?.() || []);
    }
    return configs;
  }
  const highlighter = async (code, lang, theme, options = {}) => {
    const {
      shiki: shiki2,
      addClassToHast,
      isSpecialLang,
      isSpecialTheme,
      transformers: baseTransformers
    } = await getShiki();
    const codeToHastOptions = {
      defaultColor: false,
      meta: {
        __raw: options.meta
      }
    };
    if (lang === "ts-type" || lang === "typescript-type") {
      lang = "typescript";
      codeToHastOptions.grammarContextCode = "let a:";
    } else if (lang === "vue-html" || lang === "vue-template") {
      lang = "vue";
      codeToHastOptions.grammarContextCode = "<template>";
    }
    const themesObject = { ...typeof theme === "string" ? { default: theme } : theme || {} };
    const loadedThemes = shiki2.getLoadedThemes();
    const loadedLanguages = shiki2.getLoadedLanguages();
    if (typeof lang === "string" && !loadedLanguages.includes(lang) && !isSpecialLang(lang)) {
      if (bundledLangs[lang]) {
        await shiki2.loadLanguage(bundledLangs[lang]);
      } else {
        {
          console.warn(`[@nuxtjs/mdc] Language "${lang}" is not loaded to the Shiki highlighter, fallback to plain text. Add the language to "mdc.highlight.langs" to fix this.`);
        }
        lang = "text";
      }
    }
    for (const [color, theme2] of Object.entries(themesObject)) {
      if (typeof theme2 === "string" && !loadedThemes.includes(theme2) && !isSpecialTheme(theme2)) {
        if (bundledThemes[theme2]) {
          await shiki2.loadTheme(bundledThemes[theme2]);
        } else {
          {
            console.warn(`[@nuxtjs/mdc] Theme "${theme2}" is not loaded to the Shiki highlighter. Add the theme to "mdc.highlight.themes" to fix this.`);
          }
          themesObject[color] = "none";
        }
      }
    }
    const transformersMap = /* @__PURE__ */ new Map();
    for (const transformer of baseTransformers) {
      transformersMap.set(transformer.name || `transformer:${Math.random()}-${transformer.constructor.name}`, transformer);
    }
    for (const config of await getConfigs()) {
      const newTransformers = typeof config.shiki?.transformers === "function" ? await config.shiki?.transformers(code, lang, theme, options) : config.shiki?.transformers || [];
      for (const transformer of newTransformers) {
        transformersMap.set(transformer.name || `transformer:${Math.random()}-${transformer.constructor.name}`, transformer);
      }
    }
    const root = shiki2.codeToHast(code.trimEnd(), {
      lang,
      ...codeToHastOptions,
      themes: themesObject,
      transformers: [
        ...transformersMap.values(),
        {
          name: "mdc:highlight",
          line(node, line) {
            if (options.highlights?.includes(line))
              addClassToHast(node, "highlight");
            node.properties.line = line;
          }
        },
        {
          name: "mdc:newline",
          line(node) {
            if (code?.includes("\n")) {
              if (node.children.length === 0 || node.children.length === 1 && node.children[0].type === "element" && node.children[0].children.length === 1 && node.children[0].children[0].type === "text" && node.children[0].children[0].value === "") {
                node.children = [{
                  type: "element",
                  tagName: "span",
                  properties: {
                    emptyLinePlaceholder: true
                  },
                  children: [{ type: "text", value: "\n" }]
                }];
                return;
              }
              const last = node.children.at(-1);
              if (last?.type === "element" && last.tagName === "span") {
                const text = last.children.at(-1);
                if (text?.type === "text")
                  text.value += "\n";
              }
            }
          }
        }
      ]
    });
    const preEl = root.children[0];
    const codeEl = preEl.children[0];
    const wrapperStyle = shikiOptions?.wrapperStyle;
    preEl.properties.style = wrapperStyle ? typeof wrapperStyle === "string" ? wrapperStyle : preEl.properties.style : "";
    const styles = [];
    Object.keys(themesObject).forEach((color) => {
      const colorScheme = color !== "default" ? `.${color}` : "";
      styles.push(
        wrapperStyle ? `${colorScheme} .shiki,` : "",
        `html .${color} .shiki span {`,
        `color: var(--shiki-${color});`,
        `background: var(--shiki-${color}-bg);`,
        `font-style: var(--shiki-${color}-font-style);`,
        `font-weight: var(--shiki-${color}-font-weight);`,
        `text-decoration: var(--shiki-${color}-text-decoration);`,
        "}"
      );
      styles.push(
        `html${colorScheme} .shiki span {`,
        `color: var(--shiki-${color});`,
        `background: var(--shiki-${color}-bg);`,
        `font-style: var(--shiki-${color}-font-style);`,
        `font-weight: var(--shiki-${color}-font-weight);`,
        `text-decoration: var(--shiki-${color}-text-decoration);`,
        "}"
      );
    });
    return {
      tree: codeEl.children,
      className: Array.isArray(preEl.properties.class) ? preEl.properties.class.join(" ") : preEl.properties.class,
      inlineStyle: preEl.properties.style,
      style: styles.join("")
    };
  };
  return highlighter;
}

const bundledLangs = {
"typescript": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/typescript.mjs').then(r => r.default || r),
"ts": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/typescript.mjs').then(r => r.default || r),
"javascript": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/javascript.mjs').then(r => r.default || r),
"js": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/javascript.mjs').then(r => r.default || r),
"csharp": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/csharp.mjs').then(r => r.default || r),
"c#": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/csharp.mjs').then(r => r.default || r),
"cs": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/csharp.mjs').then(r => r.default || r),
"vue-html": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/vue-html.mjs').then(r => r.default || r),
"vue": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/vue.mjs').then(r => r.default || r),
"json": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/json.mjs').then(r => r.default || r),
};
const bundledThemes = {
"github-dark": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/themes/dist/github-dark.mjs').then(r => r.default || r),
};
const options = {"wrapperStyle":true};
const engine = createOnigurumaEngine(() => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/shiki/dist/wasm.mjs'));
const highlighter = createShikiHighlighter({ bundledLangs, bundledThemes, options, getMdcConfigs, engine });

const mdcHighlighter = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createShikiHighlighter: createShikiHighlighter,
  default: highlighter
});

class BaseHttpRequest {
  constructor(config) {
    this.config = config;
  }
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
class ApiError extends Error {
  constructor(request, response, message) {
    super(message);
    __publicField$1(this, "url");
    __publicField$1(this, "status");
    __publicField$1(this, "statusText");
    __publicField$1(this, "body");
    __publicField$1(this, "request");
    this.name = "ApiError";
    this.url = response.url;
    this.status = response.status;
    this.statusText = response.statusText;
    this.body = response.body;
    this.request = request;
  }
}

var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _isResolved, _isRejected, _isCancelled, _cancelHandlers, _promise, _resolve, _reject;
class CancelError extends Error {
  constructor(message) {
    super(message);
    this.name = "CancelError";
  }
  get isCancelled() {
    return true;
  }
}
class CancelablePromise {
  constructor(executor) {
    __privateAdd(this, _isResolved);
    __privateAdd(this, _isRejected);
    __privateAdd(this, _isCancelled);
    __privateAdd(this, _cancelHandlers);
    __privateAdd(this, _promise);
    __privateAdd(this, _resolve);
    __privateAdd(this, _reject);
    __privateSet(this, _isResolved, false);
    __privateSet(this, _isRejected, false);
    __privateSet(this, _isCancelled, false);
    __privateSet(this, _cancelHandlers, []);
    __privateSet(this, _promise, new Promise((resolve, reject) => {
      __privateSet(this, _resolve, resolve);
      __privateSet(this, _reject, reject);
      const onResolve = (value) => {
        if (__privateGet(this, _isResolved) || __privateGet(this, _isRejected) || __privateGet(this, _isCancelled)) {
          return;
        }
        __privateSet(this, _isResolved, true);
        if (__privateGet(this, _resolve)) __privateGet(this, _resolve).call(this, value);
      };
      const onReject = (reason) => {
        if (__privateGet(this, _isResolved) || __privateGet(this, _isRejected) || __privateGet(this, _isCancelled)) {
          return;
        }
        __privateSet(this, _isRejected, true);
        if (__privateGet(this, _reject)) __privateGet(this, _reject).call(this, reason);
      };
      const onCancel = (cancelHandler) => {
        if (__privateGet(this, _isResolved) || __privateGet(this, _isRejected) || __privateGet(this, _isCancelled)) {
          return;
        }
        __privateGet(this, _cancelHandlers).push(cancelHandler);
      };
      Object.defineProperty(onCancel, "isResolved", {
        get: () => __privateGet(this, _isResolved)
      });
      Object.defineProperty(onCancel, "isRejected", {
        get: () => __privateGet(this, _isRejected)
      });
      Object.defineProperty(onCancel, "isCancelled", {
        get: () => __privateGet(this, _isCancelled)
      });
      return executor(onResolve, onReject, onCancel);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(onFulfilled, onRejected) {
    return __privateGet(this, _promise).then(onFulfilled, onRejected);
  }
  catch(onRejected) {
    return __privateGet(this, _promise).catch(onRejected);
  }
  finally(onFinally) {
    return __privateGet(this, _promise).finally(onFinally);
  }
  cancel() {
    if (__privateGet(this, _isResolved) || __privateGet(this, _isRejected) || __privateGet(this, _isCancelled)) {
      return;
    }
    __privateSet(this, _isCancelled, true);
    if (__privateGet(this, _cancelHandlers).length) {
      try {
        for (const cancelHandler of __privateGet(this, _cancelHandlers)) {
          cancelHandler();
        }
      } catch (error) {
        console.warn("Cancellation threw an error", error);
        return;
      }
    }
    __privateGet(this, _cancelHandlers).length = 0;
    if (__privateGet(this, _reject)) __privateGet(this, _reject).call(this, new CancelError("Request aborted"));
  }
  get isCancelled() {
    return __privateGet(this, _isCancelled);
  }
}
_isResolved = new WeakMap();
_isRejected = new WeakMap();
_isCancelled = new WeakMap();
_cancelHandlers = new WeakMap();
_promise = new WeakMap();
_resolve = new WeakMap();
_reject = new WeakMap();

const isDefined = (value) => {
  return value !== void 0 && value !== null;
};
const isString = (value) => {
  return typeof value === "string";
};
const isStringWithValue = (value) => {
  return isString(value) && value !== "";
};
const isBlob = (value) => {
  return typeof value === "object" && typeof value.type === "string" && typeof value.stream === "function" && typeof value.arrayBuffer === "function" && typeof value.constructor === "function" && typeof value.constructor.name === "string" && /^(Blob|File)$/.test(value.constructor.name) && /^(Blob|File)$/.test(value[Symbol.toStringTag]);
};
const isFormData = (value) => {
  return value instanceof FormData;
};
const base64 = (str) => {
  try {
    return btoa(str);
  } catch (err) {
    return Buffer.from(str).toString("base64");
  }
};
const getQueryString = (params) => {
  const qs = [];
  const append = (key, value) => {
    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };
  const process = (key, value) => {
    if (isDefined(value)) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          process(key, v);
        });
      } else if (typeof value === "object") {
        Object.entries(value).forEach(([k, v]) => {
          process(`${key}[${k}]`, v);
        });
      } else {
        append(key, value);
      }
    }
  };
  Object.entries(params).forEach(([key, value]) => {
    process(key, value);
  });
  if (qs.length > 0) {
    return `?${qs.join("&")}`;
  }
  return "";
};
const getUrl = (config, options) => {
  const encoder = config.ENCODE_PATH || encodeURI;
  const path = options.url.replace("{api-version}", config.VERSION).replace(/{(.*?)}/g, (substring, group) => {
    var _a;
    if ((_a = options.path) == null ? void 0 : _a.hasOwnProperty(group)) {
      return encoder(String(options.path[group]));
    }
    return substring;
  });
  const url = `${config.BASE}${path}`;
  if (options.query) {
    return `${url}${getQueryString(options.query)}`;
  }
  return url;
};
const getFormData = (options) => {
  if (options.formData) {
    const formData = new FormData();
    const process = (key, value) => {
      if (isString(value) || isBlob(value)) {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    };
    Object.entries(options.formData).filter(([_, value]) => isDefined(value)).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => process(key, v));
      } else {
        process(key, value);
      }
    });
    return formData;
  }
  return void 0;
};
const resolve = async (options, resolver) => {
  if (typeof resolver === "function") {
    return resolver(options);
  }
  return resolver;
};
const getHeaders = async (config, options) => {
  const [token, username, password, additionalHeaders] = await Promise.all([
    resolve(options, config.TOKEN),
    resolve(options, config.USERNAME),
    resolve(options, config.PASSWORD),
    resolve(options, config.HEADERS)
  ]);
  const headers = Object.entries({
    Accept: "application/json",
    ...additionalHeaders,
    ...options.headers
  }).filter(([_, value]) => isDefined(value)).reduce((headers2, [key, value]) => ({
    ...headers2,
    [key]: String(value)
  }), {});
  if (isStringWithValue(token)) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (isStringWithValue(username) && isStringWithValue(password)) {
    const credentials = base64(`${username}:${password}`);
    headers["Authorization"] = `Basic ${credentials}`;
  }
  if (options.body !== void 0) {
    if (options.mediaType) {
      headers["Content-Type"] = options.mediaType;
    } else if (isBlob(options.body)) {
      headers["Content-Type"] = options.body.type || "application/octet-stream";
    } else if (isString(options.body)) {
      headers["Content-Type"] = "text/plain";
    } else if (!isFormData(options.body)) {
      headers["Content-Type"] = "application/json";
    }
  }
  return new Headers(headers);
};
const getRequestBody = (options) => {
  var _a;
  if (options.body !== void 0) {
    if ((_a = options.mediaType) == null ? void 0 : _a.includes("/json")) {
      return JSON.stringify(options.body);
    } else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {
      return options.body;
    } else {
      return JSON.stringify(options.body);
    }
  }
  return void 0;
};
const sendRequest = async (config, options, url, body, formData, headers, onCancel) => {
  const controller = new AbortController();
  const request2 = {
    headers,
    body: body != null ? body : formData,
    method: options.method,
    signal: controller.signal
  };
  if (config.WITH_CREDENTIALS) {
    request2.credentials = config.CREDENTIALS;
  }
  onCancel(() => controller.abort());
  return await fetch(url, request2);
};
const getResponseHeader = (response, responseHeader) => {
  if (responseHeader) {
    const content = response.headers.get(responseHeader);
    if (isString(content)) {
      return content;
    }
  }
  return void 0;
};
const getResponseBody = async (response) => {
  if (response.status !== 204) {
    try {
      const contentType = response.headers.get("Content-Type");
      if (contentType) {
        const jsonTypes = ["application/json", "application/problem+json"];
        const isJSON = jsonTypes.some((type) => contentType.toLowerCase().startsWith(type));
        if (isJSON) {
          return await response.json();
        } else {
          return await response.text();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return void 0;
};
const catchErrorCodes = (options, result) => {
  var _a, _b;
  const errors = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...options.errors
  };
  const error = errors[result.status];
  if (error) {
    throw new ApiError(options, result, error);
  }
  if (!result.ok) {
    const errorStatus = (_a = result.status) != null ? _a : "unknown";
    const errorStatusText = (_b = result.statusText) != null ? _b : "unknown";
    const errorBody = (() => {
      try {
        return JSON.stringify(result.body, null, 2);
      } catch (e) {
        return void 0;
      }
    })();
    throw new ApiError(
      options,
      result,
      `Generic Error: status: ${errorStatus}; status text: ${errorStatusText}; body: ${errorBody}`
    );
  }
};
const request = (config, options) => {
  return new CancelablePromise(async (resolve2, reject, onCancel) => {
    try {
      const url = getUrl(config, options);
      const formData = getFormData(options);
      const body = getRequestBody(options);
      const headers = await getHeaders(config, options);
      if (!onCancel.isCancelled) {
        const response = await sendRequest(config, options, url, body, formData, headers, onCancel);
        const responseBody = await getResponseBody(response);
        const responseHeader = getResponseHeader(response, options.responseHeader);
        const result = {
          url,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          body: responseHeader != null ? responseHeader : responseBody
        };
        catchErrorCodes(options, result);
        resolve2(result.body);
      }
    } catch (error) {
      reject(error);
    }
  });
};

class FetchHttpRequest extends BaseHttpRequest {
  constructor(config) {
    super(config);
  }
  /**
   * Request method
   * @param options The request options from the service
   * @returns CancelablePromise<T>
   * @throws ApiError
   */
  request(options) {
    return request(this.config, options);
  }
}

class ContentService {
  constructor(httpRequest) {
    this.httpRequest = httpRequest;
  }
  /**
   * @returns PagedIApiContentResponseModel OK
   * @throws ApiError
   */
  getContent20({
    fetch,
    filter,
    sort,
    skip,
    take = 10,
    expand,
    fields,
    acceptLanguage,
    acceptSegment,
    apiKey,
    preview,
    startItem
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/content",
      headers: {
        "Accept-Language": acceptLanguage,
        "Accept-Segment": acceptSegment,
        "Api-Key": apiKey,
        "Preview": preview,
        "Start-Item": startItem
      },
      query: {
        "fetch": fetch,
        "filter": filter,
        "sort": sort,
        "skip": skip,
        "take": take,
        "expand": expand,
        "fields": fields
      },
      errors: {
        400: `Bad Request`,
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiContentResponseModel OK
   * @throws ApiError
   */
  getContentItemByPath20({
    path = "",
    expand,
    fields,
    acceptLanguage,
    acceptSegment,
    apiKey,
    preview,
    startItem
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/content/item/{path}",
      path: {
        "path": path
      },
      headers: {
        "Accept-Language": acceptLanguage,
        "Accept-Segment": acceptSegment,
        "Api-Key": apiKey,
        "Preview": preview,
        "Start-Item": startItem
      },
      query: {
        "expand": expand,
        "fields": fields
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiContentResponseModel OK
   * @throws ApiError
   */
  getContentItemById20({
    id,
    expand,
    fields,
    acceptLanguage,
    acceptSegment,
    apiKey,
    preview,
    startItem
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/content/item/{id}",
      path: {
        "id": id
      },
      headers: {
        "Accept-Language": acceptLanguage,
        "Accept-Segment": acceptSegment,
        "Api-Key": apiKey,
        "Preview": preview,
        "Start-Item": startItem
      },
      query: {
        "expand": expand,
        "fields": fields
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiContentResponseModel OK
   * @throws ApiError
   */
  getContentItems20({
    id,
    expand,
    fields,
    acceptLanguage,
    acceptSegment,
    apiKey,
    preview,
    startItem
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/content/items",
      headers: {
        "Accept-Language": acceptLanguage,
        "Accept-Segment": acceptSegment,
        "Api-Key": apiKey,
        "Preview": preview,
        "Start-Item": startItem
      },
      query: {
        "id": id,
        "expand": expand,
        "fields": fields
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`
      }
    });
  }
}

class MediaService {
  constructor(httpRequest) {
    this.httpRequest = httpRequest;
  }
  /**
   * @returns PagedIApiMediaWithCropsResponseModel OK
   * @throws ApiError
   */
  getMedia20({
    fetch,
    filter,
    sort,
    skip,
    take = 10,
    expand,
    fields,
    apiKey
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/media",
      headers: {
        "Api-Key": apiKey
      },
      query: {
        "fetch": fetch,
        "filter": filter,
        "sort": sort,
        "skip": skip,
        "take": take,
        "expand": expand,
        "fields": fields
      },
      errors: {
        400: `Bad Request`
      }
    });
  }
  /**
   * @returns IApiMediaWithCropsResponseModel OK
   * @throws ApiError
   */
  getMediaItemByPath20({
    path,
    expand,
    fields,
    apiKey
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/media/item/{path}",
      path: {
        "path": path
      },
      headers: {
        "Api-Key": apiKey
      },
      query: {
        "expand": expand,
        "fields": fields
      },
      errors: {
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiMediaWithCropsResponseModel OK
   * @throws ApiError
   */
  getMediaItemById20({
    id,
    expand,
    fields,
    apiKey
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/media/item/{id}",
      path: {
        "id": id
      },
      headers: {
        "Api-Key": apiKey
      },
      query: {
        "expand": expand,
        "fields": fields
      },
      errors: {
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiMediaWithCropsResponseModel OK
   * @throws ApiError
   */
  getMediaItems20({
    id,
    expand,
    fields,
    apiKey
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/media/items",
      headers: {
        "Api-Key": apiKey
      },
      query: {
        "id": id,
        "expand": expand,
        "fields": fields
      }
    });
  }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class DeliveryClient {
  constructor(config, HttpRequest = FetchHttpRequest) {
    __publicField(this, "content");
    __publicField(this, "media");
    __publicField(this, "request");
    var _a, _b, _c, _d;
    this.request = new HttpRequest({
      BASE: (_a = config == null ? void 0 : config.BASE) != null ? _a : "",
      VERSION: (_b = config == null ? void 0 : config.VERSION) != null ? _b : "Latest",
      WITH_CREDENTIALS: (_c = config == null ? void 0 : config.WITH_CREDENTIALS) != null ? _c : false,
      CREDENTIALS: (_d = config == null ? void 0 : config.CREDENTIALS) != null ? _d : "include",
      TOKEN: config == null ? void 0 : config.TOKEN,
      USERNAME: config == null ? void 0 : config.USERNAME,
      PASSWORD: config == null ? void 0 : config.PASSWORD,
      HEADERS: config == null ? void 0 : config.HEADERS,
      ENCODE_PATH: config == null ? void 0 : config.ENCODE_PATH
    });
    this.content = new ContentService(this.request);
    this.media = new MediaService(this.request);
  }
}

const ____slug_ = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { slug } = event.context.params;
  const api = new DeliveryClient({
    BASE: config.public.cmsHost
  });
  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: "/" + slug
      // Assuming slug is the path here
    });
    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: "Content not found"
      });
    }
    return response;
  } catch (e) {
    console.error(`Failed to fetch content for slug "${slug}"`, e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch content"
    });
  }
});

const ____slug_$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: ____slug_
});

const _id_ = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { id } = event.context.params;
  const api = new DeliveryClient({
    BASE: config.public.cmsHost
  });
  try {
    const response = await api.content.getContent20({
      fetch: `children:${id}`,
      apiKey: config.deliveryKey,
      expand: "properties[$all]"
    });
    return response;
  } catch (e) {
    console.error(`Failed to fetch children for id "${id}"`, e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch children"
    });
  }
});

const _id_$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id_
});

const navigation = defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const api = new DeliveryClient({
    BASE: config.public.cmsHost
  });
  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: ""
    });
    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: "Navigation not found"
      });
    }
    return response;
  } catch (e) {
    console.error("Failed to fetch navigation", e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch navigation"
    });
  }
});

const navigation$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: navigation
});

const callback = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const clientId = config.public.murderClient;
  const clientSecret = config.murderKey;
  const { code, state } = getQuery$1(event);
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    }
  ).then((res) => res.json());
  const accessToken = tokenResponse.access_token;
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json"
    }
  }).then((res) => res.json());
  const username = userResponse.login;
  console.log(`\u{1F480} Murder committed by: ${username}`);
  try {
    await $fetch("/api/murder/push", {
      method: "POST",
      body: { username }
    });
    console.log(`\u{1F4DD} Murder successfully logged for ${username}`);
  } catch (error) {
    console.error("\u274C Failed to log murder:", error);
  }
  try {
    await $fetch(`${config.public.cmsHost}/api/heartbeat/heartattack`, {
      method: "GET",
      headers: {
        MurderKey: clientSecret
        // The secret murder key from your config
      }
    });
    console.log("\u{1F4A5} Heart attack successfully triggered.");
  } catch (error) {
    console.error("\u274C Failed to trigger heart attack:", error);
  }
  setResponseHeader(
    event,
    "Set-Cookie",
    serialize$1("pushed-by", username, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7
      // 7 days
    })
  );
  sendRedirect(event, state);
});

const callback$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: callback
});

const list_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const murders = await $fetch(`${config.public.cmsHost}/api/murder/`, { method: "GET" }).catch((error) => {
    console.error("Failed to fetch murders:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch murders."
    });
  });
  const grouped = murders.reduce((acc, murder) => {
    const { username, created } = murder;
    if (!acc[username]) {
      acc[username] = { count: 1, last: created };
    } else {
      acc[username].count += 1;
      if (new Date(created) > new Date(acc[username].last)) {
        acc[username].last = created;
      }
    }
    return acc;
  }, {});
  const result = Object.entries(grouped).map(
    ([username, { count, last }]) => ({
      username,
      count,
      last
    })
  );
  result.sort(
    (a, b) => new Date(b.last).getTime() - new Date(a.last).getTime()
  );
  return result;
});

const list_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_get
});

const push_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  if (!(body == null ? void 0 : body.username)) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "Username is required." })
    );
  }
  const response = await $fetch(`${config.public.cmsHost}/api/murder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      MurderKey: config.murderKey
    },
    body: {
      username: body.username
    }
  }).catch((error) => {
    console.error("Failed to push murder:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to push murder."
    });
  });
  return response;
});

const push_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: push_post
});

const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};

const headSymbol = "usehead";
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

function resolveUnrefHeadInput(input) {
  return walkResolver(input, VueResolver);
}

const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getClientManifest = () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/.nuxt/dist/server/client.manifest.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getServerEntry = () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/.nuxt/dist/server/server.mjs').then((r) => r.default || r);
const getSSRStyles = lazyCachedFunction(() => Promise.resolve().then(function () { return styles$1; }).then((r) => r.default || r));
const getSSRRenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  if (!manifest) {
    throw new Error("client.manifest is not available");
  }
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const options = {
    manifest,
    renderToString: renderToString$1,
    buildAssetsURL
  };
  const renderer = createRenderer(createSSRApp, options);
  async function renderToString$1(input, context) {
    const html = await renderToString(input, context);
    if (process.env.NUXT_VITE_NODE_OPTIONS) {
      renderer.rendererContext.updateManifest(await getClientManifest());
    }
    return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
  }
  return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "").then((r) => {
    {
      return APP_ROOT_OPEN_TAG + r + APP_ROOT_CLOSE_TAG;
    }
  });
  const options = {
    manifest,
    renderToString: () => spaTemplate,
    buildAssetsURL
  };
  const renderer = createRenderer(() => () => {
  }, options);
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig(ssrContext.event);
    ssrContext.modules ||= /* @__PURE__ */ new Set();
    ssrContext.payload.serverRendered = false;
    ssrContext.config = {
      public: config.public,
      app: config.app
    };
    return Promise.resolve(result);
  };
  return {
    rendererContext: renderer.rendererContext,
    renderToString
  };
});
function lazyCachedFunction(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}

function renderPayloadResponse(ssrContext) {
  return {
    body: stringify$1(splitPayload(ssrContext).payload, ssrContext._payloadReducers) ,
    statusCode: getResponseStatus(ssrContext.event),
    statusMessage: getResponseStatusText(ssrContext.event),
    headers: {
      "content-type": "application/json;charset=utf-8" ,
      "x-powered-by": "Nuxt"
    }
  };
}
function renderPayloadJsonScript(opts) {
  const contents = opts.data ? stringify$1(opts.data, opts.ssrContext._payloadReducers) : "";
  const payload = {
    "type": "application/json",
    "innerHTML": contents,
    "data-nuxt-data": appId,
    "data-ssr": !(opts.ssrContext.noSSR)
  };
  {
    payload.id = "__NUXT_DATA__";
  }
  if (opts.src) {
    payload["data-src"] = opts.src;
  }
  const config = uneval(opts.ssrContext.config);
  return [
    payload,
    {
      innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}`
    }
  ];
}
function splitPayload(ssrContext) {
  const { data, prerenderedAt, ...initial } = ssrContext.payload;
  return {
    initial: { ...initial, prerenderedAt },
    payload: { data, prerenderedAt }
  };
}

const unheadOptions = {
  disableDefaults: true,
  disableCapoSorting: false,
  plugins: [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin],
};

const renderSSRHeadOptions = {"omitLineBreaks":false};

globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const ISLAND_SUFFIX_RE = /\.json(\?.*)?$/;
async function getIslandContext(event) {
  let url = event.path || "";
  const componentParts = url.substring("/__nuxt_island".length + 1).replace(ISLAND_SUFFIX_RE, "").split("_");
  const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
  const componentName = componentParts.join("_");
  const context = event.method === "GET" ? getQuery$1(event) : await readBody(event);
  const ctx = {
    url: "/",
    ...context,
    id: hashId,
    name: componentName,
    props: destr(context.props) || {},
    slots: {},
    components: {}
  };
  return ctx;
}
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const PAYLOAD_URL_RE = /^[^?]*\/_payload.json(?:\?.*)?$/ ;
const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
const renderer = defineRenderHandler(async (event) => {
  const nitroApp = useNitroApp();
  const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
  if (ssrError && ssrError.statusCode) {
    ssrError.statusCode = Number.parseInt(ssrError.statusCode);
  }
  if (ssrError && !("__unenv__" in event.node.req)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found: /__nuxt_error"
    });
  }
  const isRenderingIsland = event.path.startsWith("/__nuxt_island");
  const islandContext = isRenderingIsland ? await getIslandContext(event) : void 0;
  let url = ssrError?.url || islandContext?.url || event.path;
  const isRenderingPayload = !isRenderingIsland && PAYLOAD_URL_RE.test(url);
  if (isRenderingPayload) {
    url = url.substring(0, url.lastIndexOf("/")) || "/";
    event._path = url;
    event.node.req.url = url;
  }
  const routeOptions = getRouteRules(event);
  const head = createHead(unheadOptions);
  const headEntryOptions = { mode: "server" };
  if (!isRenderingIsland) {
    head.push(appHead, headEntryOptions);
  }
  const ssrContext = {
    url,
    event,
    runtimeConfig: useRuntimeConfig(event),
    noSSR: event.context.nuxt?.noSSR || routeOptions.ssr === false && !isRenderingIsland || (false),
    head,
    error: !!ssrError,
    nuxt: void 0,
    /* NuxtApp */
    payload: ssrError ? { error: ssrError } : {},
    _payloadReducers: /* @__PURE__ */ Object.create(null),
    modules: /* @__PURE__ */ new Set(),
    islandContext
  };
  const renderer = ssrContext.noSSR ? await getSPARenderer() : await getSSRRenderer();
  const _rendered = await renderer.renderToString(ssrContext).catch(async (error) => {
    if (ssrContext._renderResponse && error.message === "skipping render") {
      return {};
    }
    const _err = !ssrError && ssrContext.payload?.error || error;
    await ssrContext.nuxt?.hooks.callHook("app:error", _err);
    throw _err;
  });
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult: _rendered });
  if (ssrContext._renderResponse) {
    return ssrContext._renderResponse;
  }
  if (ssrContext.payload?.error && !ssrError) {
    throw ssrContext.payload.error;
  }
  if (isRenderingPayload) {
    const response2 = renderPayloadResponse(ssrContext);
    return response2;
  }
  const inlinedStyles = isRenderingIsland ? await renderInlineStyles(ssrContext.modules ?? []) : [];
  const NO_SCRIPTS = routeOptions.noScripts;
  const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
  if (ssrContext._preloadManifest) {
    head.push({
      link: [
        { rel: "preload", as: "fetch", fetchpriority: "low", crossorigin: "anonymous", href: buildAssetsURL(`builds/meta/${ssrContext.runtimeConfig.app.buildId}.json`) }
      ]
    }, { ...headEntryOptions, tagPriority: "low" });
  }
  if (inlinedStyles.length) {
    head.push({ style: inlinedStyles });
  }
  {
    const link = [];
    for (const resource of Object.values(styles)) {
      if ("inline" in getQuery(resource.file)) {
        continue;
      }
      if (!isRenderingIsland || resource.file.includes("scoped") && !resource.file.includes("pages/")) {
        link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
      }
    }
    if (link.length) {
      head.push({ link }, headEntryOptions);
    }
  }
  if (isRenderingIsland && islandContext) {
    const islandHead = {};
    for (const entry of head.entries.values()) {
      for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
        const currentValue = islandHead[key];
        if (Array.isArray(currentValue)) {
          currentValue.push(...value);
        }
        islandHead[key] = value;
      }
    }
    islandHead.link ||= [];
    islandHead.style ||= [];
    const islandResponse = {
      id: islandContext.id,
      head: islandHead,
      html: getServerComponentHTML(_rendered.html),
      components: getClientIslandResponse(ssrContext),
      slots: getSlotIslandResponse(ssrContext)
    };
    await nitroApp.hooks.callHook("render:island", islandResponse, { event, islandContext });
    const response2 = {
      body: JSON.stringify(islandResponse, null, 2),
      statusCode: getResponseStatus(event),
      statusMessage: getResponseStatusText(event),
      headers: {
        "content-type": "application/json;charset=utf-8",
        "x-powered-by": "Nuxt"
      }
    };
    return response2;
  }
  if (!NO_SCRIPTS) {
    head.push({
      link: getPreloadLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    head.push({
      link: getPrefetchLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    head.push({
      script: renderPayloadJsonScript({ ssrContext, data: ssrContext.payload }) 
    }, {
      ...headEntryOptions,
      // this should come before another end of body scripts
      tagPosition: "bodyClose",
      tagPriority: "high"
    });
  }
  if (!routeOptions.noScripts) {
    head.push({
      script: Object.values(scripts).map((resource) => ({
        type: resource.module ? "module" : null,
        src: renderer.rendererContext.buildAssetsURL(resource.file),
        defer: resource.module ? null : true,
        // if we are rendering script tag payloads that import an async payload
        // we need to ensure this resolves before executing the Nuxt entry
        tagPosition: "head",
        crossorigin: ""
      }))
    }, headEntryOptions);
  }
  const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(head, renderSSRHeadOptions);
  const htmlContext = {
    island: isRenderingIsland,
    htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
    head: normalizeChunks([headTags]),
    bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
    bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
    body: [
      replaceIslandTeleports(ssrContext, _rendered.html) ,
      APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG
    ],
    bodyAppend: [bodyTags]
  };
  await nitroApp.hooks.callHook("render:html", htmlContext, { event });
  const response = {
    body: renderHTMLDocument(htmlContext),
    statusCode: getResponseStatus(event),
    statusMessage: getResponseStatusText(event),
    headers: {
      "content-type": "text/html;charset=utf-8",
      "x-powered-by": "Nuxt"
    }
  };
  return response;
});
function normalizeChunks(chunks) {
  return chunks.filter(Boolean).map((i) => i.trim());
}
function joinTags(tags) {
  return tags.join("");
}
function joinAttrs(chunks) {
  if (chunks.length === 0) {
    return "";
  }
  return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
  return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}
async function renderInlineStyles(usedModules) {
  const styleMap = await getSSRStyles();
  const inlinedStyles = /* @__PURE__ */ new Set();
  for (const mod of usedModules) {
    if (mod in styleMap && styleMap[mod]) {
      for (const style of await styleMap[mod]()) {
        inlinedStyles.add(style);
      }
    }
  }
  return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}
function getServerComponentHTML(body) {
  const match = body.match(ROOT_NODE_REGEX);
  return match?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
    return void 0;
  }
  const response = {};
  for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) {
    response[name] = {
      ...slot,
      fallback: ssrContext.teleports?.[`island-fallback=${name}`]
    };
  }
  return response;
}
function getClientIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) {
    return void 0;
  }
  const response = {};
  for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
    const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
    response[clientUid] = {
      ...component,
      html,
      slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
    };
  }
  return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
  const entries = Object.entries(teleports);
  const slots = {};
  for (const [key, value] of entries) {
    const match = key.match(SSR_CLIENT_SLOT_MARKER);
    if (match) {
      const [, id, slot] = match;
      if (!slot || clientUid !== id) {
        continue;
      }
      slots[slot] = value;
    }
  }
  return slots;
}
function replaceIslandTeleports(ssrContext, html) {
  const { teleports, islandContext } = ssrContext;
  if (islandContext || !teleports) {
    return html;
  }
  for (const key in teleports) {
    const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
    if (matchClientComp) {
      const [, uid, clientId] = matchClientComp;
      if (!uid || !clientId) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-component="${clientId}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
      continue;
    }
    const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
    if (matchSlot) {
      const [, uid, slot] = matchSlot;
      if (!uid || !slot) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-slot="${slot}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
    }
  }
  return html;
}

const renderer$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: renderer
});

const styles = {};

const styles$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: styles
});

const template = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze({
  __proto__: null,
  template: template
});
//# sourceMappingURL=index.mjs.map
