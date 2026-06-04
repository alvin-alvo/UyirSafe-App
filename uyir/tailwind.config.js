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
    },
  },
  plugins: [],
};