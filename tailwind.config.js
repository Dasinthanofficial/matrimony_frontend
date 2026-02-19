// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#fdf2f1',
          100: '#fce4e2',
          200: '#f9ccc8',
          300: '#f4a8a1',
          400: '#eb7c72',
          500: '#c7837b',
          600: '#b06b63',
          700: '#8a5e5a',
          800: '#6d4a47',
          900: '#5c403e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 40px rgba(199, 131, 123, 0.15)',
        'glow-lg': '0 0 60px rgba(199, 131, 123, 0.2)',
      },
    },
  },
  plugins: [],
};