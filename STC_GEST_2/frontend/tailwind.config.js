/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1f2a',
        mist: '#f3f7f8',
        accent: '#0f766e',
        accentSoft: '#d9f3f0',
        sunrise: '#f59e0b',
        danger: '#dc2626'
      },
      boxShadow: {
        card: '0 10px 30px -15px rgba(11, 31, 42, 0.28)'
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 15% 20%, rgba(15,118,110,0.12), transparent 45%), radial-gradient(circle at 85% 0%, rgba(245,158,11,0.18), transparent 40%)'
      }
    }
  },
  plugins: []
};
