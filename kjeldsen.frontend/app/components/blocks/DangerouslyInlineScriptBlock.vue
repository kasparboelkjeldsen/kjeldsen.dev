<script lang="ts">
  import { createStaticVNode, getCurrentInstance, type PropType } from 'vue'
  import type { DangerouslyInlineScriptBlockElementModel } from '~~/server/delivery-api'

  // The owner's HTML, verbatim and unsanitised, with no wrapper: it lands in the grid cell exactly
  // where the block sits. There is one editor; that is the trust model. A render function rather
  // than a template, because v-html needs an element to set innerHTML on and a static vnode does not.
  export default defineComponent({
    props: {
      block: { type: Object as PropType<DangerouslyInlineScriptBlockElementModel>, required: true },
    },
    setup(props) {
      const instance = getCurrentInstance()!
      const hydrating = useNuxtApp().isHydrating

      // On a server-rendered load the browser already ran the scripts while parsing the page. After
      // a client-side navigation the HTML is inserted through innerHTML, which never runs a
      // <script>, so each one is swapped for a fresh element that does. `async = false` keeps
      // external scripts in order.
      onMounted(() => {
        const el = instance.subTree.el as Node | null
        const anchor = instance.subTree.anchor as Node | null
        if (hydrating || !el) return
        for (let node: Node | null = el; node; node = node === anchor ? null : node.nextSibling) {
          if (!(node instanceof Element)) continue
          const scripts = node.matches('script') ? [node] : [...node.querySelectorAll('script')]
          for (const old of scripts) {
            const script = document.createElement('script')
            for (const { name, value } of old.attributes) script.setAttribute(name, value)
            script.async = false
            script.text = old.textContent ?? ''
            old.replaceWith(script)
          }
        }
      })

      return () => {
        const html = props.block.properties?.html ?? ''
        if (!html) return null
        // Hydration walks this many sibling nodes, so count them the way the browser parsed them.
        // The server only writes the string out and never reads the count.
        let count = 1
        if (import.meta.client) {
          const template = document.createElement('template')
          template.innerHTML = html
          count = Math.max(template.content.childNodes.length, 1)
        }
        return createStaticVNode(html, count)
      }
    },
  })
</script>
