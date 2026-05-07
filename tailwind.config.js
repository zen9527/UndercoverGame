/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/client/**/*.html",
    "./src/client/**/*.tsx",
  ],
  theme: {
    extend: {
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))' },
          '100%': { filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))' },
        },
        shimmer: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      },
    },
  },
  plugins: [],
};
