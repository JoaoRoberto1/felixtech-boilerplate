import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Felix Technology navy, derived from the brand logo (#002846).
        brand: {
          50: '#f2f4f6',
          100: '#d9dfe3',
          200: '#b3bfc8',
          300: '#8c9eac',
          400: '#597387',
          500: '#2e4f67',
          600: '#0f3551',
          700: '#002846',
          800: '#002038',
          900: '#001a2e',
          950: '#001423',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
