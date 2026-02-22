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
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-light': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-in-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'pulse-light': 'pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}