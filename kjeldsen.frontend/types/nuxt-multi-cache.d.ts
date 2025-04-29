// types/nuxt-multi-cache.d.ts
import type { Ref } from "vue";
import type { UseAsyncDataOptions } from "nuxt/app";

/**
 * Extended options for useCachedAsyncData
 */
export interface CachedAsyncDataOptions<T> extends UseAsyncDataOptions<T> {
  /**
   * Duration (in seconds) for client-side caching.
   */
  clientMaxAge?: number;

  /**
   * Duration (in seconds) or a function returning a duration based on the resolved data,
   * for server-side caching.
   */
  serverMaxAge?: number | ((data: T) => number | undefined);

  /**
   * Tags used for server-side cache invalidation.
   */
  serverCacheTags?: string[] | ((data: T) => string[] | undefined);
}

declare global {
  /**
   * Composable for fetching and caching data with client/server control.
   */
  const useCachedAsyncData: <T>(
    key: string,
    handler: () => Promise<T>,
    options?: CachedAsyncDataOptions<T>
  ) => Promise<{
    data: Ref<T | null>;
    pending: Ref<boolean>;
    refresh: () => Promise<void>;
    clear: () => void;
    error: Ref<Error | null>;
  }>;
}
