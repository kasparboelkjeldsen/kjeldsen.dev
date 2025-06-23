import "../gridModule.vue.mjs";
import { defineComponent } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import _sfc_main$1 from "../gridModule.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "blogPostPage",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_GridModule = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-a1c62d90><h1 data-v-a1c62d90>${ssrInterpolate(_ctx.data.properties.seoTitle ?? _ctx.data.name)}</h1><h3 data-v-a1c62d90>${ssrInterpolate((_b = (_a = _ctx.data.properties.writer) == null ? void 0 : _a.at(0)) == null ? void 0 : _b.name)}</h3>`);
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
//# sourceMappingURL=blogPostPage.vue2.mjs.map
