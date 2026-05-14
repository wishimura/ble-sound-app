import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f5f0',
        surface: '#ffffff',
        ink: {
          DEFAULT: '#22201c',
          soft: '#4b4843',
          muted: '#8c887f',
        },
        accent: {
          DEFAULT: '#a8854e',
          dark: '#8a6c3c',
          soft: '#e9dfcd',
        },
        line: '#e4e0d6',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(34, 32, 28, 0.04), 0 8px 24px rgba(34, 32, 28, 0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
