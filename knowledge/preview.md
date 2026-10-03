# Preview

The backoffice's Preview button shows a saved, unpublished document through the real frontend.
Kraftvaerk.Umbraco.Headless.Preview (backend package, open source at
github.com/kraftvaerk/kraftvaerk.umbraco.headless.preview) does the CMS half; the V2 frontend does
the rest since 2026-10-03.

## The flow

1. The package replaces `/umbraco/preview` with an iframe to `HeadlessPreview:Url`
   (`http://localhost:3000/api/init-preview` locally, the frontend app's `/api/init-preview` in
   production) with `?id=<document key>&secret=<guid>&uid=<backoffice user id>`. The secret is
   minted for the logged-in editor and lives in the CMS's memory for one minute.
2. `server/api/init-preview.get.ts` trades it at `<cms>/api/custompreviewapi/check?key=&id=`. A 200
   proves the visitor came from the button (the check consumes the secret); anything else gets a
   small "press Preview again" page.
3. The frontend redirects to `/preview/<id>?t=<pass>`. The pass (`server/utils/preview.ts`) is
   `<expiry>.<HMAC-SHA256>` over the document id and expiry, keyed with the delivery key: one
   document, one hour, not forgeable or movable. It rides in the URL, not a cookie, because the
   preview is a cross-site iframe and browsers are dropping third-party cookies.
4. `app/pages/preview/[id].vue` renders through `PageResolver` like any page, fetching
   `server/api/preview.get.ts`, which checks the pass and reads the document **by id** from the
   Delivery API with `Preview: true`.

## Things to know

- **By id, never by path.** A document that has never been published has no URL; the Delivery API
  reports a placeholder route `/preview-<id>/` that resolves to nothing.
- **Nothing about a preview is cached or counted.** The output-cache middleware bypasses
  `/preview/` (its key ignores the query string, so a stored preview would be served without a
  pass), the API answers `private, no-store` and `X-Robots-Tag: noindex`, the page sets
  `robots: noindex`, and the Engage client plugin registers no pageview there.
- **The package's long-lived guid is not used.** `check` answers with a guid meant for an
  `X-UMB-PREVIEW` header, which its `IRequestMemberAccessService` accepts once for member-protected
  content. Nothing on this site is protected, the repo replaces that service with its own
  (`code/services/Access`), and drafts only need the API key with `Preview: true`.
- **Links inside a preview lead to the published site.** The pass opens one document.
- **Testing without the button**: a pass can be minted with the same HMAC and the frontend's
  `DELIVERY_KEY`; the script used for the first screenshots was
  `kjeldsen.experiment/visio/shoot.mjs` (headless Chrome over CDP, no Playwright) fed a minted URL.
  The full click-through from the backoffice was not tested on 2026-10-03.
