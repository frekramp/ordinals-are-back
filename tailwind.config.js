/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bitcoin: {
          orange: '#F7931A',
          dark: '#1a1a1a',
          darker: '#0d0d0d',
          gold: '#FFD700',
        }
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #F7931A, 0 0 10px #F7931A' },
          '100%': { boxShadow: '0 0 20px #F7931A, 0 0 30px #F7931A' },
        }
      }
    },
  },
  plugins: [],
}
