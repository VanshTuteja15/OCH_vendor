/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        och: {
          teal: '#00756A',
          'teal-dark': '#005a51',
          'teal-light': '#e6f4f3',
          blue: '#1a3a5c',
          sky: '#4a9aba',
        },
        accent: '#f4a024',
        danger: '#c0392b',
        success: '#27ae60',
        warn: '#e67e22',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        'card-sm': '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
