import { UmbElementMixin as Q } from "@umbraco-cms/backoffice/element-api";
import { LitElement as Z, html as d, css as j, state as T, customElement as ee } from "@umbraco-cms/backoffice/external/lit";
import { UmbDocumentTypeItemRepository as te, UMB_DOCUMENT_TYPE_WORKSPACE_CONTEXT as ie } from "@umbraco-cms/backoffice/document-type";
import { UmbDataTypeItemRepository as se, UmbDataTypeDetailRepository as oe } from "@umbraco-cms/backoffice/data-type";
import { UmbUserGroupCollectionRepository as ae } from "@umbraco-cms/backoffice/user-group";
import { UMB_NOTIFICATION_CONTEXT as ne } from "@umbraco-cms/backoffice/notification";
import { B as z, O as C } from "./index-BJsmxxdK.js";
var le = Object.defineProperty, ce = Object.getOwnPropertyDescriptor, R = (e) => {
  throw TypeError(e);
}, k = (e, t, i, o) => {
  for (var s = o > 1 ? void 0 : o ? ce(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (o ? n(t, i, s) : n(s)) || s);
  return o && s && le(t, i, s), s;
}, S = (e, t, i) => t.has(e) || R("Cannot " + i), B = (e, t, i) => (S(e, t, "read from private field"), i ? i.call(e) : t.get(e)), w = (e, t, i) => t.has(e) ? R("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), re = (e, t, i, o) => (S(e, t, "write to private field"), t.set(e, i), i), c = (e, t, i) => (S(e, t, "access private method"), i), M, q, I, A, E, l, D, N, F, L, f, $, P, W, J, x, X, H, V, Y;
const ue = /* @__PURE__ */ new Set([
  "Umb.PropertyEditorUi.BlockList",
  "Umb.PropertyEditorUi.BlockGrid"
]), pe = 1e3;
let h = class extends Q(Z) {
  constructor() {
    super(...arguments), w(this, l), w(this, M, new se(this)), w(this, q, new oe(this)), w(this, I, new te(this)), w(this, A, new ae(this)), w(this, E), this._blockProperties = [], this._userGroups = [], this._loading = !0, this._saving = !1, this._configs = /* @__PURE__ */ new Map();
  }
  connectedCallback() {
    super.connectedCallback(), c(this, l, F).call(this).catch(
      (e) => console.error("BlockFilter: failed to load user groups", e)
    ), this.consumeContext(ne, (e) => {
      e && re(this, E, e);
    }), this.consumeContext(ie, (e) => {
      e && (this._documentTypeKey = e.getUnique() ?? void 0, this.observe(e.structure.contentTypeProperties, (t) => {
        this._loading = !0, c(this, l, D).call(this, t).catch((i) => {
          console.error("BlockFilter: failed to load block properties", i), this._loading = !1;
        });
      }));
    });
  }
  /** Build the full JSON config for all properties */
  getConfigJson() {
    return this._blockProperties.map((e) => {
      const t = c(this, l, f).call(this, e.alias), i = {
        propertyAlias: e.alias,
        mode: t.mode
      };
      return t.mode === "simple" ? i.simple = { enabledBlockKeys: [...t.enabledBlocks] } : t.mode === "complex" && (i.complex = {
        rules: t.rules.map((o) => ({
          type: o.type,
          blockKey: o.blockKey,
          userGroup: o.userGroupUnique,
          weight: o.weight
        }))
      }), i;
    });
  }
  render() {
    return this._loading ? d`<uui-loader></uui-loader>` : this._blockProperties.length === 0 ? d`
                <uui-box headline="Block Filter">
                    <p class="none">No Block List or Block Grid properties found on this document type.</p>
                </uui-box>
            ` : d`
            ${this._blockProperties.map((e) => c(this, l, H).call(this, e))}

            <div class="actions">
                <uui-button
                    look="primary"
                    color="positive"
                    ?disabled=${this._saving}
                    @click=${() => c(this, l, X).call(this)}
                >${this._saving ? "Saving..." : "Save configuration"}</uui-button>
            </div>
        `;
  }
};
M = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
I = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
D = async function(e) {
  if (!(e != null && e.length)) {
    this._blockProperties = [], this._loading = !1;
    return;
  }
  const t = e, i = [...new Set(t.map((a) => a.dataType.unique))], { data: o } = await B(this, M).requestItems(i);
  if (!o) {
    this._blockProperties = [], this._loading = !1;
    return;
  }
  const s = new Map(
    o.filter((a) => ue.has(a.propertyEditorUiAlias)).map((a) => [a.unique, a])
  ), r = t.filter((a) => s.has(a.dataType.unique)), n = [...new Set(r.map((a) => a.dataType.unique))], y = await Promise.all(
    n.map(async (a) => {
      const u = await B(this, q).requestByUnique(a);
      return { id: a, detail: u.data };
    })
  ), v = new Map(
    y.map(({ id: a, detail: u }) => [a, u])
  ), p = /* @__PURE__ */ new Set();
  for (const a of v.values()) {
    if (!a) continue;
    const u = a.values.find((_) => _.alias === "blocks"), m = u == null ? void 0 : u.value;
    if (m)
      for (const _ of m)
        _.contentElementTypeKey && p.add(_.contentElementTypeKey);
  }
  const G = /* @__PURE__ */ new Map();
  if (p.size > 0) {
    const { data: a } = await B(this, I).requestItems([...p]);
    if (a)
      for (const u of a) {
        const m = u.icon || "icon-document";
        G.set(u.unique, { name: u.name ?? u.unique, icon: m.split(" ")[0] });
      }
  }
  const U = r.map((a) => {
    const u = v.get(a.dataType.unique), m = u == null ? void 0 : u.values.find((g) => g.alias === "blocks"), _ = (m == null ? void 0 : m.value) ?? [], O = s.get(a.dataType.unique);
    return {
      name: a.name,
      alias: a.alias,
      editorUiAlias: O.propertyEditorUiAlias,
      dataType: O,
      availableBlocks: _.filter((g) => g.contentElementTypeKey).map((g) => {
        const b = G.get(g.contentElementTypeKey);
        return {
          key: g.contentElementTypeKey,
          name: (b == null ? void 0 : b.name) ?? g.contentElementTypeKey,
          icon: (b == null ? void 0 : b.icon) || "icon-document"
        };
      })
    };
  }), K = new Map(this._configs);
  for (const a of U)
    K.has(a.alias) || K.set(a.alias, {
      mode: "none",
      enabledBlocks: new Set(a.availableBlocks.map((u) => u.key)),
      rules: []
    });
  this._configs = K, this._blockProperties = U, this._documentTypeKey && await c(this, l, N).call(this, U), this._loading = !1;
};
N = async function(e) {
  var t, i;
  try {
    const s = await new z({ TOKEN: C.TOKEN, BASE: C.BASE }).v1.getBlockfilterConfigurationByDocumentTypeKey({
      documentTypeKey: this._documentTypeKey
    }), r = new Map(this._configs);
    for (const n of s) {
      const y = e.find((p) => p.alias === n.propertyAlias);
      if (!y) continue;
      const v = {
        mode: n.mode,
        enabledBlocks: new Set(
          ((t = n.simple) == null ? void 0 : t.enabledBlockKeys) ?? y.availableBlocks.map((p) => p.key)
        ),
        rules: (((i = n.complex) == null ? void 0 : i.rules) ?? []).map((p) => ({
          type: p.type,
          blockKey: p.blockKey,
          userGroupUnique: p.userGroup,
          weight: p.weight
        }))
      };
      r.set(n.propertyAlias, v);
    }
    this._configs = r;
  } catch {
  }
};
F = async function() {
  const { data: e } = await B(this, A).requestCollection({
    skip: 0,
    take: pe
  });
  e != null && e.items && (this._userGroups = e.items.map((t) => ({ name: t.name ?? t.unique, unique: t.unique })));
};
L = function(e) {
  return e === "Umb.PropertyEditorUi.BlockGrid" ? "Block Grid" : e === "Umb.PropertyEditorUi.BlockList" ? "Block List" : e;
};
f = function(e) {
  return this._configs.get(e);
};
$ = function(e, t) {
  const i = c(this, l, f).call(this, e), o = new Map(this._configs);
  o.set(e, { ...i, mode: t }), this._configs = o;
};
P = function(e, t, i) {
  const o = c(this, l, f).call(this, e), s = new Set(o.enabledBlocks);
  i ? s.add(t) : s.delete(t);
  const r = new Map(this._configs);
  r.set(e, { ...o, enabledBlocks: s }), this._configs = r;
};
W = function(e) {
  var s;
  const t = c(this, l, f).call(this, e), i = this._blockProperties.find((r) => r.alias === e), o = new Map(this._configs);
  o.set(e, {
    ...t,
    rules: [
      ...t.rules,
      {
        type: "allow",
        blockKey: ((s = i.availableBlocks[0]) == null ? void 0 : s.key) ?? "",
        userGroupUnique: "everyone",
        weight: 0
      }
    ]
  }), this._configs = o;
};
J = function(e, t) {
  const i = c(this, l, f).call(this, e), o = new Map(this._configs);
  o.set(e, {
    ...i,
    rules: i.rules.filter((s, r) => r !== t)
  }), this._configs = o;
};
x = function(e, t, i, o) {
  const s = c(this, l, f).call(this, e), r = s.rules.map((y, v) => v === t ? { ...y, [i]: o } : y), n = new Map(this._configs);
  n.set(e, { ...s, rules: r }), this._configs = n;
};
X = async function() {
  var e, t;
  if (this._documentTypeKey) {
    this._saving = !0;
    try {
      await new z({ TOKEN: C.TOKEN, BASE: C.BASE }).v1.postBlockfilterConfigurationByDocumentTypeKey({
        documentTypeKey: this._documentTypeKey,
        requestBody: this.getConfigJson()
      }), (e = B(this, E)) == null || e.peek("positive", {
        data: { message: "Block filter configuration saved." }
      });
    } catch (i) {
      console.error("Failed to save block filter configuration", i), (t = B(this, E)) == null || t.peek("danger", {
        data: {
          headline: "Block Filter",
          message: "Failed to save configuration. Please try again."
        }
      });
    } finally {
      this._saving = !1;
    }
  }
};
H = function(e) {
  const t = c(this, l, f).call(this, e.alias);
  return d`
            <uui-box headline="${e.name}">
                <div class="meta">
                    <span class="label">Alias</span>
                    <span><code>${e.alias}</code></span>
                    <span class="label">Editor</span>
                    <span>${c(this, l, L).call(this, e.editorUiAlias)} · ${e.dataType.name}</span>
                </div>

                <div class="mode-selector">
                    <uui-button-group>
                        <uui-button
                            look=${t.mode === "none" ? "primary" : "secondary"}
                            @click=${() => c(this, l, $).call(this, e.alias, "none")}
                        >None</uui-button>
                        <uui-button
                            look=${t.mode === "simple" ? "primary" : "secondary"}
                            @click=${() => c(this, l, $).call(this, e.alias, "simple")}
                        >Simple</uui-button>
                        <uui-button
                            look=${t.mode === "complex" ? "primary" : "secondary"}
                            @click=${() => c(this, l, $).call(this, e.alias, "complex")}
                        >Complex</uui-button>
                    </uui-button-group>
                </div>

                ${t.mode === "none" ? d`<p class="none">No block filtering configured for this property.</p>` : t.mode === "simple" ? c(this, l, V).call(this, e, t) : c(this, l, Y).call(this, e, t)}
            </uui-box>
        `;
};
V = function(e, t) {
  return e.availableBlocks.length === 0 ? d`<p class="none">No blocks configured on this editor.</p>` : d`
            <div class="block-grid">
                ${e.availableBlocks.map(
    (i) => d`
                        <label
                            class="block-check"
                            @click=${() => c(this, l, P).call(this, e.alias, i.key, !t.enabledBlocks.has(i.key))}
                        >
                            <uui-checkbox
                                ?checked=${t.enabledBlocks.has(i.key)}
                                @click=${(o) => o.stopPropagation()}
                                @change=${(o) => c(this, l, P).call(this, e.alias, i.key, o.target.checked)}
                            ></uui-checkbox>
                            <uui-icon name=${i.icon} aria-hidden="true"></uui-icon>
                            <span>${i.name}</span>
                        </label>
                    `
  )}
            </div>
        `;
};
Y = function(e, t) {
  const i = [
    { name: "Everyone", value: "everyone" },
    ...this._userGroups.map((s) => ({ name: s.name, value: s.unique }))
  ], o = e.availableBlocks.map((s) => ({
    name: s.name,
    value: s.key
  }));
  return d`
            <p class="precedence-note">Rules are evaluated by weight — higher weight takes precedence.</p>
            <div class="rules">
                ${t.rules.map((s, r) => d`
                    <div class="rule-row">
                        <uui-select
                            .options=${[
    { name: "Allow", value: "allow", selected: s.type === "allow" },
    { name: "Deny", value: "deny", selected: s.type === "deny" }
  ]}
                            @change=${(n) => c(this, l, x).call(this, e.alias, r, "type", n.target.value)}
                        ></uui-select>

                        <uui-select
                            .options=${o.map((n) => ({
    ...n,
    selected: n.value === s.blockKey
  }))}
                            @change=${(n) => c(this, l, x).call(this, e.alias, r, "blockKey", n.target.value)}
                        ></uui-select>

                        <span class="rule-for">for</span>

                        <uui-select
                            .options=${i.map((n) => ({
    ...n,
    selected: n.value === s.userGroupUnique
  }))}
                            @change=${(n) => c(this, l, x).call(this, e.alias, r, "userGroupUnique", n.target.value)}
                        ></uui-select>

                        <uui-input
                            type="number"
                            class="weight-input"
                            label="Weight"
                            placeholder="0"
                            .value=${String(s.weight)}
                            @change=${(n) => c(this, l, x).call(this, e.alias, r, "weight", parseInt(n.target.value, 10) || 0)}
                        ></uui-input>

                        <uui-button
                            look="secondary"
                            color="danger"
                            compact
                            @click=${() => c(this, l, J).call(this, e.alias, r)}
                        >
                            <uui-icon name="icon-trash"></uui-icon>
                        </uui-button>
                    </div>
                `)}

                <uui-button
                    look="placeholder"
                    @click=${() => c(this, l, W).call(this, e.alias)}
                >Add rule</uui-button>
            </div>
        `;
};
h.styles = [
  j`
            :host {
                display: block;
                padding: var(--uui-size-layout-1);
            }
            uui-box {
                margin-bottom: var(--uui-size-space-4);
            }
            p.none {
                color: var(--uui-color-text-alt);
            }
            code {
                font-family: monospace;
                background: var(--uui-color-surface-alt);
                padding: 1px 4px;
                border-radius: 3px;
            }
            .meta {
                display: grid;
                grid-template-columns: max-content 1fr;
                gap: var(--uui-size-space-2) var(--uui-size-space-5);
                margin-bottom: var(--uui-size-space-4);
            }
            .label {
                font-weight: bold;
                color: var(--uui-color-text-alt);
            }
            .mode-selector {
                margin-bottom: var(--uui-size-space-4);
            }

            /* ── Simple mode ── */
            .block-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: var(--uui-size-space-3);
            }
            .block-check {
                display: flex;
                align-items: center;
                gap: var(--uui-size-space-2);
                padding: var(--uui-size-space-2) var(--uui-size-space-3);
                border: 1px solid var(--uui-color-border);
                border-radius: var(--uui-border-radius);
                cursor: pointer;
                user-select: none;
            }
            .block-check:hover {
                background: var(--uui-color-surface-alt);
            }
            .block-check uui-icon {
                font-size: 18px;
                color: var(--uui-color-text-alt);
                flex-shrink: 0;
            }

            /* ── Complex mode ── */
            .rules {
                display: flex;
                flex-direction: column;
                gap: var(--uui-size-space-3);
            }
            .rule-row {
                display: flex;
                align-items: center;
                gap: var(--uui-size-space-3);
            }
            .rule-row uui-select {
                flex: 1;
                min-width: 0;
            }
            .rule-row uui-select:first-child {
                flex: 0 0 100px;
            }
            .rule-for {
                font-weight: bold;
                color: var(--uui-color-text-alt);
                flex-shrink: 0;
            }
            .weight-input {
                flex: 0 0 70px;
            }
            .precedence-note {
                font-size: var(--uui-type-small-size);
                color: var(--uui-color-text-alt);
                margin: 0 0 var(--uui-size-space-3) 0;
            }

            /* ── Actions ── */
            .actions {
                margin-bottom: var(--uui-size-space-4);
                display: flex;
                justify-content: flex-end;
            }
        `
];
k([
  T()
], h.prototype, "_blockProperties", 2);
k([
  T()
], h.prototype, "_userGroups", 2);
k([
  T()
], h.prototype, "_loading", 2);
k([
  T()
], h.prototype, "_saving", 2);
k([
  T()
], h.prototype, "_documentTypeKey", 2);
k([
  T()
], h.prototype, "_configs", 2);
h = k([
  ee("blockfilter-settings-tab-view")
], h);
const ve = h;
export {
  h as BlockFilterSettingsTabViewElement,
  ve as default
};
//# sourceMappingURL=BlockFilterSettingsTabView-DDUnGKMp.js.map
