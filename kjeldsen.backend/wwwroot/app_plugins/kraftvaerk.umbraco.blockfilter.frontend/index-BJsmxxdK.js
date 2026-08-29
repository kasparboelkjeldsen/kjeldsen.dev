var k = (e) => {
  throw TypeError(e);
};
var D = (e, t, r) => t.has(e) || k("Cannot " + r);
var o = (e, t, r) => (D(e, t, "read from private field"), r ? r.call(e) : t.get(e)), p = (e, t, r) => t.has(e) ? k("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), l = (e, t, r, n) => (D(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import { UMB_AUTH_CONTEXT as U } from "@umbraco-cms/backoffice/auth";
class g {
  constructor(t) {
    this.config = t;
  }
}
class q extends Error {
  constructor(t, r, n) {
    super(n), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = t;
  }
}
class K extends Error {
  constructor(t) {
    super(t), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var d, h, u, E, b, S, T;
class _ {
  constructor(t) {
    p(this, d);
    p(this, h);
    p(this, u);
    p(this, E);
    p(this, b);
    p(this, S);
    p(this, T);
    l(this, d, !1), l(this, h, !1), l(this, u, !1), l(this, E, []), l(this, b, new Promise((r, n) => {
      l(this, S, r), l(this, T, n);
      const s = (c) => {
        o(this, d) || o(this, h) || o(this, u) || (l(this, d, !0), o(this, S) && o(this, S).call(this, c));
      }, a = (c) => {
        o(this, d) || o(this, h) || o(this, u) || (l(this, h, !0), o(this, T) && o(this, T).call(this, c));
      }, i = (c) => {
        o(this, d) || o(this, h) || o(this, u) || o(this, E).push(c);
      };
      return Object.defineProperty(i, "isResolved", {
        get: () => o(this, d)
      }), Object.defineProperty(i, "isRejected", {
        get: () => o(this, h)
      }), Object.defineProperty(i, "isCancelled", {
        get: () => o(this, u)
      }), t(s, a, i);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(t, r) {
    return o(this, b).then(t, r);
  }
  catch(t) {
    return o(this, b).catch(t);
  }
  finally(t) {
    return o(this, b).finally(t);
  }
  cancel() {
    if (!(o(this, d) || o(this, h) || o(this, u))) {
      if (l(this, u, !0), o(this, E).length)
        try {
          for (const t of o(this, E))
            t();
        } catch (t) {
          console.warn("Cancellation threw an error", t);
          return;
        }
      o(this, E).length = 0, o(this, T) && o(this, T).call(this, new K("Request aborted"));
    }
  }
  get isCancelled() {
    return o(this, u);
  }
}
d = new WeakMap(), h = new WeakMap(), u = new WeakMap(), E = new WeakMap(), b = new WeakMap(), S = new WeakMap(), T = new WeakMap();
const O = (e) => e != null, f = (e) => typeof e == "string", R = (e) => f(e) && e !== "", w = (e) => typeof e == "object" && typeof e.type == "string" && typeof e.stream == "function" && typeof e.arrayBuffer == "function" && typeof e.constructor == "function" && typeof e.constructor.name == "string" && /^(Blob|File)$/.test(e.constructor.name) && /^(Blob|File)$/.test(e[Symbol.toStringTag]), I = (e) => e instanceof FormData, v = (e) => {
  try {
    return btoa(e);
  } catch {
    return Buffer.from(e).toString("base64");
  }
}, W = (e) => {
  const t = [], r = (s, a) => {
    t.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(a))}`);
  }, n = (s, a) => {
    O(a) && (Array.isArray(a) ? a.forEach((i) => {
      n(s, i);
    }) : typeof a == "object" ? Object.entries(a).forEach(([i, c]) => {
      n(`${s}[${i}]`, c);
    }) : r(s, a));
  };
  return Object.entries(e).forEach(([s, a]) => {
    n(s, a);
  }), t.length > 0 ? `?${t.join("&")}` : "";
}, x = (e, t) => {
  const r = e.ENCODE_PATH || encodeURI, n = t.url.replace("{api-version}", e.VERSION).replace(/{(.*?)}/g, (a, i) => {
    var c;
    return (c = t.path) != null && c.hasOwnProperty(i) ? r(String(t.path[i])) : a;
  }), s = `${e.BASE}${n}`;
  return t.query ? `${s}${W(t.query)}` : s;
}, F = (e) => {
  if (e.formData) {
    const t = new FormData(), r = (n, s) => {
      f(s) || w(s) ? t.append(n, s) : t.append(n, JSON.stringify(s));
    };
    return Object.entries(e.formData).filter(([n, s]) => O(s)).forEach(([n, s]) => {
      Array.isArray(s) ? s.forEach((a) => r(n, a)) : r(n, s);
    }), t;
  }
}, A = async (e, t) => typeof t == "function" ? t(e) : t, L = async (e, t) => {
  const [r, n, s, a] = await Promise.all([
    A(t, e.TOKEN),
    A(t, e.USERNAME),
    A(t, e.PASSWORD),
    A(t, e.HEADERS)
  ]), i = Object.entries({
    Accept: "application/json",
    ...a,
    ...t.headers
  }).filter(([c, y]) => O(y)).reduce((c, [y, m]) => ({
    ...c,
    [y]: String(m)
  }), {});
  if (R(r) && (i.Authorization = `Bearer ${r}`), R(n) && R(s)) {
    const c = v(`${n}:${s}`);
    i.Authorization = `Basic ${c}`;
  }
  return t.body !== void 0 && (t.mediaType ? i["Content-Type"] = t.mediaType : w(t.body) ? i["Content-Type"] = t.body.type || "application/octet-stream" : f(t.body) ? i["Content-Type"] = "text/plain" : I(t.body) || (i["Content-Type"] = "application/json")), new Headers(i);
}, M = (e) => {
  var t;
  if (e.body !== void 0)
    return (t = e.mediaType) != null && t.includes("/json") ? JSON.stringify(e.body) : f(e.body) || w(e.body) || I(e.body) ? e.body : JSON.stringify(e.body);
}, V = async (e, t, r, n, s, a, i) => {
  const c = new AbortController(), y = {
    headers: a,
    body: n ?? s,
    method: t.method,
    signal: c.signal
  };
  return e.WITH_CREDENTIALS && (y.credentials = e.CREDENTIALS), i(() => c.abort()), await fetch(r, y);
}, J = (e, t) => {
  if (t) {
    const r = e.headers.get(t);
    if (f(r))
      return r;
  }
}, G = async (e) => {
  if (e.status !== 204)
    try {
      const t = e.headers.get("Content-Type");
      if (t)
        return ["application/json", "application/problem+json"].some((s) => t.toLowerCase().startsWith(s)) ? await e.json() : await e.text();
    } catch (t) {
      console.error(t);
    }
}, z = (e, t) => {
  const n = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...e.errors
  }[t.status];
  if (n)
    throw new q(e, t, n);
  if (!t.ok) {
    const s = t.status ?? "unknown", a = t.statusText ?? "unknown", i = (() => {
      try {
        return JSON.stringify(t.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new q(
      e,
      t,
      `Generic Error: status: ${s}; status text: ${a}; body: ${i}`
    );
  }
}, X = (e, t) => new _(async (r, n, s) => {
  try {
    const a = x(e, t), i = F(t), c = M(t), y = await L(e, t);
    if (!s.isCancelled) {
      const m = await V(e, t, a, c, i, y, s), P = await G(m), $ = J(m, t.responseHeader), N = {
        url: a,
        ok: m.ok,
        status: m.status,
        statusText: m.statusText,
        body: $ ?? P
      };
      z(t, N), r(N.body);
    }
  } catch (a) {
    n(a);
  }
});
class Q extends g {
  constructor(t) {
    super(t);
  }
  /**
   * Request method
   * @param options The request options from the service
   * @returns CancelablePromise<T>
   * @throws ApiError
   */
  request(t) {
    return X(this.config, t);
  }
}
class Y {
  constructor(t) {
    this.httpRequest = t;
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  getBlockfilterConfigurationByDocumentTypeKey({
    documentTypeKey: t
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/api/v1/blockfilter/configuration/{documentTypeKey}",
      path: {
        documentTypeKey: t
      },
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  postBlockfilterConfigurationByDocumentTypeKey({
    documentTypeKey: t,
    requestBody: r
  }) {
    return this.httpRequest.request({
      method: "POST",
      url: "/api/v1/blockfilter/configuration/{documentTypeKey}",
      path: {
        documentTypeKey: t
      },
      body: r,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @returns BlockCatalogueModel OK
   * @throws ApiError
   */
  postBlockfilterRemodel({
    requestBody: t
  }) {
    return this.httpRequest.request({
      method: "POST",
      url: "/api/v1/blockfilter/remodel",
      body: t,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        409: "Conflict",
        500: "Internal Server Error"
      }
    });
  }
  /**
   * @returns BlockFilterSettingsModel OK
   * @throws ApiError
   */
  getBlockfilterSettings() {
    return this.httpRequest.request({
      method: "GET",
      url: "/api/v1/blockfilter/settings",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
}
class Z {
  constructor(t, r = Q) {
    this.request = new r({
      BASE: (t == null ? void 0 : t.BASE) ?? "https://localhost:44338",
      VERSION: (t == null ? void 0 : t.VERSION) ?? "1.0.0",
      WITH_CREDENTIALS: (t == null ? void 0 : t.WITH_CREDENTIALS) ?? !1,
      CREDENTIALS: (t == null ? void 0 : t.CREDENTIALS) ?? "include",
      TOKEN: t == null ? void 0 : t.TOKEN,
      USERNAME: t == null ? void 0 : t.USERNAME,
      PASSWORD: t == null ? void 0 : t.PASSWORD,
      HEADERS: t == null ? void 0 : t.HEADERS,
      ENCODE_PATH: t == null ? void 0 : t.ENCODE_PATH
    }), this.v1 = new Y(this.request);
  }
}
const B = {
  BASE: "https://localhost:44338",
  VERSION: "1.0.0",
  WITH_CREDENTIALS: !1,
  CREDENTIALS: "include",
  TOKEN: void 0,
  USERNAME: void 0,
  PASSWORD: void 0,
  HEADERS: void 0,
  ENCODE_PATH: void 0
}, C = "Umb.Modal.BlockCatalogue", tt = [
  {
    type: "modal",
    // This alias is the key. We're overriding the core catalogue by reusing its alias.
    // If the alias ever changes upstream, update this to match.
    alias: C,
    name: "Block Catalogue Modal Extension",
    elementName: "umb-block-catalogue-modal-extend",
    js: () => import("./UmbBlockCatalogueModalElementExtension--JjcIUNW.js"),
    // Make sure we win registration ordering if both exist:
    weight: -1e4
  }
], et = {
  type: "workspaceView",
  alias: "Kraftvaerk.Blockfilter.WorkspaceView.SettingsTab",
  name: "BlockFilter Settings Tab",
  element: () => import("./BlockFilterSettingsTabView-DDUnGKMp.js"),
  weight: 100,
  meta: {
    label: "BlockFilter",
    pathname: "blockfilter",
    icon: "icon-filter"
  },
  conditions: [
    {
      alias: "Umb.Condition.WorkspaceAlias",
      match: "Umb.Workspace.DocumentType"
    }
  ]
}, nt = async (e, t) => {
  e.consumeContext(U, (r) => {
    if (!r) return;
    const n = r.getServerUrl() ?? "";
    B.BASE = n, B.TOKEN = async () => await r.getLatestToken() ?? "", (async () => {
      try {
        (await new Z({ TOKEN: B.TOKEN, BASE: n }).v1.getBlockfilterSettings()).enableSettingsTab === !0 && t.register(et);
      } catch {
      }
      H(t, 0);
    })();
  });
}, j = 30;
function H(e, t) {
  if (t >= j) {
    console.error(
      `BlockFilter: '${C}' was not found in the extension registry after ${j} attempts. The block catalogue override will not be applied.`
    );
    return;
  }
  setTimeout(() => {
    const r = e.getByAlias(C);
    r ? (e.unregister(r.alias), e.registerMany(tt)) : H(e, t + 1);
  }, 200);
}
export {
  Z as B,
  B as O,
  nt as o
};
//# sourceMappingURL=index-BJsmxxdK.js.map
