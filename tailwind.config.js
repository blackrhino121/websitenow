/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        // Rivix Brand Colors - Premium Hosting Palette
        'rivix-primary': '#6366f1',      // Electric Indigo - Primary CTA & main accent
        'rivix-secondary': '#8b5cf6',    // Violet - Secondary accent & highlights
        'rivix-accent': '#8B5CF6',       // Vibrant Purple - Secondary accent & highlights
        'rivix-highlight': '#a78bfa',    // Light Violet - Special highlights
        
        // Legacy support (mapped to new colors for backward compatibility)
        'rivix-orange': '#06B6D4',       // Maps to primary
        'rivix-green': '#10B981',        // Maps to secondary
        'rivix-blue': '#8B5CF6',         // Maps to accent
        'rivix-cyan': '#22D3EE',         // Maps to highlight
        'rivix-purple': '#8B5CF6',       // Same as accent
        'rivix-pink': '#EC4899',         // Kept for specific use cases
        
        // Dark Theme Base
        'dark-bg': '#0F172A',
        'dark-card': '#1E293B',
      },
      backdropBlur: {
        'glass': '10px',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))',
      },
      keyframes: {
        'blink-glow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.3)'
          },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)'
          },
        },
      },
      animation: {
        'blink-glow': 'blink-glow 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

