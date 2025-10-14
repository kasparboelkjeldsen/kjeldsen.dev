export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Check if View Transition API is supported for cross-document navigation
    if ('startViewTransition' in document) {
      console.info(
        'View Transition API supported - cross-document transitions should work automatically via CSS @view-transition rule'
      )
    } else {
      console.info(
        'View Transition API not supported in this browser - falling back to regular navigation'
      )
    }
  }
})
