/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant custom palette
        'neon-pink': '#FF006E',
        'neon-magenta': '#D946EF',
        'neon-teal': '#06B6D4',
        'neon-orange': '#FF6B35',
        'neon-yellow': '#FFD60A',
        'neon-red': '#FF0000',
        'neon-purple': '#7C3AED',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-vibrant': 'linear-gradient(135deg, #FF006E 0%, #D946EF 25%, #06B6D4 50%, #FF6B35 75%, #FFD60A 100%)',
      },
    },
  },
  plugins: [],
}
