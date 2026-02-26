# Personalization Caching Strategy

This project uses a hybrid caching strategy to balance high performance (Nuxt Multi Cache) with granular personalization (Umbraco Engage).

## The Core Problem

We cache pages heavily. However, a user's segment might change mid-session (e.g., visiting a specific category), but if they navigate to a cached page, the middleware responsible for updating their segment never runs.

## The Solution

### 1. "Sneaky" Client-Side Segmentation

**File:** `app/plugins/sneak-segmentation.client.ts`

- **Action:** On every page load, the client scans all local links.
- **Check:** It calls an internal API (`/api/engage/sneak`) for each link to ask: _"If this user clicked this, would they get a segmented version?"_
- **Patch:** If yes, the link `href` is updated to include `?segmentbreak=true`.

### 2. Cache Breaking & Re-evaluation

**File:** `server/multiCache.serverOptions.ts` & `server/middleware/serverMiddleware.ts`

- **Bypass:** The cache configuration detects `?segmentbreak=true` and forces a cache MISS (returns `null` key).
- **Re-run:** The server middleware sees the flag, ignores existing cookies, and forces a fresh call to Umbraco Engage to re-evaluate the user's segment.
- **Result:** The user gets fresh content and updated cookies. The URL is immediately cleaned up client-side.

### 3. Stale Page Tracking

**File:** `server/plugins/cache-debug-comment.ts` & `server/api/engage/pageview.post.ts`

- **Marker:** Every HTML response gets a `<meta name="engage-server-gen">` tag with the server generation timestamp.
- **Detection:** The client plugin checks this timestamp. If the page is "stale" (>8s old), it implies the page came from cache and the middleware did _not_ run.
- **Fix:** The client fires a background call to `/api/engage/pageview` to ensure the view is registered in analytics.


---

## 4. Early Visitor Identification (Cache Key Generation)

**File:** `server/multiCache.serverOptions.ts` & `server/utils/engage/identify.ts`

The key insight: `buildCacheKey()` runs **before** middleware during cache lookup. If we can identify the visitor's segment during key generation, first-time visitors can hit existing segment caches immediately.

### How It Works

```
Request Flow:
┌─────────────────────────────────────────────────────────────────┐
│ 1. buildCacheKey (LOOKUP)                                       │
│    ├── Has cookie? → Use segment from cookie (fast)             │
│    └── No cookie?  → Call Engage API → Get segment              │
│                                                                  │
│ 2. Cache Lookup                                                  │
│    ├── HIT  → Return cached page (skip middleware)              │
│    └── MISS → Continue to middleware + SSR                      │
│                                                                  │
│ 3. Middleware (only on cache miss)                              │
│    ├── If identified in step 1: Reuse response, set cookies     │
│    └── If not: Make API call, set cookies                       │
│                                                                  │
│ 4. buildCacheKey (STORE)                                        │
│    └── Use segment from event.context (set in step 1)           │
└─────────────────────────────────────────────────────────────────┘
```

### Key Files

- `server/utils/engage/identify.ts` - Lightweight visitor identification
- `server/utils/engage/constants.ts` - Shared cookie names and patterns
- `server/multiCache.serverOptions.ts` - Cache key generation with early identification
- `server/middleware/serverMiddleware.ts` - Cookie management, reuses identification if available

### Benefits

1. **First-time visitors hit existing caches** - No cookie required for cache hit
2. **Returning visitors skip API calls** - Cookie provides instant segment lookup
3. **No double API calls** - Middleware reuses identification response from cache key generation
4. **Consistent keys** - LOOKUP and STORE always produce the same key


