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

## DEBUG NOTE (2025-02-26) - ACTIVE INVESTIGATION

### Problem Being Debugged
Cache gets busted incorrectly - incognito visits invalidate cache for normal browser visits on personalized pages.

### Root Cause Identified
**Cache key mismatch between LOOKUP and STORE phases:**

`buildCacheKey()` in `server/multiCache.serverOptions.ts` is called TWICE per request:
1. **LOOKUP** (before middleware runs): Only has access to cookies
2. **STORE** (after middleware runs): Has access to `event.context.engageSegment` set by middleware

**The mismatch:**
- First-time visitor (no cookie): LOOKUP returns `path::seg:default`
- Middleware bootstraps visitor, sets `event.context.engageSegment = 'engage_personalization_13'`
- STORE returns `path::seg:engage_personalization_13`
- **Result:** Cache stored under key that LOOKUP will never use for that visitor!

### Test Results (from server logs)
```
Normal browser (with cookie):
  LOOKUP: /blog/an-image-centric-page::seg:engage_personalization_13
  STORE:  /blog/an-image-centric-page::seg:engage_personalization_13  ✓ Match

Incognito (no cookie):
  LOOKUP: /blog/an-image-centric-page::seg:default                   <- No cookie
  STORE:  /blog/an-image-centric-page::seg:engage_personalization_13  <- Middleware set context
  ✗ MISMATCH - cache stored under wrong key!

Normal browser refresh (cookies somehow cleared):
  LOOKUP: /blog/an-image-centric-page::seg:default
  STORE:  /blog/an-image-centric-page::seg:engage_personalization_13
  ✗ MISMATCH
```

### Current Debug Logging
`server/multiCache.serverOptions.ts` has logging that shows:
- `[CACHE-DEBUG] buildCacheKey called` with phase, path, and resolved segment
- Cookie value vs context value comparison

### Potential Fix Approaches
1. **During STORE, use the same segment that LOOKUP would have used** (from cookie, not context)
2. **Track the LOOKUP key in event.context** and reuse it for STORE
3. **Accept that first-time visitors always miss cache** but ensure returning visitors with cookies work correctly

### Files to Review
- `server/multiCache.serverOptions.ts` - cache key generation (has debug logging)
- `server/middleware/serverMiddleware.ts` - sets `event.context.engageSegment`
- `server/api/content/[...slug].ts` - has retry logic for invalid visitor IDs (recently added)

### Commands Used
```bash
npm run cache  # Runs Nuxt with caching enabled
```

### Recent Fix Applied
Added retry logic in `server/api/content/[...slug].ts` to handle "Provided External Visitor Id does not exist" errors by clearing cookies and retrying.

---

