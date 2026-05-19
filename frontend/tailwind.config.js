/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        teal: {
          DEFAULT: '#1A3C38',
          soft: '#234B47',
          muted: '#2E5D58',
        },
        accent: {
          DEFAULT: '#2D9F8B',
          light: '#4DB8A4',
          dark: '#238573',
        },
        cream: {
          DEFAULT: '#FBF9F6',
          soft: '#F5F2EC',
          dim: '#E8E3DA',
        },
        slate: {
          DEFAULT: '#2D3748',
          soft: '#4A5568',
          muted: '#718096',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-10px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
