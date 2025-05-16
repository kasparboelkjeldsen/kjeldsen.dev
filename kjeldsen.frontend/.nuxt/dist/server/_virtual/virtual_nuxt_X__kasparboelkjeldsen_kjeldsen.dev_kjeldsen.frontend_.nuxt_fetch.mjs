import { $fetch } from "ofetch";
import { baseURL } from "#internal/nuxt/paths";
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
//# sourceMappingURL=virtual_nuxt_X__kasparboelkjeldsen_kjeldsen.dev_kjeldsen.frontend_.nuxt_fetch.mjs.map
