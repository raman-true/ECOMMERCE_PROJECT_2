/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brown: {
          900: '#3B2415', // Dark brown
          700: '#693F26', // Medium brown
          500: '#A26F25', // Khaki
          300: '#D5C2A5', // Tan
          100: '#ECD8B1', // Cream
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};