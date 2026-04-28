/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary:   { 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        accent:    { 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
        emerald:   { 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669' },
        surface:   { 700: '#2d2a3e', 800: '#1e1b2e', 850: '#171526', 900: '#0f0d1a' },
        danger:    { 300: '#fca5a5', 400: '#f87171', 500: '#ef4444' },
        success:   { 300: '#86efac', 400: '#4ade80', 500: '#22c55e' },
        warning:   { 300: '#fde68a', 400: '#fbbf24', 500: '#f59e0b' },
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease-out',
        'slide-up':     'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':    'spin 2s linear infinite',
        'bounce-slow':  'bounce 2s infinite',
        'glow':         'glow 2s ease-in-out infinite alternate',
        'shimmer':      'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:      { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        glow:         { '0%': { boxShadow: '0 0 20px rgba(139,92,246,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(139,92,246,0.6)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
