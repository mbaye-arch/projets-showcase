/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fcf8',
          100: '#ddf8ee',
          200: '#b9f1dd',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Sora', 'Manrope', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 20px 38px -28px rgba(15, 23, 42, 0.5)',
        glow: '0 14px 32px -16px rgba(16, 185, 129, 0.8)'
      }
    }
  },
  plugins: []
};
