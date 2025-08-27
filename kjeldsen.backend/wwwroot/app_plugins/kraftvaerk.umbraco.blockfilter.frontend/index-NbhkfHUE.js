import { UMB_AUTH_CONTEXT as m } from "@umbraco-cms/backoffice/auth";
const s = {
  BASE: "",
  VERSION: "1.0",
  WITH_CREDENTIALS: !1,
  CREDENTIALS: "include",
  TOKEN: void 0,
  USERNAME: void 0,
  PASSWORD: void 0,
  HEADERS: void 0,
  ENCODE_PATH: void 0
}, l = "Umb.Modal.BlockCatalogue", n = [
  {
    type: "modal",
    // This alias is the key. We’re overriding the core catalogue by reusing its alias.
    // If the alias ever changes upstream, update this to match.
    alias: l,
    name: "Block Catalogue Modal Extension",
    elementName: "umb-block-catalogue-modal-extend",
    js: () => import("./UmbBlockCatalogueModalElementExtension-Bo9p454t.js"),
    // Make sure we win registration ordering if both exist:
    weight: -1e4
  }
], A = async (o, a) => {
  o.consumeContext(m, async (e) => {
    const E = await (e == null ? void 0 : e.getLatestToken()) ?? "", c = (e == null ? void 0 : e.getServerUrl()) ?? "";
    s.BASE = c, s.TOKEN = E, i(a);
  });
};
function i(o) {
  setTimeout(() => {
    const a = o.getByAlias(l);
    a ? (o.unregister(a.alias), o.registerMany(n)) : i(o);
  }, 200);
}
export {
  s as O,
  A as o
};
//# sourceMappingURL=index-NbhkfHUE.js.map
