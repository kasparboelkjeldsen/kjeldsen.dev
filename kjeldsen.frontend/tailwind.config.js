/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './app/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            fontSize: theme('fontSize.lg')[0],
            h1: {
              fontSize: theme('fontSize.4xl')[0],
              fontWeight: theme('fontWeight.bold'),
              lineHeight: theme('lineHeight.tight'),
              letterSpacing: theme('letterSpacing.tight'),
              marginBottom: theme('spacing.6'),
              color: theme('colors.white'),
            },
          },
        },
        invert: {
          css: {
            fontSize: theme('fontSize.lg')[0],
            h1: {
              color: theme('colors.white'),
            },
          },
        },
      }),

      fontFamily: {
        sans: ['Atkinson Hyperlegible', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  safelist: [
    'text-red-300',
    {
      pattern: /col-span-(\d+)/,
      variants: ['sm'],
    },
    {
      pattern: /row-span-(\d+)/,
      variants: ['sm'],
    },
    {
      pattern: /grid-cols-(\d+)/,
      variants: ['sm'],
    },
  ],

  plugins: [typography],
}
