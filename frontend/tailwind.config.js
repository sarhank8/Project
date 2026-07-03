/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-gold': '#d9ad67',
        'bg-deep': '#0a0a0a',
        'bg-card': '#1a1a1a',
        'text-light': '#f5f5f5',
        'text-muted': '#a0a0a0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
