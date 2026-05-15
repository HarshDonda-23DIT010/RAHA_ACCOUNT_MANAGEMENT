/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff0f6',
          100: '#ffe0ed',
          200: '#ffc2da',
          300: '#ff94bf',
          400: '#ff5599',
          500: '#ff1a72',
          600: '#e6005a',
          700: '#c20049',
          800: '#99003a',
          900: '#7a002f',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
