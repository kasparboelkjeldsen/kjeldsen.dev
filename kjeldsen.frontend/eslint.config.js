import { createConfigForNuxt } from '@nuxt/eslint-config'

export default createConfigForNuxt({

}).override('nuxt/typescript', {
  rules: {
    
    'vue/no-multiple-template-root': 'off',
  },
})