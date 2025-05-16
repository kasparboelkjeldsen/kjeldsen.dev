import { UMB_BLOCK_MANAGER_CONTEXT as Ht } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as At } from "@umbraco-cms/backoffice/lit-element";
import { UMB_VARIANT_WORKSPACE_CONTEXT as Mt, UMB_WORKSPACE_CONDITION_ALIAS as Nt } from "@umbraco-cms/backoffice/workspace";
import { UMB_PROPERTY_DATASET_CONTEXT as Rt } from "@umbraco-cms/backoffice/property";
import { UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS as Bt } from "@umbraco-cms/backoffice/block-grid";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const W = globalThis, nt = W.ShadowRoot && (W.ShadyCSS === void 0 || W.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ot = Symbol(), dt = /* @__PURE__ */ new WeakMap();
let wt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== ot) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (nt && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = dt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && dt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const It = (s) => new wt(typeof s == "string" ? s : s + "", void 0, ot), Et = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new wt(e, s, ot);
}, Lt = (s, t) => {
  if (nt) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), r = W.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, pt = nt ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return It(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Dt, defineProperty: jt, getOwnPropertyDescriptor: Wt, getOwnPropertyNames: zt, getOwnPropertySymbols: Vt, getPrototypeOf: qt } = Object, w = globalThis, ut = w.trustedTypes, Ft = ut ? ut.emptyScript : "", Q = w.reactiveElementPolyfillSupport, N = (s, t) => s, G = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Ft : null;
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
} }, at = (s, t) => !Dt(s, t), ft = { attribute: !0, type: String, converter: G, reflect: !1, useDefault: !1, hasChanged: at };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), w.litPropertyMetadata ?? (w.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let k = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = ft) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && jt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: n } = Wt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const h = r == null ? void 0 : r.call(this);
      n == null || n.call(this, o), this.requestUpdate(t, h, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ft;
  }
  static _$Ei() {
    if (this.hasOwnProperty(N("elementProperties"))) return;
    const t = qt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(N("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(N("properties"))) {
      const e = this.properties, i = [...zt(e), ...Vt(e)];
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
      for (const r of i) e.unshift(pt(r));
    } else t !== void 0 && e.push(pt(t));
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
    return Lt(t, this.constructor.elementStyles), t;
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
    var n;
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : G).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var n, o;
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const h = i.getPropertyOptions(r), a = typeof h.converter == "function" ? { fromAttribute: h.converter } : ((n = h.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? h.converter : G;
      this._$Em = r, this[r] = a.fromAttribute(e, h.type) ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t, e, i) {
    var r;
    if (t !== void 0) {
      const n = this.constructor, o = this[t];
      if (i ?? (i = n.getPropertyOptions(t)), !((i.hasChanged ?? at)(o, e) || i.useDefault && i.reflect && o === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: r, wrapped: n }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [n, o] of r) {
        const { wrapped: h } = o, a = this[n];
        h !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, o, a);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (i = this._$EO) == null || i.forEach((r) => {
        var n;
        return (n = r.hostUpdate) == null ? void 0 : n.call(r);
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
};
k.elementStyles = [], k.shadowRootOptions = { mode: "open" }, k[N("elementProperties")] = /* @__PURE__ */ new Map(), k[N("finalized")] = /* @__PURE__ */ new Map(), Q == null || Q({ ReactiveElement: k }), (w.reactiveElementVersions ?? (w.reactiveElementVersions = [])).push("2.1.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = globalThis, X = R.trustedTypes, _t = X ? X.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, St = "$lit$", A = `lit$${Math.random().toFixed(9).slice(2)}$`, Pt = "?" + A, Kt = `<${Pt}>`, C = document, B = () => C.createComment(""), I = (s) => s === null || typeof s != "object" && typeof s != "function", ht = Array.isArray, Jt = (s) => ht(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", tt = `[ 	
\f\r]`, M = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, $t = /-->/g, mt = />/g, E = RegExp(`>|${tt}(?:([^\\s"'>=/]+)(${tt}*=${tt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), vt = /'/g, gt = /"/g, Tt = /^(?:script|style|textarea|title)$/i, Gt = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), z = Gt(1), O = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), yt = /* @__PURE__ */ new WeakMap(), P = C.createTreeWalker(C, 129);
function Ct(s, t) {
  if (!ht(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _t !== void 0 ? _t.createHTML(t) : t;
}
const Xt = (s, t) => {
  const e = s.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = M;
  for (let h = 0; h < e; h++) {
    const a = s[h];
    let p, u, l = -1, v = 0;
    for (; v < a.length && (o.lastIndex = v, u = o.exec(a), u !== null); ) v = o.lastIndex, o === M ? u[1] === "!--" ? o = $t : u[1] !== void 0 ? o = mt : u[2] !== void 0 ? (Tt.test(u[2]) && (r = RegExp("</" + u[2], "g")), o = E) : u[3] !== void 0 && (o = E) : o === E ? u[0] === ">" ? (o = r ?? M, l = -1) : u[1] === void 0 ? l = -2 : (l = o.lastIndex - u[2].length, p = u[1], o = u[3] === void 0 ? E : u[3] === '"' ? gt : vt) : o === gt || o === vt ? o = E : o === $t || o === mt ? o = M : (o = E, r = void 0);
    const y = o === E && s[h + 1].startsWith("/>") ? " " : "";
    n += o === M ? a + Kt : l >= 0 ? (i.push(p), a.slice(0, l) + St + a.slice(l) + A + y) : a + A + (l === -2 ? h : y);
  }
  return [Ct(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class L {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const h = t.length - 1, a = this.parts, [p, u] = Xt(t, e);
    if (this.el = L.createElement(p, i), P.currentNode = this.el.content, e === 2 || e === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (r = P.nextNode()) !== null && a.length < h; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const l of r.getAttributeNames()) if (l.endsWith(St)) {
          const v = u[o++], y = r.getAttribute(l).split(A), j = /([.?@])?(.*)/.exec(v);
          a.push({ type: 1, index: n, name: j[2], strings: y, ctor: j[1] === "." ? Zt : j[1] === "?" ? Qt : j[1] === "@" ? te : Z }), r.removeAttribute(l);
        } else l.startsWith(A) && (a.push({ type: 6, index: n }), r.removeAttribute(l));
        if (Tt.test(r.tagName)) {
          const l = r.textContent.split(A), v = l.length - 1;
          if (v > 0) {
            r.textContent = X ? X.emptyScript : "";
            for (let y = 0; y < v; y++) r.append(l[y], B()), P.nextNode(), a.push({ type: 2, index: ++n });
            r.append(l[v], B());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Pt) a.push({ type: 2, index: n });
      else {
        let l = -1;
        for (; (l = r.data.indexOf(A, l + 1)) !== -1; ) a.push({ type: 7, index: n }), l += A.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = C.createElement("template");
    return i.innerHTML = t, i;
  }
}
function U(s, t, e = s, i) {
  var o, h;
  if (t === O) return t;
  let r = i !== void 0 ? (o = e._$Co) == null ? void 0 : o[i] : e._$Cl;
  const n = I(t) ? void 0 : t._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((h = r == null ? void 0 : r._$AO) == null || h.call(r, !1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = r : e._$Cl = r), r !== void 0 && (t = U(s, r._$AS(s, t.values), r, i)), t;
}
class Yt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, r = ((t == null ? void 0 : t.creationScope) ?? C).importNode(e, !0);
    P.currentNode = r;
    let n = P.nextNode(), o = 0, h = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let p;
        a.type === 2 ? p = new D(n, n.nextSibling, this, t) : a.type === 1 ? p = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (p = new ee(n, this, t)), this._$AV.push(p), a = i[++h];
      }
      o !== (a == null ? void 0 : a.index) && (n = P.nextNode(), o++);
    }
    return P.currentNode = C, r;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class D {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, r) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = U(this, t, e), I(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== O && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Jt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && I(this._$AH) ? this._$AA.nextSibling.data = t : this.T(C.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: e, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = L.createElement(Ct(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(e);
    else {
      const o = new Yt(r, this), h = o.u(this.options);
      o.p(e), this.T(h), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = yt.get(t.strings);
    return e === void 0 && yt.set(t.strings, e = new L(t)), e;
  }
  k(t) {
    ht(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const n of t) r === e.length ? e.push(i = new D(this.O(B()), this.O(B()), this, this.options)) : i = e[r], i._$AI(n), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const r = t.nextSibling;
      t.remove(), t = r;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class Z {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, r, n) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = c;
  }
  _$AI(t, e = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = U(this, t, e, 0), o = !I(t) || t !== this._$AH && t !== O, o && (this._$AH = t);
    else {
      const h = t;
      let a, p;
      for (t = n[0], a = 0; a < n.length - 1; a++) p = U(this, h[i + a], e, a), p === O && (p = this._$AH[a]), o || (o = !I(p) || p !== this._$AH[a]), p === c ? t = c : t !== c && (t += (p ?? "") + n[a + 1]), this._$AH[a] = p;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Zt extends Z {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class Qt extends Z {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class te extends Z {
  constructor(t, e, i, r, n) {
    super(t, e, i, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = U(this, t, e, 0) ?? c) === O) return;
    const i = this._$AH, r = t === c && i !== c || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== c && (i === c || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class ee {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    U(this, t);
  }
}
const et = R.litHtmlPolyfillSupport;
et == null || et(L, D), (R.litHtmlVersions ?? (R.litHtmlVersions = [])).push("3.3.0");
const se = (s, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = r = new D(t.insertBefore(B(), n), n, void 0, e ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const T = globalThis;
let V = class extends k {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = se(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return O;
  }
};
var bt;
V._$litElement$ = !0, V.finalized = !0, (bt = T.litElementHydrateSupport) == null || bt.call(T, { LitElement: V });
const st = T.litElementPolyfillSupport;
st == null || st({ LitElement: V });
(T.litElementVersions ?? (T.litElementVersions = [])).push("4.2.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ot = (s) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(s, t);
  }) : customElements.define(s, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ie = { attribute: !0, type: String, converter: G, reflect: !1, hasChanged: at }, re = (s = ie, t, e) => {
  const { kind: i, metadata: r } = e;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((s = Object.create(s)).wrapped = !0), n.set(e.name, s), i === "accessor") {
    const { name: o } = e;
    return { set(h) {
      const a = t.get.call(this);
      t.set.call(this, h), this.requestUpdate(o, a, s);
    }, init(h) {
      return h !== void 0 && this.C(o, void 0, s, h), h;
    } };
  }
  if (i === "setter") {
    const { name: o } = e;
    return function(h) {
      const a = this[o];
      t.call(this, h), this.requestUpdate(o, a, s);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function $(s) {
  return (t, e) => typeof e == "object" ? re(s, t, e) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(s, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function kt(s) {
  return $({ ...s, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ne = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 }, oe = (s) => (...t) => ({ _$litDirective$: s, values: t });
class ae {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, i) {
    this._$Ct = t, this._$AM = e, this._$Ci = i;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class it extends ae {
  constructor(t) {
    if (super(t), this.it = c, t.type !== ne.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(t) {
    if (t === c || t == null) return this._t = void 0, this.it = t;
    if (t === O) return t;
    if (typeof t != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (t === this.it) return this._t;
    this.it = t;
    const e = [t];
    return e.raw = e, this._t = { _$litType$: this.constructor.resultType, strings: e, values: [] };
  }
}
it.directiveName = "unsafeHTML", it.resultType = 1;
const he = oe(it);
var le = Object.defineProperty, ce = Object.getOwnPropertyDescriptor, xt = (s) => {
  throw TypeError(s);
}, m = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? ce(t, e) : t, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = (i ? o(t, e, r) : o(r)) || r);
  return i && r && le(t, e, r), r;
}, lt = (s, t, e) => t.has(s) || xt("Cannot " + e), f = (s, t, e) => (lt(s, t, "read from private field"), e ? e.call(s) : t.get(s)), g = (s, t, e) => t.has(s) ? xt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(s) : t.set(s, e), _ = (s, t, e, i) => (lt(s, t, "write to private field"), t.set(s, e), e), de = (s, t, e) => (lt(s, t, "access private method"), e), x, b, S, q, Y, F, K, J, rt, Ut;
const pe = "umb-headless-preview";
let d = class extends At {
  constructor() {
    super(), g(this, rt), g(this, x, null), g(this, b), g(this, S), g(this, q), g(this, Y), g(this, F), g(this, K, !1), g(this, J, []), this.init();
  }
  async init() {
    this.consumeContext(Ht, (s) => {
      var e;
      _(this, F, (e = s == null ? void 0 : s.getVariantId()) == null ? void 0 : e.culture);
      const t = s == null ? void 0 : s.getHostElement();
      t != null && _(this, J, this.findAllInShadowRoots("uui-action-bar", t));
    }), this.consumeContext(Mt, (s) => {
      _(this, x, s == null ? void 0 : s.getUnique()), _(this, b, this.content), this.getHtmlString().then(() => {
        this.requestUpdate();
      });
    }), this.uiLoop();
  }
  uiLoop() {
    setTimeout(() => {
      f(this, K) !== d.useBeamFallback && (_(this, K, d.useBeamFallback), this.requestUpdate()), this.uiLoop();
    }, 100);
  }
  async updated(s) {
    super.updated(s), (f(this, b) !== this.content || f(this, S) !== this.settings) && de(this, rt, Ut).call(this);
  }
  blockBeam() {
    var s, t;
    return z`<umb-ref-grid-block
			standalone
			href=${((s = this.config) != null && s.showContentEdit ? (t = this.config) == null ? void 0 : t.editContentPath : void 0) ?? ""}>
			<umb-icon slot="icon" .name=${this.icon}></umb-icon>
			<umb-ufm-render slot="name" inline .markdown=${this.label} .value=${this.content}></umb-ufm-render>
			${this.unpublished ? z`<uui-tag slot="name" look="secondary" title=${this.localize.term("blockEditor_notExposedDescription")}
						><umb-localize key="blockEditor_notExposedLabel"></umb-localize
					></uui-tag>` : c}
			<umb-block-grid-areas-container slot="areas" draggable="false"></umb-block-grid-areas-container>
		</umb-ref-grid-block>`;
  }
  async getHtmlString() {
    var i, r;
    const s = {
      id: f(this, x),
      contentType: (i = this.blockType) == null ? void 0 : i.contentElementTypeKey,
      settingsType: ((r = this.blockType) == null ? void 0 : r.settingsElementTypeKey) ?? "",
      content: JSON.stringify(f(this, b)),
      settings: JSON.stringify(f(this, S) ?? {}),
      culture: f(this, F)
    }, e = await (await fetch("/api/v1.0/umbraco.community.headless.blockpreview/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(s)
    })).json();
    _(this, q, e.html);
  }
  render() {
    var s, t;
    return f(this, b) || _(this, b, this.content), f(this, S) || _(this, S, this.settings), d.useBeamFallback ? this.blockBeam() : (f(this, J).forEach((e) => {
      this.manageButtons(e);
    }), z`<div class="__headless-preview"><a href=${((s = this.config) != null && s.showContentEdit ? (t = this.config) == null ? void 0 : t.editContentPath : void 0) ?? ""}>${he(f(this, q))}</a></div>`);
  }
  findAllInShadowRoots(s, t) {
    const e = [];
    function i(r) {
      r instanceof Element && r.matches(s) && e.push(r);
      const n = r.shadowRoot;
      n && Array.from(n.children).forEach(i), r instanceof Element && Array.from(r.children).forEach(i);
    }
    return i(t), e;
  }
  manageButtons(s) {
    var e;
    if (s.querySelector(".__blockpreview-button")) return;
    const t = this.getHostElement().ownerDocument.createElement("a");
    t.classList.add("__blockpreview-button"), t.setAttribute("data-id", ((e = f(this, x)) == null ? void 0 : e.toString()) ?? ""), t.setAttribute("style", `
      height: 33px;
      width: 33px;
      background: #f3f3f5;
      cursor: pointer;
      border-top-left-radius: 15px;
      border-bottom-left-radius: 15px;
      display: inline-block;
    `), t.innerHTML = `
      <svg style="height: 17px; margin: 8px;" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" class="lucide lucide-container" viewBox="0 0 24 24">
        <path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z"></path>
        <path d="M10 21.9V14L2.1 9.1M10 14l11.9-6.9M14 19.8v-8.1M18 17.5V9.4"></path>
      </svg>
    `, t.addEventListener("mouseenter", () => {
      t.style.background = "#ffffff";
    }), t.addEventListener("mouseleave", () => {
      t.style.background = "#f3f3f5";
    }), t.addEventListener("click", () => {
      d.useBeamFallback = !d.useBeamFallback, console.log(d.useBeamFallback), this.requestUpdate(), console.log(f(this, x));
    }), s.insertBefore(t, s.firstElementChild);
  }
};
x = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
Y = /* @__PURE__ */ new WeakMap();
F = /* @__PURE__ */ new WeakMap();
K = /* @__PURE__ */ new WeakMap();
J = /* @__PURE__ */ new WeakMap();
rt = /* @__PURE__ */ new WeakSet();
Ut = function() {
  clearTimeout(f(this, Y)), _(this, Y, window.setTimeout(async () => {
    _(this, b, this.content), _(this, S, this.settings), await this.getHtmlString(), this.requestUpdate();
  }, 10));
};
d.useBeamFallback = !1;
d.styles = [
  Et`
            .__headless-preview {
                border: 2px solid transparent;
                box-sizing: border-box;
                transition: border-color 0.2s ease-in-out;
                min-height: 50px;
                
            }
            .__headless-preview a {
              display: flex;
              min-height: 50px;
              width: 100%;
            }
            .__headless-preview:hover {
                border: 2px solid var(--uui-palette-malibu);
            }

            .__blockpreview-button {
              cursor: pointer;
            }

            .__block-preview {
              width: 100%;
            }
        `
];
m([
  $({ attribute: !1 })
], d.prototype, "content", 2);
m([
  $({ attribute: !1 })
], d.prototype, "settings", 2);
m([
  $({ attribute: !1 })
], d.prototype, "blockType", 2);
m([
  $({ attribute: !1 })
], d.prototype, "label", 2);
m([
  $({ attribute: !1 })
], d.prototype, "icon", 2);
m([
  $({ attribute: !1 })
], d.prototype, "config", 2);
m([
  $({ attribute: !1 })
], d.prototype, "contentInvalid", 2);
m([
  $({ attribute: !1 })
], d.prototype, "settingsInvalid", 2);
m([
  $({ attribute: !1 })
], d.prototype, "unsupported", 2);
m([
  $({ attribute: !1 })
], d.prototype, "unpublished", 2);
d = m([
  Ot(pe)
], d);
var ue = Object.defineProperty, fe = Object.getOwnPropertyDescriptor, ct = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? fe(t, e) : t, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = (i ? o(t, e, r) : o(r)) || r);
  return i && r && ue(t, e, r), r;
};
const _e = "umb-headless-preview-workspace-view";
let H = class extends At {
  constructor() {
    super(), this.headlessPreviewEnabled = !1, this.consumeContext(Rt, async (s) => {
      this.entityId = (s == null ? void 0 : s.getUnique()) ?? void 0, this.entityId && await this.loadInitialState();
    });
  }
  async loadInitialState() {
    try {
      const s = await fetch(`/api/v1/umbraco.community.headless.blockpreview?id=${this.entityId}`);
      if (s.ok) {
        const t = await s.json();
        this.headlessPreviewEnabled = !!t.enabled;
      } else
        console.error("Failed to load preview state", s.statusText);
    } catch (s) {
      console.error("Error while fetching preview state", s);
    }
  }
  async togglePreviewEnabled(s) {
    const t = s.target;
    this.headlessPreviewEnabled = t.checked;
    try {
      const e = await fetch("/api/v1/umbraco.community.headless.blockpreview", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: this.entityId,
          enabled: this.headlessPreviewEnabled
        })
      });
      e.ok || console.error("Failed to update preview toggle", e.statusText);
    } catch (e) {
      console.error("Error while toggling headless preview", e);
    }
  }
  render() {
    return z`
      <uui-box headline="Headless Block Preview">
        <uui-label for="headless-preview-toggle">Enable Preview</uui-label>

        <uui-toggle
          id="headless-preview-toggle"
          label="Headless Block Preview"
          .checked=${this.headlessPreviewEnabled}
          @change=${this.togglePreviewEnabled}>
        </uui-toggle>
      </uui-box>
    `;
  }
};
H.styles = [
  Et`
      uui-toggle {
        margin-top: var(--uui-size-space-3);
      }
    `
];
ct([
  kt()
], H.prototype, "headlessPreviewEnabled", 2);
ct([
  kt()
], H.prototype, "entityId", 2);
H = ct([
  Ot(_e)
], H);
const Se = async (s, t) => {
  const e = await $e(), i = {
    alias: "umbraco.community.headless.blockpreview",
    name: "Umbraco Community Headless Block Preview",
    type: "blockEditorCustomView",
    element: d,
    forContentTypeAlias: e
  }, r = {
    type: "workspaceView",
    alias: "umb.workspaceView.headlessPreview",
    name: "Headless Preview",
    element: H,
    weight: 100,
    meta: {
      label: "Block Preview",
      pathname: "preview",
      icon: "icon-shipping-box"
    },
    conditions: [
      {
        alias: Nt,
        match: Bt
      }
    ]
  };
  t.register(i), t.register(r);
};
async function $e() {
  try {
    const s = await fetch("/api/v1/umbraco.community.headless.blockpreview/", {
      method: "OPTIONS",
      headers: {
        Accept: "application/json"
      }
    });
    if (!s.ok)
      throw new Error(`Server returned ${s.status}`);
    const t = await s.json();
    return console.log("Enabled block aliases:", t), t;
  } catch (s) {
    return console.error("Fetch failed:", s), [];
  }
}
export {
  Se as onInit
};
//# sourceMappingURL=dist.js.map
