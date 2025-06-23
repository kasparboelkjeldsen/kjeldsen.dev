import { defineComponent } from "vue";
import { ssrRenderAttrs, ssrInterpolate } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "testBlock",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>${ssrInterpolate(_ctx.data.properties)}</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=testBlock.vue2.mjs.map
