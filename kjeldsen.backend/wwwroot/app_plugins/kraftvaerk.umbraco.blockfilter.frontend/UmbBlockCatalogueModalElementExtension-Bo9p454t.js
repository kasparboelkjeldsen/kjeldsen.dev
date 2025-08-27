var W = (s) => {
  throw TypeError(s);
};
var z = (s, t, e) => t.has(s) || W("Cannot " + e);
var h = (s, t, e) => (z(s, t, "read from private field"), e ? e.call(s) : t.get(s)), S = (s, t, e) => t.has(s) ? W("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(s) : t.set(s, e), l = (s, t, e, r) => (z(s, t, "write to private field"), r ? r.call(s, e) : t.set(s, e), e);
import { UmbBlockCatalogueModalElement as et } from "@umbraco-cms/backoffice/block";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as st } from "@umbraco-cms/backoffice/document";
import { UMB_VARIANT_WORKSPACE_CONTEXT as rt } from "@umbraco-cms/backoffice/workspace";
import { O as x } from "./index-NbhkfHUE.js";
import { UMB_MODAL_CONTEXT as it } from "@umbraco-cms/backoffice/modal";
class nt {
  constructor(t) {
    this.config = t;
  }
}
class F extends Error {
  constructor(t, e, r) {
    super(r), this.name = "ApiError", this.url = e.url, this.status = e.status, this.statusText = e.statusText, this.body = e.body, this.request = t;
  }
}
class ot extends Error {
  constructor(t) {
    super(t), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var u, p, d, m, $, w, _;
class at {
  constructor(t) {
    S(this, u);
    S(this, p);
    S(this, d);
    S(this, m);
    S(this, $);
    S(this, w);
    S(this, _);
    l(this, u, !1), l(this, p, !1), l(this, d, !1), l(this, m, []), l(this, $, new Promise((e, r) => {
      l(this, w, e), l(this, _, r);
      const i = (a) => {
        h(this, u) || h(this, p) || h(this, d) || (l(this, u, !0), h(this, w) && h(this, w).call(this, a));
      }, n = (a) => {
        h(this, u) || h(this, p) || h(this, d) || (l(this, p, !0), h(this, _) && h(this, _).call(this, a));
      }, o = (a) => {
        h(this, u) || h(this, p) || h(this, d) || h(this, m).push(a);
      };
      return Object.defineProperty(o, "isResolved", {
        get: () => h(this, u)
      }), Object.defineProperty(o, "isRejected", {
        get: () => h(this, p)
      }), Object.defineProperty(o, "isCancelled", {
        get: () => h(this, d)
      }), t(i, n, o);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(t, e) {
    return h(this, $).then(t, e);
  }
  catch(t) {
    return h(this, $).catch(t);
  }
  finally(t) {
    return h(this, $).finally(t);
  }
  cancel() {
    if (!(h(this, u) || h(this, p) || h(this, d))) {
      if (l(this, d, !0), h(this, m).length)
        try {
          for (const t of h(this, m))
            t();
        } catch (t) {
          console.warn("Cancellation threw an error", t);
          return;
        }
      h(this, m).length = 0, h(this, _) && h(this, _).call(this, new ot("Request aborted"));
    }
  }
  get isCancelled() {
    return h(this, d);
  }
}
u = new WeakMap(), p = new WeakMap(), d = new WeakMap(), m = new WeakMap(), $ = new WeakMap(), w = new WeakMap(), _ = new WeakMap();
const H = (s) => s != null, v = (s) => typeof s == "string", N = (s) => v(s) && s !== "", L = (s) => typeof s == "object" && typeof s.type == "string" && typeof s.stream == "function" && typeof s.arrayBuffer == "function" && typeof s.constructor == "function" && typeof s.constructor.name == "string" && /^(Blob|File)$/.test(s.constructor.name) && /^(Blob|File)$/.test(s[Symbol.toStringTag]), X = (s) => s instanceof FormData, ht = (s) => {
  try {
    return btoa(s);
  } catch {
    return Buffer.from(s).toString("base64");
  }
}, ct = (s) => {
  const t = [], e = (i, n) => {
    t.push(`${encodeURIComponent(i)}=${encodeURIComponent(String(n))}`);
  }, r = (i, n) => {
    H(n) && (Array.isArray(n) ? n.forEach((o) => {
      r(i, o);
    }) : typeof n == "object" ? Object.entries(n).forEach(([o, a]) => {
      r(`${i}[${o}]`, a);
    }) : e(i, n));
  };
  return Object.entries(s).forEach(([i, n]) => {
    r(i, n);
  }), t.length > 0 ? `?${t.join("&")}` : "";
}, lt = (s, t) => {
  const e = s.ENCODE_PATH || encodeURI, r = t.url.replace("{api-version}", s.VERSION).replace(/{(.*?)}/g, (n, o) => {
    var a;
    return (a = t.path) != null && a.hasOwnProperty(o) ? e(String(t.path[o])) : n;
  }), i = `${s.BASE}${r}`;
  return t.query ? `${i}${ct(t.query)}` : i;
}, dt = (s) => {
  if (s.formData) {
    const t = new FormData(), e = (r, i) => {
      v(i) || L(i) ? t.append(r, i) : t.append(r, JSON.stringify(i));
    };
    return Object.entries(s.formData).filter(([r, i]) => H(i)).forEach(([r, i]) => {
      Array.isArray(i) ? i.forEach((n) => e(r, n)) : e(r, i);
    }), t;
  }
}, T = async (s, t) => typeof t == "function" ? t(s) : t, ut = async (s, t) => {
  const [e, r, i, n] = await Promise.all([
    T(t, s.TOKEN),
    T(t, s.USERNAME),
    T(t, s.PASSWORD),
    T(t, s.HEADERS)
  ]), o = Object.entries({
    Accept: "application/json",
    ...n,
    ...t.headers
  }).filter(([a, c]) => H(c)).reduce((a, [c, f]) => ({
    ...a,
    [c]: String(f)
  }), {});
  if (N(e) && (o.Authorization = `Bearer ${e}`), N(r) && N(i)) {
    const a = ht(`${r}:${i}`);
    o.Authorization = `Basic ${a}`;
  }
  return t.body !== void 0 && (t.mediaType ? o["Content-Type"] = t.mediaType : L(t.body) ? o["Content-Type"] = t.body.type || "application/octet-stream" : v(t.body) ? o["Content-Type"] = "text/plain" : X(t.body) || (o["Content-Type"] = "application/json")), new Headers(o);
}, pt = (s) => {
  var t;
  if (s.body !== void 0)
    return (t = s.mediaType) != null && t.includes("/json") ? JSON.stringify(s.body) : v(s.body) || L(s.body) || X(s.body) ? s.body : JSON.stringify(s.body);
}, yt = async (s, t, e, r, i, n, o) => {
  const a = new AbortController(), c = {
    headers: n,
    body: r ?? i,
    method: t.method,
    signal: a.signal
  };
  return s.WITH_CREDENTIALS && (c.credentials = s.CREDENTIALS), o(() => a.abort()), await fetch(e, c);
}, ft = (s, t) => {
  if (t) {
    const e = s.headers.get(t);
    if (v(e))
      return e;
  }
}, Et = async (s) => {
  if (s.status !== 204)
    try {
      const t = s.headers.get("Content-Type");
      if (t)
        return ["application/json", "application/problem+json"].some((i) => t.toLowerCase().startsWith(i)) ? await s.json() : await s.text();
    } catch (t) {
      console.error(t);
    }
}, St = (s, t) => {
  const r = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...s.errors
  }[t.status];
  if (r)
    throw new F(s, t, r);
  if (!t.ok) {
    const i = t.status ?? "unknown", n = t.statusText ?? "unknown", o = (() => {
      try {
        return JSON.stringify(t.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new F(
      s,
      t,
      `Generic Error: status: ${i}; status text: ${n}; body: ${o}`
    );
  }
}, mt = (s, t) => new at(async (e, r, i) => {
  try {
    const n = lt(s, t), o = dt(t), a = pt(t), c = await ut(s, t);
    if (!i.isCancelled) {
      const f = await yt(s, t, n, a, o, c, i), C = await Et(f), y = ft(f, t.responseHeader), E = {
        url: n,
        ok: f.ok,
        status: f.status,
        statusText: f.statusText,
        body: y ?? C
      };
      St(t, E), e(E.body);
    }
  } catch (n) {
    r(n);
  }
});
class _t extends nt {
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
    return mt(this.config, t);
  }
}
class bt {
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
class $t {
  constructor(t, e = _t) {
    this.request = new e({
      BASE: (t == null ? void 0 : t.BASE) ?? "",
      VERSION: (t == null ? void 0 : t.VERSION) ?? "1.0",
      WITH_CREDENTIALS: (t == null ? void 0 : t.WITH_CREDENTIALS) ?? !1,
      CREDENTIALS: (t == null ? void 0 : t.CREDENTIALS) ?? "include",
      TOKEN: t == null ? void 0 : t.TOKEN,
      USERNAME: t == null ? void 0 : t.USERNAME,
      PASSWORD: t == null ? void 0 : t.PASSWORD,
      HEADERS: t == null ? void 0 : t.HEADERS,
      ENCODE_PATH: t == null ? void 0 : t.ENCODE_PATH
    }), this.v1 = new bt(this.request);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wt = (s) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(s, t);
  }) : customElements.define(s, t);
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis, k = P.ShadowRoot && (P.ShadyCSS === void 0 || P.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Q = Symbol(), K = /* @__PURE__ */ new WeakMap();
let At = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== Q) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (k && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = K.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && K.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ot = (s) => new At(typeof s == "string" ? s : s + "", void 0, Q), vt = (s, t) => {
  if (k) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const r = document.createElement("style"), i = P.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = e.cssText, s.appendChild(r);
  }
}, V = k ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules) e += r.cssText;
  return Ot(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ct, defineProperty: Tt, getOwnPropertyDescriptor: Pt, getOwnPropertyNames: Rt, getOwnPropertySymbols: Ut, getPrototypeOf: gt } = Object, b = globalThis, J = b.trustedTypes, Nt = J ? J.emptyScript : "", D = b.reactiveElementPolyfillSupport, O = (s, t) => s, q = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Nt : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, Y = (s, t) => !Ct(s, t), G = { attribute: !0, type: String, converter: q, reflect: !1, useDefault: !1, hasChanged: Y };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), b.litPropertyMetadata ?? (b.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class A extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = G) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(t, r, e);
      i !== void 0 && Tt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    const { get: i, set: n } = Pt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: i, set(o) {
      const a = i == null ? void 0 : i.call(this);
      n == null || n.call(this, o), this.requestUpdate(t, a, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? G;
  }
  static _$Ei() {
    if (this.hasOwnProperty(O("elementProperties"))) return;
    const t = gt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(O("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(O("properties"))) {
      const e = this.properties, r = [...Rt(e), ...Ut(e)];
      for (const i of r) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [r, i] of e) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, r] of this.elementProperties) {
      const i = this._$Eu(e, r);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r) e.unshift(V(i));
    } else t !== void 0 && e.push(V(t));
    return e;
  }
  static _$Eu(t, e) {
    const r = e.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const r of e.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return vt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var r;
      return (r = e.hostConnected) == null ? void 0 : r.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var r;
      return (r = e.hostDisconnected) == null ? void 0 : r.call(e);
    });
  }
  attributeChangedCallback(t, e, r) {
    this._$AK(t, r);
  }
  _$ET(t, e) {
    var n;
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const o = (((n = r.converter) == null ? void 0 : n.toAttribute) !== void 0 ? r.converter : q).toAttribute(e, r.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var n, o;
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const a = r.getPropertyOptions(i), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : q;
      this._$Em = i, this[i] = c.fromAttribute(e, a.type) ?? ((o = this._$Ej) == null ? void 0 : o.get(i)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t, e, r) {
    var i;
    if (t !== void 0) {
      const n = this.constructor, o = this[t];
      if (r ?? (r = n.getPropertyOptions(t)), !((r.hasChanged ?? Y)(o, e) || r.useDefault && r.reflect && o === ((i = this._$Ej) == null ? void 0 : i.get(t)) && !this.hasAttribute(n._$Eu(t, r)))) return;
      this.C(t, e, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: r, reflect: i, wrapped: n }, o) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
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
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [n, o] of i) {
        const { wrapped: a } = o, c = this[n];
        a !== !0 || this._$AL.has(n) || c === void 0 || this.C(n, void 0, o, c);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (r = this._$EO) == null || r.forEach((i) => {
        var n;
        return (n = i.hostUpdate) == null ? void 0 : n.call(i);
      }), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((r) => {
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
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
}
A.elementStyles = [], A.shadowRootOptions = { mode: "open" }, A[O("elementProperties")] = /* @__PURE__ */ new Map(), A[O("finalized")] = /* @__PURE__ */ new Map(), D == null || D({ ReactiveElement: A }), (b.reactiveElementVersions ?? (b.reactiveElementVersions = [])).push("2.1.0");
var Dt = Object.defineProperty, Bt = Object.getOwnPropertyDescriptor, Z = (s) => {
  throw TypeError(s);
}, Mt = (s, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? Bt(t, e) : t, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (i = (r ? o(t, e, i) : o(i)) || i);
  return r && i && Dt(t, e, i), i;
}, tt = (s, t, e) => t.has(s) || Z("Cannot " + e), B = (s, t, e) => (tt(s, t, "read from private field"), t.get(s)), M = (s, t, e) => t.has(s) ? Z("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(s) : t.set(s, e), j = (s, t, e, r) => (tt(s, t, "write to private field"), t.set(s, e), e), R, U, g;
let I = class extends et {
  constructor() {
    var s;
    super(), M(this, R, ""), M(this, U, ""), M(this, g, ""), this.observe((s = this._manager) == null ? void 0 : s.propertyAlias, (t) => {
      j(this, R, t ?? "");
    }), this.consumeContext(rt, (t) => {
      j(this, U, (t == null ? void 0 : t.getUnique()) ?? "");
    }), this.consumeContext(st, (t) => {
      this.observe(t == null ? void 0 : t.contentTypeUnique, (e) => {
        j(this, g, e ?? "");
      });
    }), this.consumeContext(it, (t) => {
      t != null && t.data && this.handleBlocks(t.data);
    });
  }
  async handleBlocks(s) {
    var n;
    const t = new $t({
      TOKEN: x.TOKEN,
      BASE: x.BASE
    }), e = {
      ...s,
      pageId: B(this, U),
      editingAlias: B(this, R),
      pageTypeId: B(this, g)
    }, r = await t.v1.postApiV1BlockfilterRemodel({
      requestBody: e
    }), i = (n = this.data) == null ? void 0 : n.clipboardFilter;
    this.data = r, this.data.clipboardFilter = async (o) => {
      var C;
      const a = (C = this.data) == null ? void 0 : C.blocks.map((y) => y.contentElementTypeKey.toLowerCase());
      return o.values.flatMap((y) => {
        var E;
        return ((E = y.value) == null ? void 0 : E.contentData) || [];
      }).map((y) => {
        var E;
        return (E = y.contentTypeKey) == null ? void 0 : E.toLowerCase();
      }).filter(Boolean).every((y) => a == null ? void 0 : a.includes(y)) ? typeof i == "function" ? await i(o) : !0 : !1;
    }, this.connectedCallback();
  }
};
R = /* @__PURE__ */ new WeakMap();
U = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
I = Mt([
  wt("umb-block-catalogue-modal-extend")
], I);
const zt = I;
export {
  I as UmbBlockCatalogueModalElementExtension,
  zt as default
};
//# sourceMappingURL=UmbBlockCatalogueModalElementExtension-Bo9p454t.js.map
