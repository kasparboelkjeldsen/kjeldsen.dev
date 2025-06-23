function handleHotUpdate(_router, _generateRoutes) {
}
const _routes = [
  {
    name: "__blockpreview",
    path: "/__blockpreview",
    component: () => import("../pages/__blockpreview.vue.mjs")
  },
  {
    name: "__preview",
    path: "/__preview",
    component: () => import("../pages/__preview.vue.mjs")
  },
  {
    name: "slug",
    path: "/:slug(.*)*",
    component: () => import("../pages/_...slug_.vue.mjs")
  }
];
export {
  _routes as default,
  handleHotUpdate
};
//# sourceMappingURL=virtual_nuxt_X__kasparboelkjeldsen_kjeldsen.dev_kjeldsen.frontend_.nuxt_routes.mjs.map
