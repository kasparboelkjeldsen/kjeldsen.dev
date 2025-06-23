import { defineEventHandler, getQuery, setResponseHeader, sendRedirect } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/h3/dist/index.mjs';
import { a as useRuntimeConfig } from '../../../_/nitro.mjs';
import { serialize } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/cookie/dist/index.js';
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

const callback = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const clientId = config.public.murderClient;
  const clientSecret = config.murderKey;
  const { code, state } = getQuery(event);
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    }
  ).then((res) => res.json());
  const accessToken = tokenResponse.access_token;
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json"
    }
  }).then((res) => res.json());
  const username = userResponse.login;
  console.log(`\u{1F480} Murder committed by: ${username}`);
  try {
    await $fetch("/api/murder/push", {
      method: "POST",
      body: { username }
    });
    console.log(`\u{1F4DD} Murder successfully logged for ${username}`);
  } catch (error) {
    console.error("\u274C Failed to log murder:", error);
  }
  try {
    await $fetch(`${config.public.cmsHost}/api/heartbeat/heartattack`, {
      method: "GET",
      headers: {
        MurderKey: clientSecret
        // The secret murder key from your config
      }
    });
    console.log("\u{1F4A5} Heart attack successfully triggered.");
  } catch (error) {
    console.error("\u274C Failed to trigger heart attack:", error);
  }
  setResponseHeader(
    event,
    "Set-Cookie",
    serialize("pushed-by", username, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7
      // 7 days
    })
  );
  sendRedirect(event, state);
});

export { callback as default };
//# sourceMappingURL=callback.mjs.map
