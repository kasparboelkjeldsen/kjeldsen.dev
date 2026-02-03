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
      animation: {
        shine: 'shine 3s infinite',
        fadeInUp: 'fadeInUp 0.8s forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        shine: {
          '100%': { left: '100%' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  safelist: [
    'text-red-300',
    'text-sky-300',
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
