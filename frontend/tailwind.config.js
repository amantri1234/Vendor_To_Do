/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0D0D',
          soft: '#1A1A1A',
          muted: '#2E2E2E',
        },
        paper: {
          DEFAULT: '#F5F2EB',
          soft: '#EDE9DF',
          dim: '#D9D4C7',
        },
        accent: {
          DEFAULT: '#E85D26',
          light: '#F07A49',
          dark: '#C44A18',
        },
        status: {
          pending: '#F59E0B',
          'in-progress': '#3B82F6',
          completed: '#10B981',
        },
        priority: {
          low: '#6EE7B7',
          medium: '#FCD34D',
          high: '#FCA5A5',
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
