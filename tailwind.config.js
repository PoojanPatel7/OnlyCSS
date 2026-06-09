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
          bg: '#050508',
          surface: '#0a0a0f',
          card: '#111118',
          border: '#ffffff1a',
        },
        accent: {
          purple: '#8b5cf6',
          cyan: '#22d3ee',
          pink: '#f472b6',
          gold: '#fbbf24',
        },
        text: {
          primary: '#ffffff',
          muted: '#94a3b8',
        },
        status: {
          success: '#34d399',
          warning: '#fbbf24',
          danger: '#f87171',
        }
      },
      fontFamily: {
        heading: ['"Clash Display"', 'sans-serif'],
        code: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-xy': 'gradient-xy 8s ease infinite',
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
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))' },
          '100%': { filter: 'drop-shadow(0 0 25px rgba(34, 211, 238, 0.8)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.6))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'gradient-xy': {
          '0%, 100%': { backgroundSize: '400% 400%', backgroundPosition: 'left center' },
          '50%': { backgroundSize: '200% 200%', backgroundPosition: 'right center' },
        }
      }
    },
  },
  plugins: [],
}
