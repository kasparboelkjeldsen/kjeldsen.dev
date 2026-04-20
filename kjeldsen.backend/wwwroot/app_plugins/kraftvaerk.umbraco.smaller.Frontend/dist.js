const k = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new WeakSet();
function C(t, e) {
  let o = t;
  for (; o; ) {
    if (o.localName === e) return !0;
    const n = o.getRootNode();
    o = n instanceof ShadowRoot ? n.host : null;
  }
  return !1;
}
function l(t, e) {
  const { shadowRoot: o } = t;
  if (!o || o.querySelector("style[data-kv-mobile]")) return;
  const n = document.createElement("style");
  n.dataset.kvMobile = "", n.textContent = e, o.appendChild(n);
}
function w(t, e) {
  if (!t.shadowRoot) {
    requestAnimationFrame(() => w(t, e));
    return;
  }
  e.css && l(t, e.css), e.setup && e.setup(t, t.shadowRoot), u(t.shadowRoot);
}
function E(t) {
  for (const [e, o] of k) {
    const n = o.get(t.localName);
    n && C(t, e) && (t.shadowRoot ? l(t, n) : v(t, (i) => l(i, n)));
  }
}
function y(t) {
  if (t.isConnected) {
    if (t.shadowRoot) {
      u(t.shadowRoot);
      return;
    }
    requestAnimationFrame(() => y(t));
  }
}
function v(t, e) {
  if (t.isConnected) {
    if (t.shadowRoot) {
      e(t);
      return;
    }
    requestAnimationFrame(() => v(t, e));
  }
}
function p(t) {
  const e = d.get(t.localName);
  e ? w(t, e) : t.shadowRoot ? u(t.shadowRoot) : t.localName.includes("-") && y(t), E(t);
}
function u(t) {
  if (t instanceof ShadowRoot) {
    if (h.has(t)) return;
    h.add(t);
  }
  new MutationObserver((o) => {
    for (const { addedNodes: n } of o)
      for (const i of n)
        i instanceof Element && (p(i), i.querySelectorAll("*").forEach((a) => p(a)));
  }).observe(t instanceof Document ? document.body : t, { childList: !0, subtree: !0 }), (t instanceof Document ? document.documentElement : t).querySelectorAll("*").forEach(p);
}
function S(t) {
  return d.has(t) || d.set(t, {}), d.get(t);
}
function r(t, e) {
  S(t).css = e;
}
function b(t, e) {
  S(t).setup = e;
}
function R() {
  u(document);
}
const L = "@media (max-width: 920px){umb-app{min-width:100%}}", M = "@media (max-width: 920px){#appHeader{padding-left:5px!important}}", A = "@media (max-width: 920px){::slotted(umb-section-sidebar){position:absolute!important;width:100%!important;display:block!important;left:0!important;height:70px!important}::slotted(umb-section-main){position:absolute!important;left:0!important;top:72px!important;max-width:100%;width:100%}}", P = "@media (max-width: 920px){#main{padding:0!important;margin-top:8px;max-height:68vh}::slotted([slot=navigation]),::slotted([slot=header]){width:32px!important;max-width:32px!important}}", q = "@media (max-width: 920px){:host{position:absolute!important;bottom:74px!important;width:100%!important}}", F = "@media (max-width: 920px){:host{display:block;overflow:var(--kv-sidebar-menu-overflow, hidden);height:var(--kv-sidebar-menu-height, 70px)}}", g = 920;
function c() {
  return window.innerWidth < g;
}
function x(t) {
  window.matchMedia(`(max-width: ${g - 1}px)`).addEventListener("change", (o) => t(o.matches));
}
function N(t, e) {
  function o() {
    setTimeout(() => {
      const a = e.querySelector("uui-scroll-container");
      if (!a) {
        o();
        return;
      }
      a.addEventListener("click", (s) => {
        c() && (s.clientY > 100 || (t.classList.contains("expanded") ? (t.classList.remove("expanded"), t.style.minHeight = "", t.style.removeProperty("--kv-sidebar-menu-height"), t.style.removeProperty("--kv-sidebar-menu-overflow")) : (t.classList.add("expanded"), t.style.minHeight = "100%", t.style.setProperty("--kv-sidebar-menu-height", "100%"), t.style.setProperty("--kv-sidebar-menu-overflow", "visible"))));
      });
    }, 10);
  }
  o();
  function n() {
    t.classList.contains("expanded") && (t.classList.remove("expanded"), t.style.minHeight = "", t.style.removeProperty("--kv-sidebar-menu-height"), t.style.removeProperty("--kv-sidebar-menu-overflow"));
  }
  window.addEventListener("popstate", () => {
    c() && n();
  });
  const i = history.pushState.bind(history);
  history.pushState = function(...a) {
    i(...a), c() && n();
  }, x((a) => {
    a || n();
  });
}
function T(t, e) {
  function o() {
    setTimeout(() => {
      const i = t.querySelectorAll("#hidden-tabs-container");
      if (!i) {
        o();
        return;
      }
      if (i.length > 0) {
        n(i);
        return;
      }
    }, 10);
  }
  function n(i) {
    i.forEach((a) => {
      a.children.length === 0 && setTimeout(() => {
        Array.from(a.children).forEach((s) => {
          s.classList.add("kv-popover-item"), s.addEventListener("click", () => {
            if (!c()) return;
            const m = s.getAttribute("label"), f = {
              Settings: "/umbraco/section/settings",
              Content: "/umbraco/section/content",
              Media: "/umbraco/section/media",
              Members: "/umbraco/section/members",
              Forms: "/umbraco/section/forms",
              Engage: "/umbraco/section/engage",
              Packages: "/umbraco/section/packages",
              Users: "/umbraco/section/users",
              Translation: "/umbraco/section/translation"
            };
            m && f[m] && (window.location.href = f[m]);
          });
        });
      }, 1e3);
    });
  }
  c() && o(), x((i) => {
    i && o();
  });
}
const H = (t, e) => {
  const o = document.createElement("style");
  o.dataset.kvMobile = "", o.textContent = L, document.head.appendChild(o), r("umb-backoffice-header", M), r("umb-split-panel", A), r("umb-body-layout", P), r("umb-workspace-footer", q), r("umb-section-sidebar-menu-with-entity-actions", F), b("umb-section-sidebar", N), b("uui-popover-container", T), R();
};
export {
  H as onInit
};
//# sourceMappingURL=dist.js.map
