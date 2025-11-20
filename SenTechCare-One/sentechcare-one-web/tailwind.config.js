/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9dcff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#172554'
        }
      },
      boxShadow: {
        panel: '0 18px 45px rgba(15, 23, 42, 0.08)',
        soft: '0 10px 30px rgba(15, 23, 42, 0.07)'
      }
    }
  },
  plugins: []
};
