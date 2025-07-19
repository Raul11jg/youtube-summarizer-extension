/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./popup.html"
  ],
  theme: {
    extend: {
      colors: {
        youtube: {
          red: '#FF0000',
          dark: '#0F0F0F',
          light: '#F9F9F9'
        }
      }
    },
  },
  plugins: [],
}