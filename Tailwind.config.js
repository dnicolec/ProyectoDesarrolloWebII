/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#FE958F',
          hover: '#f07a73',
          light: 'rgba(254,149,143,0.12)',
        },
        cream: {
          DEFAULT: '#F3D7C2',
          light: '#FBF0E8',
          bg: '#FDF6F0',
        },
        sage: {
          DEFAULT: '#8BB6A3',
          dark: '#729e8b',
          light: 'rgba(139,182,163,0.15)',
        },
        teal: {
          DEFAULT: '#17A7A8',
          hover: '#129192',
          light: 'rgba(23,167,168,0.1)',
        },
        navy: {
          DEFAULT: '#122F51',
          light: '#1d4470',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
}