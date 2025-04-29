import { serialize } from "cookie";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const clientId = config.public.murderClient;
  const clientSecret = config.murderKey;

  const { code, state } = getQuery(event); // "state" is the original page URL

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    }
  ).then((res) => res.json());

  const accessToken = tokenResponse.access_token;

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  }).then((res) => res.json());

  const username = userResponse.login;

  console.log(`💀 Murder committed by: ${username}`);

  // ☝️ Log the murder (call your Nuxt murder API)
  try {
    await $fetch("/api/murder/push", {
      method: "POST",
      body: { username },
    });
    console.log(`📝 Murder successfully logged for ${username}`);
  } catch (error) {
    console.error("❌ Failed to log murder:", error);
  }

  // 💔 Finish them: trigger heart attack
  try {
    await $fetch(`${config.public.cmsHost}/api/heartbeat/heartattack`, {
      method: "GET",
      headers: {
        MurderKey: clientSecret, // The secret murder key from your config
      },
    });
    console.log("💥 Heart attack successfully triggered.");
  } catch (error) {
    console.error("❌ Failed to trigger heart attack:", error);
  }

  // ✅ Set username in cookie (not in querystring!)
  setResponseHeader(
    event,
    "Set-Cookie",
    serialize("pushed-by", username, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  );

  // ✅ Redirect back to where we came from (state = original page)
  sendRedirect(event, state as string);
});
