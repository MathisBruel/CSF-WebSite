import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        csf: {
          dark:   '#183546',
          darker: '#0f2433',
          orange: '#d28342',
          'orange-dark': '#b86d2a',
          cream:  '#edebcd',
          'cream-light': '#f5f4e8',
          light:  '#edebcd',
          black:  '#1A1A1A',
          muted:  '#7a9aab',
        },
      },
      fontFamily: {
        display: ['Moontime', 'cursive'],
        serif:   ['var(--font-lora)', 'Lora', 'Georgia', 'Cambria', 'serif'],
        sans:    ['var(--font-lato)', 'Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-bg.jpg')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
