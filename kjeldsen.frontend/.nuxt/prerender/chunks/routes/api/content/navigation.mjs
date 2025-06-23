import { defineEventHandler, createError } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/h3/dist/index.mjs';
import { a as useRuntimeConfig } from '../../../_/nitro.mjs';
import { D as DeliveryClient } from '../../../_/DeliveryClient.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ufo/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/destr/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/hookable/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ofetch/dist/node.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/node-mock-http/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@tusbar/cache-control/dist/cache-control.modern.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/consola/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/klona/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/defu/dist/defu.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/scule/dist/index.mjs';
import 'node:fs';
import 'node:url';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/pathe/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/drivers/fs.mjs';
import 'file:///X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/nuxt/dist/core/runtime/nitro/utils/cache-driver.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ohash/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/radix3/dist/index.mjs';

const navigation = defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const api = new DeliveryClient({
    BASE: config.public.cmsHost
  });
  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: ""
    });
    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: "Navigation not found"
      });
    }
    return response;
  } catch (e) {
    console.error("Failed to fetch navigation", e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch navigation"
    });
  }
});

export { navigation as default };
//# sourceMappingURL=navigation.mjs.map
