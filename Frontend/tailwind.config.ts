import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Geist', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Geist', 'system-ui', 'sans-serif'],
        mono:    ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        draw: { to: { strokeDashoffset: '0' } },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        draw:    'draw 1.6s cubic-bezier(.3,.7,.2,1) .2s forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
