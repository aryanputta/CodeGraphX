/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50:  '#f8f8ff',
          900: '#07070f',
          800: '#0d0d1a',
          700: '#111120',
          600: '#161628',
          500: '#1c1c32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 10px rgba(6,182,212,0.2)' },
          to:   { boxShadow: '0 0 25px rgba(6,182,212,0.5), 0 0 50px rgba(6,182,212,0.2)' },
        },
      },
    },
  },
  plugins: [],
}
