/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#141414',
          tertiary: '#1f1f1f',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#a3a3a3',
        },
        accent: {
          primary: '#2563eb',
          hover: '#1d4ed8',
        },
        border: '#262626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
