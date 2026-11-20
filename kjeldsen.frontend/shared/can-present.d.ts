// can-present 0.1 ships no TypeScript types (its README says so). Just what CanPresentDeck.vue uses;
// drop this file once the package has its own.
declare module 'can-present' {
  import type { DefineComponent } from 'vue'

  /** Plays a deck file from `src` (a URL, Blob, text or parsed JSON); takes <CanPresent>'s props too. */
  export const CanPresentPlayer: DefineComponent<{
    src: string | Blob | object
    scene?: string | null
    step?: number | null
    keys?: 'focus' | 'global' | false
    swipe?: boolean
    chrome?: boolean | Record<string, boolean>
    ratio?: string | number | null
  }>
}
