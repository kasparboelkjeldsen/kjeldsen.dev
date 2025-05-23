import { defineComponent, unref } from "vue";
import { ssrRenderAttrs, ssrRenderAttr } from "vue/server-renderer";
import { useRequestEvent } from "../../node_modules/nuxt/dist/app/composables/ssr.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "imageBlock",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const event = useRequestEvent();
    const isBlockPreview = event == null ? void 0 : event.context.blockPreview;
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (!unref(isBlockPreview)) {
        _push(`<img${ssrRenderAttr("src", (_c = (_b = (_a = _ctx.data.properties) == null ? void 0 : _a.image) == null ? void 0 : _b.at(0)) == null ? void 0 : _c.url)}${ssrRenderAttr("alt", ((_d = _ctx.data.properties) == null ? void 0 : _d.altText) ?? "")} class="rounded-lg">`);
      } else {
        _push(`<!---->`);
      }
      if (unref(isBlockPreview)) {
        _push(`<img${ssrRenderAttr("src", (_g = (_f = (_e = _ctx.data.properties) == null ? void 0 : _e.image) == null ? void 0 : _f.at(0)) == null ? void 0 : _g.url)}${ssrRenderAttr("alt", ((_h = _ctx.data.properties) == null ? void 0 : _h.altText) ?? "")} class="w-full">`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=imageBlock.vue2.mjs.map
