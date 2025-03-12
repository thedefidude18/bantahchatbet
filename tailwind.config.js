/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // This makes Poppins the default font
      },
      colors: {
        dark: {
          bg: '#000000',
          card: '#242538',
          text: '#ffffff',
        },
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          text: '#000000',
        },
      },
      keyframes: {
        'notification-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'message-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'wallet-pulse': {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(204, 255, 0, 0.7)' },
          '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(204, 255, 0, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(204, 255, 0, 0)' },
        },
      },
      animation: {
        'notification-pulse': 'notification-pulse 2s ease-in-out',
        'message-pulse': 'message-pulse 2s ease-in-out',
        'wallet-pulse': 'wallet-pulse 2s cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
  },
  plugins: [],
};
