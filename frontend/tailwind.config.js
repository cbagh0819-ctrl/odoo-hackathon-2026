/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Cinzel', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        odoo: {
          primary: '#714B67',
          hover: '#5e3e56',
          teal: '#017E84',
          accent: '#008784',
          gray: '#F8F9FA',
          border: '#E2E8F0',
          dark: '#212529'
        },
        crimson: {
          950: '#140104',
          900: '#2b0309',
          800: '#520712',
          700: '#820b1d',
          600: '#b91c1c',
          500: '#dc2626',
          400: '#ef4444',
          300: '#f87171',
        }
      }
    },
  },
  plugins: [],
}
