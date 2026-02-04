/** @type {import('tailwindcss').Config} */
const path = require('path');
// Resolve content relative to this config file so Tailwind finds classes regardless of build CWD
const contentDir = path.resolve(__dirname, 'src');
module.exports = {
  content: [`${contentDir}/**/*.{html,ts}`],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#ecfdf8',
          100: '#d1faf0',
          200: '#a7f3e1',
          300: '#6ee7ce',
          400: '#34d3b4',
          500: '#10b99a',
          600: '#059682',
          700: '#04786a',
          800: '#065f56',
          900: '#064e47',
          950: '#022c26',
        },
        surface: {
          light: '#f8fafc',
          card: '#ffffff',
          dark: '#0f172a',
          'card-dark': '#1e293b',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.2)',
        'glow': '0 0 0 3px rgb(16 185 154 / 0.2)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
