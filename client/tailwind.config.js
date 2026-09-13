/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Karla', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
        display: ['Fraunces', 'serif'],
      },
      colors: {
        cream: {
          DEFAULT: '#FAF6F0',
          dark: '#F3ECE1',
        },
        terracotta: {
          DEFAULT: '#C1502E',
          hover: '#AA4222',
          light: 'rgba(193, 80, 46, 0.12)',
        },
        sand: {
          DEFAULT: '#EFE7DC',
          dark: '#E2D7C7',
          light: '#F8F4EE',
        },
        ink: {
          DEFAULT: '#2B2B2B',
          muted: '#6E6862',
          faint: '#9E968E',
          border: '#DDD5C8',
        },
        sage: {
          DEFAULT: '#4A6C4A',
          hover: '#3D593D',
          light: 'rgba(74, 108, 74, 0.15)',
        },
      },
    },
  },
  plugins: [],
}
