import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  const cfg = useRuntimeConfig()
  const enabled = cfg.public?.debugUnloadListeners === 'true'
  if (!enabled) return

  try {
    const orig = EventTarget.prototype.addEventListener
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    EventTarget.prototype.addEventListener = function (type: any, listener: any, options: any) {
      if (type === 'beforeunload' || type === 'unload') {
        const err = new Error('Unload listener attached')
        // Stack trace and the target constructor name can hint the source
        // Note: console.groupCollapsed keeps noise low
        // @ts-ignore
        const targetName = this?.constructor?.name || 'UnknownTarget'
        console.groupCollapsed(`⚠️ ${type} listener attached on ${targetName}`)
        console.log({ targetName, type, listener, options })
        console.trace(err)
        console.groupEnd()
      }
      // @ts-ignore
      return orig.call(this, type, listener, options)
    }
  } catch (e) {
    console.warn('Failed to attach unload debug hook', e)
  }
})
