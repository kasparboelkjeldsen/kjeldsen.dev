import type { IApiContentResponseModel } from '~~/server/delivery-api'

/**
 * Hand-written property types for the delivery API.
 *
 * Umbraco 18's OpenAPI document types `properties` as an untyped bag, because the package that
 * used to emit per-doctype schemas (Umbraco.Community.DeliveryApiExtensions) has no v18 release.
 * See knowledge/frontend-v2.md.
 *
 * So these are maintained by hand and deliberately narrow: they describe what this site's content
 * actually returns, verified against the running CMS, rather than everything Umbraco could return.
 * When a doctype changes, this file changes with it - and the compiler points at every call site.
 */

// ---------------------------------------------------------------- shared shapes

export interface RichText {
  markup: string | null
  blocks: unknown[]
}

export interface MediaItem {
  url: string
  name?: string | null
  width?: number | null
  height?: number | null
}

export interface LinkItem {
  url: string | null
  queryString: string | null
  title: string | null
  target: string | null
  destinationId: string | null
  destinationType: string | null
  route: { path: string | null } | null
  linkType: string
}

// ---------------------------------------------------------------- blocks

/** An element inside a block grid. `properties` is narrowed by `contentType` below. */
export interface BlockElement<TType extends string = string, TProps = unknown> {
  contentType: TType
  id: string
  name?: string | null
  properties: TProps
}

export type HeaderBlock = BlockElement<'headerBlock', {
  headerTitle: string | null
  headerLevel: string | number | null
}>

export type RteBlock = BlockElement<'rteBlock', {
  richText: RichText | null
}>

export type CodeBlock = BlockElement<'codeBlock', {
  code: string | null
}>

export type SpotlightBlock = BlockElement<'spotlightBlock', {
  header: string | null
  text: RichText | null
  iconImage: MediaItem[] | null
}>

export type VimeoBlock = BlockElement<'vimeoBlock', {
  url: string | null
}>

/** Blocks that carry no properties of their own today. */
export type ApiUserTestBlock = BlockElement<'apiUserTest', Record<string, never>>
export type CacheKeyExampleBlock = BlockElement<'cacheKeyExampleBlock', Record<string, never>>

export type KnownBlock =
  | HeaderBlock
  | RteBlock
  | CodeBlock
  | SpotlightBlock
  | VimeoBlock
  | ApiUserTestBlock
  | CacheKeyExampleBlock

/** Any block, known or not. Unknown ones still render a placeholder rather than vanishing. */
export type AnyBlock = KnownBlock | BlockElement

export interface BlockGridArea {
  alias: string
  rowSpan: number
  columnSpan: number
  items: BlockGridItem[]
}

export interface BlockGridItem {
  rowSpan: number
  columnSpan: number
  areaGridColumns: number | null
  areas: BlockGridArea[]
  content: AnyBlock | null
  settings: unknown | null
}

export interface BlockGrid {
  gridColumns: number | null
  items: BlockGridItem[]
}

// ---------------------------------------------------------------- pages

/** Properties every page on this site carries, via compositions. */
interface CommonPageProperties {
  cachePage?: boolean | null
  childKeys?: boolean | null
  noSlug?: boolean | null
  lastCdnPurge?: string | null
  cacheKeys?: string[] | null
}

interface WithGrid {
  grid?: BlockGrid | null
}

export interface HomePage extends CommonPageProperties, WithGrid {
  links?: LinkItem[] | null
  background?: MediaItem[] | null
}

export type ContentPage = CommonPageProperties & WithGrid

export type BlogPostContainerPage = CommonPageProperties

export interface BlogPostPage extends CommonPageProperties, WithGrid {
  writer?: IApiContentResponseModel[] | null
}

export type WriterContainerPage = CommonPageProperties
export type Writer = CommonPageProperties

/** Maps a contentType alias to its property shape. */
export interface PagePropertyMap {
  homePage: HomePage
  contentPage: ContentPage
  blogPostContainerPage: BlogPostContainerPage
  blogPostPage: BlogPostPage
  writerContainerPage: WriterContainerPage
  writer: Writer
}

export type PageContentType = keyof PagePropertyMap

/** Any page response, whether or not we recognise its content type. */
export type PageContent = IApiContentResponseModel

/**
 * A delivery API response narrowed to a known content type.
 *
 * An intersection rather than an Omit, so `TypedPage<T>` stays assignable to `PageContent` and can
 * be used as a type-predicate result.
 */
export type TypedPage<T extends PageContentType> = PageContent & {
  contentType: T
  properties: PagePropertyMap[T]
}

/**
 * Narrows a page response to a known content type.
 *
 * Usage: `if (isPage(data, 'homePage')) { data.properties.links }`
 */
export function isPage<T extends PageContentType>(
  content: PageContent | null | undefined,
  contentType: T
): content is TypedPage<T> {
  return !!content && content.contentType === contentType
}

/** Reads the grid off any page that has one, without asserting the content type. */
export function gridOf(content: PageContent | null | undefined): BlockGrid | null {
  const grid = (content?.properties as { grid?: BlockGrid | null } | null)?.grid
  return grid ?? null
}
