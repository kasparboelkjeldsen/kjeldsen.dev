import "../gridModule.vue.mjs";
import { defineComponent } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import _sfc_main$1 from "../gridModule.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "homePage",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GridModule = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (_ctx.data.properties.grid) {
        _push(ssrRenderComponent(_component_GridModule, {
          data: _ctx.data.properties.grid
        }, null, _parent));
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
//# sourceMappingURL=homePage.vue2.mjs.map
