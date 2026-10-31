/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          primary: '#714B67',
          hover: '#5e3e56',
          teal: '#017E84',
          accent: '#008784',
          gray: '#F8F9FA',
          border: '#E2E8F0',
          dark: '#212529'
        }
      }
    },
  },
  plugins: [],
}
