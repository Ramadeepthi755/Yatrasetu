import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          brand: '#312E81',
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          900: '#312E81',
        },
        saffron: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        teal: {
          brand: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          600: '#0D9488',
          700: '#0F766E',
        },
        ivory: {
          DEFAULT: '#FFFBF5',
          dark: '#FBF5EB',
        },
        charcoal: {
          DEFAULT: '#171717',
          light: '#262626',
        },
        slate: {
          subtle: '#64748B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
