import { UmbBlockCatalogueModalElement as X, UMB_BLOCK_WORKSPACE_CONTEXT as x } from "@umbraco-cms/backoffice/block";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as H } from "@umbraco-cms/backoffice/document";
import { UMB_VARIANT_WORKSPACE_CONTEXT as J } from "@umbraco-cms/backoffice/workspace";
import { UMB_MODAL_CONTEXT as V } from "@umbraco-cms/backoffice/modal";
import { B as G, O as I } from "./index-BJsmxxdK.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Q = (s) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(s, t);
  }) : customElements.define(s, t);
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A = globalThis, B = A.ShadowRoot && (A.ShadyCSS === void 0 || A.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, z = Symbol(), K = /* @__PURE__ */ new WeakMap();
let Y = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== z) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (B && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = K.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && K.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Z = (s) => new Y(typeof s == "string" ? s : s + "", void 0, z), tt = (s, t) => {
  if (B) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), r = A.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, N = B ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return Z(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: et, defineProperty: st, getOwnPropertyDescriptor: it, getOwnPropertyNames: rt, getOwnPropertySymbols: at, getPrototypeOf: ot } = Object, _ = globalThis, D = _.trustedTypes, nt = D ? D.emptyScript : "", T = _.reactiveElementPolyfillSupport, w = (s, t) => s, R = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? nt : null;
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
} }, q = (s, t) => !et(s, t), L = { attribute: !0, type: String, converter: R, reflect: !1, useDefault: !1, hasChanged: q };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), _.litPropertyMetadata ?? (_.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class g extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = L) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && st(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: a } = it(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const n = r == null ? void 0 : r.call(this);
      a == null || a.call(this, o), this.requestUpdate(t, n, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? L;
  }
  static _$Ei() {
    if (this.hasOwnProperty(w("elementProperties"))) return;
    const t = ot(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(w("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(w("properties"))) {
      const e = this.properties, i = [...rt(e), ...at(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, r] of e) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const r = this._$Eu(e, i);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(N(r));
    } else t !== void 0 && e.push(N(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return tt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) == null ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) == null ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    var a;
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (((a = i.converter) == null ? void 0 : a.toAttribute) !== void 0 ? i.converter : R).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var a, o;
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), m = typeof n.converter == "function" ? { fromAttribute: n.converter } : ((a = n.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? n.converter : R;
      this._$Em = r;
      const M = m.fromAttribute(e, n.type);
      this[r] = M ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? M, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, r = !1, a) {
    var o;
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (a = this[t]), i ?? (i = n.getPropertyOptions(t)), !((i.hasChanged ?? q)(a, e) || i.useDefault && i.reflect && a === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: r, wrapped: a }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), a !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [a, o] of this._$Ep) this[a] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [a, o] of r) {
        const { wrapped: n } = o, m = this[a];
        n !== !0 || this._$AL.has(a) || m === void 0 || this.C(a, void 0, o, m);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (i = this._$EO) == null || i.forEach((r) => {
        var a;
        return (a = r.hostUpdate) == null ? void 0 : a.call(r);
      }), this.update(e)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((i) => {
      var r;
      return (r = i.hostUpdated) == null ? void 0 : r.call(i);
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
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[w("elementProperties")] = /* @__PURE__ */ new Map(), g[w("finalized")] = /* @__PURE__ */ new Map(), T == null || T({ ReactiveElement: g }), (_.reactiveElementVersions ?? (_.reactiveElementVersions = [])).push("2.1.2");
var ht = Object.getOwnPropertyDescriptor, j = (s) => {
  throw TypeError(s);
}, lt = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? ht(t, e) : t, a = s.length - 1, o; a >= 0; a--)
    (o = s[a]) && (r = o(r) || r);
  return r;
}, k = (s, t, e) => t.has(s) || j("Cannot " + e), h = (s, t, e) => (k(s, t, "read from private field"), t.get(s)), d = (s, t, e) => t.has(s) ? j("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(s) : t.set(s, e), f = (s, t, e, i) => (k(s, t, "write to private field"), t.set(s, e), e), u = (s, t, e) => (k(s, t, "access private method"), e), v, S, P, C, b, E, U, O, c, F, W, y;
let l = class extends X {
  constructor() {
    super(), d(this, c), d(this, v, ""), d(this, S, ""), d(this, P, null), d(this, C, !1), d(this, b, null), d(this, E), d(this, U), d(this, O), f(this, U, new Promise((s) => {
      f(this, O, s);
    })), this.consumeContext(x, (s) => {
      this.observe(s == null ? void 0 : s.content.contentTypeId, (t) => {
        f(this, S, t ?? ""), u(this, c, y).call(this);
      }), u(this, c, y).call(this);
    }), this.consumeContext(J, (s) => {
      l.pageId = (s == null ? void 0 : s.getUnique()) ?? "", u(this, c, y).call(this);
    }).passContextAliasMatches(), this.consumeContext(H, (s) => {
      this.observe(s == null ? void 0 : s.contentTypeUnique, (t) => {
        l.pageTypeId = t ?? "", u(this, c, y).call(this);
      });
    }).passContextAliasMatches(), this.consumeContext(V, (s) => {
      f(this, P, (s == null ? void 0 : s.data) ?? null), u(this, c, y).call(this);
    });
  }
  connectedCallback() {
    var s;
    super.connectedCallback(), u(this, c, F).call(this), (s = this._manager) != null && s.propertyAlias && this.observe(this._manager.propertyAlias, (t) => {
      f(this, v, t ?? ""), u(this, c, y).call(this);
    });
  }
  /**
   * Calls the BlockFilter API and rebuilds the block catalogue with filtered blocks.
   */
  async handleBlocks(s) {
    var o;
    const t = h(this, S) || l.pageTypeId, e = {
      ...s,
      pageId: l.pageId,
      editingAlias: h(this, v),
      pageTypeId: t
    }, r = await new G({
      TOKEN: I.TOKEN,
      BASE: I.BASE
    }).v1.postBlockfilterRemodel({
      requestBody: e
    });
    this.data = { ...r }, f(this, b, ((o = this.data) == null ? void 0 : o.blocks.map((n) => n.contentElementTypeKey.toLowerCase())) ?? []), h(this, O).call(this);
    const a = h(this, E);
    this.data.clipboardFilter = async (n) => n.values.flatMap(($) => {
      var p;
      return ((p = $.value) == null ? void 0 : p.contentData) || [];
    }).map(($) => {
      var p;
      return (p = $.contentTypeKey) == null ? void 0 : p.toLowerCase();
    }).filter(Boolean).every(($) => {
      var p;
      return (p = h(this, b)) == null ? void 0 : p.includes($);
    }) ? typeof a == "function" ? await a(n) : !0 : !1, this.connectedCallback();
  }
};
v = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakMap();
P = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakMap();
U = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakSet();
F = function() {
  !this.data || h(this, E) !== void 0 || (f(this, E, this.data.clipboardFilter), this.data = { ...this.data }, this.data.clipboardFilter = async (s) => (await h(this, U), s.values.flatMap((i) => {
    var r;
    return ((r = i.value) == null ? void 0 : r.contentData) || [];
  }).map((i) => {
    var r;
    return (r = i.contentTypeKey) == null ? void 0 : r.toLowerCase();
  }).filter(Boolean).every((i) => {
    var r;
    return (r = h(this, b)) == null ? void 0 : r.includes(i);
  }) ? typeof h(this, E) == "function" ? await h(this, E).call(this, s) : !0 : !1));
};
W = function() {
  return !!(h(this, P) && h(this, v) && l.pageId && (h(this, S) || l.pageTypeId));
};
y = function() {
  h(this, C) || !u(this, c, W).call(this) || (f(this, C, !0), this.handleBlocks(h(this, P)));
};
l.pageId = "";
l.pageTypeId = "";
l = lt([
  Q("umb-block-catalogue-modal-extend")
], l);
const yt = l;
export {
  l as UmbBlockCatalogueModalElementExtension,
  yt as default
};
//# sourceMappingURL=UmbBlockCatalogueModalElementExtension--JjcIUNW.js.map
