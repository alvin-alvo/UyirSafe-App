export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // React files only
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': 'var(--primary-color)', // Map CSS variables
        'red-color': 'var(--red-color)',
        'secondary-color': 'var(--secondary-color)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        'scale-in': 'scale-in 0.3s ease-out'
      }
    },
  },
  plugins: [],
};