/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Material Design 3 (M3) Semantic Role Tokens
        'm3-surface': 'var(--md-sys-color-surface)',
        'm3-surface-container-lowest': 'var(--md-sys-color-surface-container-lowest)',
        'm3-surface-container-low': 'var(--md-sys-color-surface-container-low)',
        'm3-surface-container': 'var(--md-sys-color-surface-container)',
        'm3-surface-container-high': 'var(--md-sys-color-surface-container-high)',
        'm3-surface-container-highest': 'var(--md-sys-color-surface-container-highest)',
        'm3-primary': 'var(--md-sys-color-primary)',
        'm3-primary-container': 'var(--md-sys-color-primary-container)',
        'm3-on-primary': 'var(--md-sys-color-on-primary)',
        'm3-on-primary-container': 'var(--md-sys-color-on-primary-container)',
        'm3-secondary': 'var(--md-sys-color-secondary)',
        'm3-secondary-container': 'var(--md-sys-color-secondary-container)',
        'm3-tertiary': 'var(--md-sys-color-tertiary)',
        'm3-tertiary-container': 'var(--md-sys-color-tertiary-container)',
        'm3-outline': 'var(--md-sys-color-outline)',
        'm3-outline-variant': 'var(--md-sys-color-outline-variant)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '28px',
        'm3-full': '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(-10px)' },
        },
        'm3-ripple': {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(1.2)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.5s ease-out',
        'm3-ripple': 'm3-ripple 0.4s cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
