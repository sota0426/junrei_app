/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        junrei: {
          bg: '#1a1a2e',
          surface: '#16213e',
          accent: '#e94560',
          gold: '#f5c542',
          text: '#eaeaea',
          muted: '#8892a8',
        },
      },
    },
  },
  plugins: [],
};
