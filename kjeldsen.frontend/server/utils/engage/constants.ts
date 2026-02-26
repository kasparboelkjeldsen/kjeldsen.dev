/**
 * Engage cookie and segment constants.
 */

export const VISITOR_COOKIE = 'engage_visitor'
export const PAGEVIEW_COOKIE = 'engage_pv'
export const SEGMENT_TOKEN_COOKIE = 'segTok'
export const SEGMENT_ALIAS_COOKIE = 'engageSegment'

/** Regex for valid segment aliases */
export const SEGMENT_ALIAS_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

/** Default segment for anonymous/unidentified visitors */
export const DEFAULT_SEGMENT = 'default'
