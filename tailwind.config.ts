import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#080808',
        surface: '#0f0f0f',
        'surface-2': '#141414',
        border: '#1a1a1a',
        primary: '#e8e5e0',
        muted: '#888888',
        accent: '#b8f724',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
