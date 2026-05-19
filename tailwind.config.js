/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#0a0a0f',
          surface: '#111118',
          card: '#16161f',
          border: '#2a2a3a',
        },
        accent: {
          purple: '#7c3aed',
          cyan: '#06b6d4',
          pink: '#ec4899',
        },
        text: {
          primary: '#f1f5f9',
          muted: '#64748b',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        heading: ['"Clash Display"', 'sans-serif'],
        code: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shine: {
          '100%': { transform: 'translateX(200%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px rgba(124, 58, 237, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 30px rgba(124, 58, 237, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
