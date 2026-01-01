/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'hive': {
          'purple': '#9333EA',
          'purple-light': '#A855F7',
          'purple-dark': '#7C3AED',
          'pink': '#EC4899',
          'blue': '#3B82F6',
        },
        // Background colors
        'dark': {
          '900': '#0a0a12',
          '800': '#0f0f1a',
          '700': '#151521',
          '600': '#1a1a2e',
          '500': '#252538',
        },
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0a0a12 0%, #1a1020 50%, #150a20 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(147, 51, 234, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}