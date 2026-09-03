/**
 * Content types.
 *
 * These are **generated**, not hand-written. Umbraco 18 emits a schema per document, element and
 * media type into the delivery OpenAPI document when
 * `Umbraco:CMS:DeliveryApi:OpenApi:GenerateContentTypeSchemas` is on, so `npm run gen` produces a
 * real discriminated union on `contentType` with typed `properties`.
 *
 * This file only re-exports the generated names under shorter local aliases and holds the couple of
 * helpers that do not come out of the generator. If a doctype changes, run `npm run gen` — nothing
 * here needs editing.
 */
import type {
  ApiBlockGridItemModel,
  ApiBlockGridModel,
  IApiContentResponseModel,
  IApiElementModel,
} from '~~/server/delivery-api'

/** Any page response. A union discriminated on `contentType`. */
export type PageContent = IApiContentResponseModel

/** Any block. Also a union discriminated on `contentType`. */
export type AnyBlock = IApiElementModel

export type BlockGrid = ApiBlockGridModel
export type BlockGridItem = ApiBlockGridItemModel

/** Every content type alias the API can return for a page. */
export type PageContentType = NonNullable<PageContent['contentType']>

/**
 * Reads the grid off any page that has one.
 *
 * Not every content type declares `grid`, so this avoids making every caller narrow the union
 * first just to ask a question that has a sensible answer for all of them.
 */
export function gridOf(content: PageContent | null | undefined): BlockGrid | null {
  const grid = (content?.properties as { grid?: BlockGrid | null } | undefined)?.grid
  return grid ?? null
}
