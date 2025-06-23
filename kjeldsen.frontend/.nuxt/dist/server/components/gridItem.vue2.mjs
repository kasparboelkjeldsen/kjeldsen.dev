import "./blocks/resolverComponent.vue.mjs";
import "./gridItem.vue.mjs";
import { defineComponent, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle } from "vue/server-renderer";
import _sfc_main$1 from "./blocks/resolverComponent.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "gridItem",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BlocksResolverComponent = _sfc_main$1;
      const _component_GridItem = _sfc_main;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "pt-4 pb-4",
        style: {
          gridColumn: _ctx.item.columnSpan ? `span ${_ctx.item.columnSpan} / span ${_ctx.item.columnSpan}` : void 0,
          gridRow: _ctx.item.rowSpan ? `span ${_ctx.item.rowSpan} / span ${_ctx.item.rowSpan}` : void 0
        }
      }, _attrs))}><div class="mb-2">`);
      if (_ctx.item.content) {
        _push(ssrRenderComponent(_component_BlocksResolverComponent, {
          data: _ctx.item.content
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (_ctx.item.areas && _ctx.item.areas.length) {
        _push(`<div><!--[-->`);
        ssrRenderList(_ctx.item.areas, (area, areaIndex) => {
          _push(`<div class="mt-4 border-t pt-4"><div class="font-bold mb-2">Area: ${ssrInterpolate(area.alias)}</div><div class="grid gap-2" style="${ssrRenderStyle(`grid-template-columns: repeat(${area.columnSpan}, minmax(0, 1fr));`)}"><!--[-->`);
          ssrRenderList(area.items, (areaItem, areaItemIndex) => {
            _push(ssrRenderComponent(_component_GridItem, {
              key: areaItemIndex,
              item: areaItem
            }, null, _parent));
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
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
//# sourceMappingURL=gridItem.vue2.mjs.map
