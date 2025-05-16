import * as ipx from "../node_modules/_nuxt/image/dist/runtime/providers/ipx.mjs";
import * as ipxStatic from "../node_modules/_nuxt/image/dist/runtime/providers/ipxStatic.mjs";
const imageOptions = {
  "screens": {
    "xs": 320,
    "sm": 640,
    "md": 768,
    "lg": 1024,
    "xl": 1280,
    "xxl": 1536,
    "2xl": 1536
  },
  "presets": {},
  "provider": "ipxStatic",
  "domains": [
    "localhost:44375"
  ],
  "alias": {},
  "densities": [
    1,
    2
  ],
  "format": [
    "webp"
  ]
};
imageOptions.providers = {
  ["ipx"]: { provider: ipx, defaults: {} },
  ["ipxStatic"]: { provider: ipxStatic, defaults: {} }
};
export {
  imageOptions
};
//# sourceMappingURL=virtual_nuxt_X__kasparboelkjeldsen_kjeldsen.dev_kjeldsen.frontend_.nuxt_image-options.mjs.map
