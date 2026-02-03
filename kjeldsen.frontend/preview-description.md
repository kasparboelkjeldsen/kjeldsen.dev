# Umbraco Preview Implementation Guide

This document describes how to implement the Umbraco preview functionality in a Nuxt application. The goal is to create a secure preview flow that works within an iframe (as used by Umbraco).

## Overview of the Flow

1.  **Umbraco** opens the preview URL in an iframe: `/api/init-preview?id=...&secret=...&uid=...`
2.  **Server (`/api/init-preview`)** validates the request against the CMS, sets a secure cookie, and redirects to the frontend preview page `/preview`.
3.  **Frontend (`/preview`)** loads and calls the API to fetch content: `/api/preview?id=...`
4.  **Server (`/api/preview`)** validates the cookie and fetches the preview content from the CMS using the preview token.
5.  **Frontend** renders the content using a resolver component.

---

## 1. Initialization Endpoint (`server/api/init-preview.ts`)

This endpoint is the entry point. It validates the request and sets the session cookie.

**Path:** `/api/init-preview`
**Method:** `GET`

### Logic:

1.  **Extract Query Parameters:**
    - `id`: The content ID to preview.
    - `secret`: A secret key for validation.
    - `uid`: A unique identifier (likely user or session ID).
    - `rand`: A random string (cache buster).

2.  **Validate with CMS:**
    - Construct a validation URL: `${cmsHost}/api/custompreviewapi/check?key=${secret}&id=${uid}`
    - Fetch this URL.
    - **Expectation:** A `200 OK` response containing a GUID (UUID format).
    - **Error Handling:** If the status is not 200 or the body is not a valid GUID, throw a `401 Unauthorized` error.

3.  **Set Cookie:**
    - Store the received GUID in a cookie named `umb_preview`.
    - **Crucial Settings for Iframe Support:**
      - `path: '/'`
      - `httpOnly: true`
      - `sameSite: 'none'` (Required for third-party context/iframes)
      - `secure: true` (Required when `SameSite=None`)
      - `maxAge: 3600` (1 hour)

4.  **Redirect:**
    - Redirect the user to the frontend preview page: `/preview?id=${id}&rand=${rand}`.

---

## 2. Frontend Preview Page (`app/pages/preview.vue`)

This page renders the content in preview mode.

**Path:** `/preview` (Note: The original implementation was `/__preview`)

### Logic:

1.  **Fetch Data:**
    - Use a composable (e.g., `usePreviewById`) to fetch data from `/api/preview`.
    - Pass the `id` from the route query.

2.  **Render Content:**
    - Use a dynamic component resolver (e.g., `<PagesPageResolverComponent />`) to render the page based on the fetched data.
    - Show a loading state or error message if the fetch fails.

3.  **Navigation Handling:**
    - **Disable Navigation:** Since this runs in an iframe, you typically want to prevent the user from navigating away from the preview context.
    - Add a global click listener to intercept `<a>` tag clicks.
    - `e.preventDefault()` and alert the user that navigation is disabled in preview mode.
    - Allow links with `target="_blank"`.

4.  **UI/Layout:**
    - Ideally, use a minimal layout or the standard layout but ensure it handles the preview context gracefully.
    - You might want to display a "Preview Mode" banner or similar indicators.

---

## 3. Data Fetching Endpoint (`server/api/preview.get.ts`)

This endpoint acts as a proxy to fetch the actual preview content from the CMS, using the secure cookie.

**Path:** `/api/preview`
**Method:** `GET`

### Logic:

1.  **Extract Query Parameters:**
    - `id`: The content ID to fetch.

2.  **Validate Cookie:**
    - Read the `umb_preview` cookie.
    - If missing, throw `401 Unauthorized`.

3.  **Fetch from CMS:**
    - Initialize your CMS client (e.g., `DeliveryClient`).
    - **Headers:**
      - `X-UMB-PREVIEW`: Set this header to the value of the `umb_preview` cookie.
      - `cache-control`: `no-cache`
    - Call the CMS endpoint to get content by ID (e.g., `getContentItemById20`).
    - Pass `preview: true` if your client supports it.

4.  **Return Data:**
    - Return the content JSON to the frontend.
    - Handle `404` if content is not found.

---

## 4. Composable (`composables/usePreview.ts`)

A helper to encapsulate the data fetching logic on the frontend.

### Logic:

1.  **Function:** `usePreviewById(id)`
2.  **Implementation:**
    - Construct the API URL: `/api/preview?id=${id}`
    - Use `useFetch` (Nuxt) to call the API.
    - **Options:**
      - `server: true` (Ensure it can run on server-side rendering if needed, though preview is often client-heavy).
      - `cache: 'no-cache'` (Crucial to avoid stale preview data).
3.  **Return:**
    - `data`, `error`, `pending` status.

---

## Summary of Key Changes for New Implementation

- **Frontend Route:** Ensure the frontend page is created at `app/pages/preview.vue` (instead of `__preview.vue`).
- **Redirect Target:** Update `server/api/init-preview.ts` to redirect to `/preview` instead of `/__preview`.
