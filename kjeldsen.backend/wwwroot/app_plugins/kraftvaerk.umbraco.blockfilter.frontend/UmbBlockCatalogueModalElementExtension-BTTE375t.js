var X = (e) => {
  throw TypeError(e);
};
var G = (e, t, s) => t.has(e) || X("Cannot " + s);
var h = (e, t, s) => (G(e, t, "read from private field"), s ? s.call(e) : t.get(e)), S = (e, t, s) => t.has(e) ? X("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), p = (e, t, s, r) => (G(e, t, "write to private field"), r ? r.call(e, s) : t.set(e, s), s);
import { UmbBlockCatalogueModalElement as lt, UMB_BLOCK_WORKSPACE_CONTEXT as dt } from "@umbraco-cms/backoffice/block";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as pt } from "@umbraco-cms/backoffice/document";
import { UMB_VARIANT_WORKSPACE_CONTEXT as ut } from "@umbraco-cms/backoffice/workspace";
import { UMB_MODAL_CONTEXT as yt } from "@umbraco-cms/backoffice/modal";
import { O as Q } from "./index-BGiDWS6T.js";
class ft {
  constructor(t) {
    this.config = t;
  }
}
class Y extends Error {
  constructor(t, s, r) {
    super(r), this.name = "ApiError", this.url = s.url, this.status = s.status, this.statusText = s.statusText, this.body = s.body, this.request = t;
  }
}
class Et extends Error {
  constructor(t) {
    super(t), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var E, m, u, w, v, R, $;
class mt {
  constructor(t) {
    S(this, E);
    S(this, m);
    S(this, u);
    S(this, w);
    S(this, v);
    S(this, R);
    S(this, $);
    p(this, E, !1), p(this, m, !1), p(this, u, !1), p(this, w, []), p(this, v, new Promise((s, r) => {
      p(this, R, s), p(this, $, r);
      const i = (o) => {
        h(this, E) || h(this, m) || h(this, u) || (p(this, E, !0), h(this, R) && h(this, R).call(this, o));
      }, a = (o) => {
        h(this, E) || h(this, m) || h(this, u) || (p(this, m, !0), h(this, $) && h(this, $).call(this, o));
      }, n = (o) => {
        h(this, E) || h(this, m) || h(this, u) || h(this, w).push(o);
      };
      return Object.defineProperty(n, "isResolved", {
        get: () => h(this, E)
      }), Object.defineProperty(n, "isRejected", {
        get: () => h(this, m)
      }), Object.defineProperty(n, "isCancelled", {
        get: () => h(this, u)
      }), t(i, a, n);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(t, s) {
    return h(this, v).then(t, s);
  }
  catch(t) {
    return h(this, v).catch(t);
  }
  finally(t) {
    return h(this, v).finally(t);
  }
  cancel() {
    if (!(h(this, E) || h(this, m) || h(this, u))) {
      if (p(this, u, !0), h(this, w).length)
        try {
          for (const t of h(this, w))
            t();
        } catch (t) {
          console.warn("Cancellation threw an error", t);
          return;
        }
      h(this, w).length = 0, h(this, $) && h(this, $).call(this, new Et("Request aborted"));
    }
  }
  get isCancelled() {
    return h(this, u);
  }
}
E = new WeakMap(), m = new WeakMap(), u = new WeakMap(), w = new WeakMap(), v = new WeakMap(), R = new WeakMap(), $ = new WeakMap();
const z = (e) => e != null, D = (e) => typeof e == "string", L = (e) => D(e) && e !== "", F = (e) => typeof e == "object" && typeof e.type == "string" && typeof e.stream == "function" && typeof e.arrayBuffer == "function" && typeof e.constructor == "function" && typeof e.constructor.name == "string" && /^(Blob|File)$/.test(e.constructor.name) && /^(Blob|File)$/.test(e[Symbol.toStringTag]), rt = (e) => e instanceof FormData, _t = (e) => {
  try {
    return btoa(e);
  } catch {
    return Buffer.from(e).toString("base64");
  }
}, St = (e) => {
  const t = [], s = (i, a) => {
    t.push(`${encodeURIComponent(i)}=${encodeURIComponent(String(a))}`);
  }, r = (i, a) => {
    z(a) && (Array.isArray(a) ? a.forEach((n) => {
      r(i, n);
    }) : typeof a == "object" ? Object.entries(a).forEach(([n, o]) => {
      r(`${i}[${n}]`, o);
    }) : s(i, a));
  };
  return Object.entries(e).forEach(([i, a]) => {
    r(i, a);
  }), t.length > 0 ? `?${t.join("&")}` : "";
}, bt = (e, t) => {
  const s = e.ENCODE_PATH || encodeURI, r = t.url.replace("{api-version}", e.VERSION).replace(/{(.*?)}/g, (a, n) => {
    var o;
    return (o = t.path) != null && o.hasOwnProperty(n) ? s(String(t.path[n])) : a;
  }), i = `${e.BASE}${r}`;
  return t.query ? `${i}${St(t.query)}` : i;
}, wt = (e) => {
  if (e.formData) {
    const t = new FormData(), s = (r, i) => {
      D(i) || F(i) ? t.append(r, i) : t.append(r, JSON.stringify(i));
    };
    return Object.entries(e.formData).filter(([r, i]) => z(i)).forEach(([r, i]) => {
      Array.isArray(i) ? i.forEach((a) => s(r, a)) : s(r, i);
    }), t;
  }
}, j = async (e, t) => typeof t == "function" ? t(e) : t, $t = async (e, t) => {
  const [s, r, i, a] = await Promise.all([
    j(t, e.TOKEN),
    j(t, e.USERNAME),
    j(t, e.PASSWORD),
    j(t, e.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...a,
    ...t.headers
  }).filter(([o, c]) => z(c)).reduce((o, [c, l]) => ({
    ...o,
    [c]: String(l)
  }), {});
  if (L(s) && (n.Authorization = `Bearer ${s}`), L(r) && L(i)) {
    const o = _t(`${r}:${i}`);
    n.Authorization = `Basic ${o}`;
  }
  return t.body !== void 0 && (t.mediaType ? n["Content-Type"] = t.mediaType : F(t.body) ? n["Content-Type"] = t.body.type || "application/octet-stream" : D(t.body) ? n["Content-Type"] = "text/plain" : rt(t.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, At = (e) => {
  var t;
  if (e.body !== void 0)
    return (t = e.mediaType) != null && t.includes("/json") ? JSON.stringify(e.body) : D(e.body) || F(e.body) || rt(e.body) ? e.body : JSON.stringify(e.body);
}, Ct = async (e, t, s, r, i, a, n) => {
  const o = new AbortController(), c = {
    headers: a,
    body: r ?? i,
    method: t.method,
    signal: o.signal
  };
  return e.WITH_CREDENTIALS && (c.credentials = e.CREDENTIALS), n(() => o.abort()), await fetch(s, c);
}, Ot = (e, t) => {
  if (t) {
    const s = e.headers.get(t);
    if (D(s))
      return s;
  }
}, Tt = async (e) => {
  if (e.status !== 204)
    try {
      const t = e.headers.get("Content-Type");
      if (t)
        return ["application/json", "application/problem+json"].some((i) => t.toLowerCase().startsWith(i)) ? await e.json() : await e.text();
    } catch (t) {
      console.error(t);
    }
}, vt = (e, t) => {
  const r = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...e.errors
  }[t.status];
  if (r)
    throw new Y(e, t, r);
  if (!t.ok) {
    const i = t.status ?? "unknown", a = t.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(t.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new Y(
      e,
      t,
      `Generic Error: status: ${i}; status text: ${a}; body: ${n}`
    );
  }
}, Pt = (e, t) => new mt(async (s, r, i) => {
  try {
    const a = bt(e, t), n = wt(t), o = At(t), c = await $t(e, t);
    if (!i.isCancelled) {
      const l = await Ct(e, t, a, o, n, c, i), f = await Tt(l), ct = Ot(l, t.responseHeader), J = {
        url: a,
        ok: l.ok,
        status: l.status,
        statusText: l.statusText,
        body: ct ?? f
      };
      vt(t, J), s(J.body);
    }
  } catch (a) {
    r(a);
  }
});
class Rt extends ft {
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
    return Pt(this.config, t);
  }
}
class gt {
  constructor(t) {
    this.httpRequest = t;
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  postApiV1BlockfilterRemodel({
    requestBody: t
  }) {
    return this.httpRequest.request({
      method: "POST",
      url: "/api/v1/blockfilter/remodel",
      body: t,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
}
class Ut {
  constructor(t, s = Rt) {
    this.request = new s({
      BASE: (t == null ? void 0 : t.BASE) ?? "",
      VERSION: (t == null ? void 0 : t.VERSION) ?? "1.0",
      WITH_CREDENTIALS: (t == null ? void 0 : t.WITH_CREDENTIALS) ?? !1,
      CREDENTIALS: (t == null ? void 0 : t.CREDENTIALS) ?? "include",
      TOKEN: t == null ? void 0 : t.TOKEN,
      USERNAME: t == null ? void 0 : t.USERNAME,
      PASSWORD: t == null ? void 0 : t.PASSWORD,
      HEADERS: t == null ? void 0 : t.HEADERS,
      ENCODE_PATH: t == null ? void 0 : t.ENCODE_PATH
    }), this.v1 = new gt(this.request);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Mt = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I = globalThis, W = I.ShadowRoot && (I.ShadyCSS === void 0 || I.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, it = Symbol(), Z = /* @__PURE__ */ new WeakMap();
let Nt = class {
  constructor(t, s, r) {
    if (this._$cssResult$ = !0, r !== it) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (W && t === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (t = Z.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && Z.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Bt = (e) => new Nt(typeof e == "string" ? e : e + "", void 0, it), Dt = (e, t) => {
  if (W) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const r = document.createElement("style"), i = I.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, e.appendChild(r);
  }
}, tt = W ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const r of t.cssRules) s += r.cssText;
  return Bt(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: jt, defineProperty: It, getOwnPropertyDescriptor: qt, getOwnPropertyNames: kt, getOwnPropertySymbols: Ht, getPrototypeOf: Lt } = Object, A = globalThis, et = A.trustedTypes, xt = et ? et.emptyScript : "", x = A.reactiveElementPolyfillSupport, U = (e, t) => e, K = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? xt : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, at = (e, t) => !jt(e, t), st = { attribute: !0, type: String, converter: K, reflect: !1, useDefault: !1, hasChanged: at };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), A.litPropertyMetadata ?? (A.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class g extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = st) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(t, r, s);
      i !== void 0 && It(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, s, r) {
    const { get: i, set: a } = qt(this.prototype, t) ?? { get() {
      return this[s];
    }, set(n) {
      this[s] = n;
    } };
    return { get: i, set(n) {
      const o = i == null ? void 0 : i.call(this);
      a == null || a.call(this, n), this.requestUpdate(t, o, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? st;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const t = Lt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const s = this.properties, r = [...kt(s), ...Ht(s)];
      for (const i of r) this.createProperty(i, s[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [r, i] of s) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, r] of this.elementProperties) {
      const i = this._$Eu(s, r);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r) s.unshift(tt(i));
    } else t !== void 0 && s.push(tt(t));
    return s;
  }
  static _$Eu(t, s) {
    const r = s.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((s) => this.enableUpdating = s), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((s) => s(this));
  }
  addController(t) {
    var s;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((s = t.hostConnected) == null || s.call(t));
  }
  removeController(t) {
    var s;
    (s = this._$EO) == null || s.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const r of s.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Dt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((s) => {
      var r;
      return (r = s.hostConnected) == null ? void 0 : r.call(s);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((s) => {
      var r;
      return (r = s.hostDisconnected) == null ? void 0 : r.call(s);
    });
  }
  attributeChangedCallback(t, s, r) {
    this._$AK(t, r);
  }
  _$ET(t, s) {
    var a;
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const n = (((a = r.converter) == null ? void 0 : a.toAttribute) !== void 0 ? r.converter : K).toAttribute(s, r.type);
      this._$Em = t, n == null ? this.removeAttribute(i) : this.setAttribute(i, n), this._$Em = null;
    }
  }
  _$AK(t, s) {
    var a, n;
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = r.getPropertyOptions(i), c = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((a = o.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? o.converter : K;
      this._$Em = i, this[i] = c.fromAttribute(s, o.type) ?? ((n = this._$Ej) == null ? void 0 : n.get(i)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t, s, r) {
    var i;
    if (t !== void 0) {
      const a = this.constructor, n = this[t];
      if (r ?? (r = a.getPropertyOptions(t)), !((r.hasChanged ?? at)(n, s) || r.useDefault && r.reflect && n === ((i = this._$Ej) == null ? void 0 : i.get(t)) && !this.hasAttribute(a._$Eu(t, r)))) return;
      this.C(t, s, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: r, reflect: i, wrapped: a }, n) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, n ?? s ?? this[t]), a !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (s = void 0), this._$AL.set(t, s)), i === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var r;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [a, n] of this._$Ep) this[a] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [a, n] of i) {
        const { wrapped: o } = n, c = this[a];
        o !== !0 || this._$AL.has(a) || c === void 0 || this.C(a, void 0, n, c);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), (r = this._$EO) == null || r.forEach((i) => {
        var a;
        return (a = i.hostUpdate) == null ? void 0 : a.call(i);
      }), this.update(s)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var s;
    (s = this._$EO) == null || s.forEach((r) => {
      var i;
      return (i = r.hostUpdated) == null ? void 0 : i.call(r);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((s) => this._$ET(s, this[s]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
}
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[U("elementProperties")] = /* @__PURE__ */ new Map(), g[U("finalized")] = /* @__PURE__ */ new Map(), x == null || x({ ReactiveElement: g }), (A.reactiveElementVersions ?? (A.reactiveElementVersions = [])).push("2.1.0");
var Kt = Object.defineProperty, zt = Object.getOwnPropertyDescriptor, nt = (e) => {
  throw TypeError(e);
}, Ft = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? zt(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (i = (r ? n(t, s, i) : n(i)) || i);
  return r && i && Kt(t, s, i), i;
}, V = (e, t, s) => t.has(e) || nt("Cannot " + s), d = (e, t, s) => (V(e, t, "read from private field"), t.get(e)), b = (e, t, s) => t.has(e) ? nt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), O = (e, t, s, r) => (V(e, t, "write to private field"), t.set(e, s), s), C = (e, t, s) => (V(e, t, "access private method"), s), M, B, k, N, T, H, q, _, ot, ht, P;
let y = class extends lt {
  constructor() {
    super(), b(this, _), b(this, M, ""), b(this, B, null), b(this, k, !1), b(this, N, null), b(this, T), b(this, H), b(this, q), O(this, H, new Promise((e) => {
      O(this, q, e);
    })), this.consumeContext(dt, () => {
      C(this, _, P).call(this);
    }), this.consumeContext(ut, (e) => {
      y.pageId = (e == null ? void 0 : e.getUnique()) ?? "", C(this, _, P).call(this);
    }).passContextAliasMatches(), this.consumeContext(pt, (e) => {
      this.observe(e == null ? void 0 : e.contentTypeUnique, (t) => {
        y.pageTypeId = t ?? "", C(this, _, P).call(this);
      });
    }).passContextAliasMatches(), this.consumeContext(yt, (e) => {
      O(this, B, (e == null ? void 0 : e.data) ?? null), C(this, _, P).call(this);
    });
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), C(this, _, ot).call(this), (e = this._manager) != null && e.propertyAlias && this.observe(this._manager.propertyAlias, (t) => {
      O(this, M, t ?? ""), C(this, _, P).call(this);
    });
  }
  /**
   * Calls the BlockFilter API and rebuilds the block catalogue with filtered blocks.
   */
  async handleBlocks(e) {
    var a;
    const t = {
      ...e,
      pageId: y.pageId,
      editingAlias: d(this, M),
      pageTypeId: y.pageTypeId
    }, r = await new Ut({
      TOKEN: Q.TOKEN,
      BASE: Q.BASE
    }).v1.postApiV1BlockfilterRemodel({
      requestBody: t
    });
    this.data = { ...r }, O(this, N, ((a = this.data) == null ? void 0 : a.blocks.map((n) => n.contentElementTypeKey.toLowerCase())) ?? []), d(this, q).call(this);
    const i = d(this, T);
    this.data.clipboardFilter = async (n) => n.values.flatMap((l) => {
      var f;
      return ((f = l.value) == null ? void 0 : f.contentData) || [];
    }).map((l) => {
      var f;
      return (f = l.contentTypeKey) == null ? void 0 : f.toLowerCase();
    }).filter(Boolean).every((l) => {
      var f;
      return (f = d(this, N)) == null ? void 0 : f.includes(l);
    }) ? typeof i == "function" ? await i(n) : !0 : !1, this.connectedCallback();
  }
};
M = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
N = /* @__PURE__ */ new WeakMap();
T = /* @__PURE__ */ new WeakMap();
H = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakSet();
ot = function() {
  !this.data || d(this, T) !== void 0 || (O(this, T, this.data.clipboardFilter), this.data = { ...this.data }, this.data.clipboardFilter = async (e) => (await d(this, H), e.values.flatMap((r) => {
    var i;
    return ((i = r.value) == null ? void 0 : i.contentData) || [];
  }).map((r) => {
    var i;
    return (i = r.contentTypeKey) == null ? void 0 : i.toLowerCase();
  }).filter(Boolean).every((r) => {
    var i;
    return (i = d(this, N)) == null ? void 0 : i.includes(r);
  }) ? typeof d(this, T) == "function" ? await d(this, T).call(this, e) : !0 : !1));
};
ht = function() {
  return !!(d(this, B) && d(this, M) && y.pageId && y.pageTypeId);
};
P = function() {
  d(this, k) || !C(this, _, ht).call(this) || (O(this, k, !0), this.handleBlocks(d(this, B)));
};
y.pageId = "";
y.pageTypeId = "";
y = Ft([
  Mt("umb-block-catalogue-modal-extend")
], y);
const Zt = y;
export {
  y as UmbBlockCatalogueModalElementExtension,
  Zt as default
};
//# sourceMappingURL=UmbBlockCatalogueModalElementExtension-BTTE375t.js.map
