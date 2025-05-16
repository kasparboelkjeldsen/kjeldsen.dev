import "../../node_modules/_nuxt/image/dist/runtime/components/NuxtImg.vue.mjs";
import { defineComponent, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import _sfc_main$1 from "../../node_modules/_nuxt/image/dist/runtime/components/NuxtImg.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "imageBlock",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_NuxtImg = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "prose" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        src: (_c = (_b = (_a = _ctx.data.properties) == null ? void 0 : _a.image) == null ? void 0 : _b.at(0)) == null ? void 0 : _c.url,
        alt: ((_d = _ctx.data.properties) == null ? void 0 : _d.altText) ?? "",
        class: "rounded-lg",
        width: "800"
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=imageBlock.vue2.mjs.map
