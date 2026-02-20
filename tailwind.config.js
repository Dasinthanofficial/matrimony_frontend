// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          50:  '#fdf2f1',
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
        glow:    '0 0 40px rgba(199, 131, 123, 0.15)',
        'glow-lg':'0 0 60px rgba(199, 131, 123, 0.2)',
      },
      keyframes: {
        'toast-slide-up': {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-up': {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        }
      },
      animation: {
        'toast-slide-up': 'toast-slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-up': 'scale-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};