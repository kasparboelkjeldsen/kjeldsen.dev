import { useRuntimeConfig } from "#imports";
import type { Murder } from "~/types/murder";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  const murders = await $fetch<
    { id: number; username: string; created: string }[]
  >(`${config.public.cmsHost}/api/murder/`, { method: "GET" }).catch((error) => {
    console.error("Failed to fetch murders:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch murders.",
    });
  });

  const grouped = murders.reduce<
    Record<string, { count: number; last: string }>
  >((acc, murder) => {
    const { username, created } = murder;

    if (!acc[username]) {
      acc[username] = { count: 1, last: created };
    } else {
      acc[username].count += 1;
      if (new Date(created) > new Date(acc[username].last)) {
        acc[username].last = created;
      }
    }
    return acc;
  }, {});

  const result: Murder[] = Object.entries(grouped).map(
    ([username, { count, last }]) => ({
      username,
      count,
      last,
    })
  );

  result.sort(
    (a, b) => new Date(b.last).getTime() - new Date(a.last).getTime()
  );

  return result;
});
