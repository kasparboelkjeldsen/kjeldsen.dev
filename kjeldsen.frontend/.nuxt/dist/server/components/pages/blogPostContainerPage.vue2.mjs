import { defineComponent, withAsyncContext, mergeProps, unref } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrInterpolate } from "vue/server-renderer";
import { useFetch } from "../../node_modules/nuxt/dist/app/composables/fetch.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "blogPostContainerPage",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const props = __props;
    function GetWriter(model) {
      return model.map((item) => {
        var _a2;
        return (_a2 = item.properties) == null ? void 0 : _a2.writerName;
      }).filter((name) => !!name).join(", ");
    }
    const { data: children } = ([__temp, __restore] = withAsyncContext(() => useFetch(`/api/content/children/${props.data.id}`, { server: true }, "$sFdoVrx6oy")), __temp = await __temp, __restore(), __temp);
    const blogPosts = (_a = children.value) == null ? void 0 : _a.items;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "px-4 pb-24 max-w-6xl mx-auto" }, _attrs))}><h1 class="text-4xl font-bold leading-tight tracking-tight mb-10">Blog</h1><ul class="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"><!--[-->`);
      ssrRenderList(unref(blogPosts), (child) => {
        var _a2, _b, _c;
        _push(`<li class="bg-zinc-900 rounded-xl overflow-hidden shadow hover:shadow-xl transition-shadow"><a${ssrRenderAttr("href", ((_a2 = child.route) == null ? void 0 : _a2.path) ?? "#")} class="block group h-full">`);
        if ((_c = (_b = child.properties.seoListImage) == null ? void 0 : _b[0]) == null ? void 0 : _c.url) {
          _push(`<div><img${ssrRenderAttr("src", child.properties.seoListImage[0].url)} alt="" class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="p-6">`);
        if (child.properties.writer) {
          _push(`<p class="text-white">${ssrInterpolate(GetWriter(child.properties.writer))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h2 class="text-xl font-semibold mb-2 text-white">${ssrInterpolate(child.properties.seoTitle)}</h2><p class="text-gray-400 text-sm">${ssrInterpolate(child.properties.seoDescription)}</p></div></a></li>`);
      });
      _push(`<!--]--></ul></section>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=blogPostContainerPage.vue2.mjs.map
