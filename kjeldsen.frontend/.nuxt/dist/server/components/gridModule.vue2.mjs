import "./gridItem.vue.mjs";
import { defineComponent, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import _sfc_main$1 from "./gridItem.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "gridModule",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GridItem = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "grid gap-4",
        style: `grid-template-columns: repeat(${_ctx.data.gridColumns}, minmax(0, 1fr));`
      }, _attrs))}><!--[-->`);
      ssrRenderList(_ctx.data.items, (item, index) => {
        _push(ssrRenderComponent(_component_GridItem, {
          key: index,
          item
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=gridModule.vue2.mjs.map
