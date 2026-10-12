/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        ios: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif'
        ],
      },
      colors: {
        ios: {
          blue: '#007AFF',
          indigo: '#5856D6',
          purple: '#AF52DE',
          pink: '#FF2D55',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          mint: '#00C7BE',
          teal: '#30B0C7',
          cyan: '#32ADE6',
          // System background colors (Light)
          bg: '#F2F2F7',
          card: '#FFFFFF',
          secondaryCard: '#F7F7F9',
          border: '#E5E5EA',
          separator: 'rgba(60, 60, 67, 0.12)',
          text: '#000000',
          secondaryText: '#8E8E93',
          tertiaryText: '#AEAEB2',
          // System background colors (Dark)
          darkBg: '#000000',
          darkCard: '#1C1C1E',
          darkSecondaryCard: '#2C2C2E',
          darkBorder: '#38383A',
          darkSeparator: 'rgba(84, 84, 88, 0.36)',
          darkText: '#FFFFFF',
          darkSecondaryText: '#8E8E93',
        }
      },
      boxShadow: {
        'ios-sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'ios-card': '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'ios-sheet': '0 -8px 24px rgba(0, 0, 0, 0.12)',
        'ios-float': '0 8px 25px -4px rgba(0, 122, 255, 0.35)',
      },
      borderRadius: {
        'ios-xs': '6px',
        'ios-sm': '10px',
        'ios-md': '14px',
        'ios-lg': '20px',
        'ios-xl': '28px',
      }
    },
  },
  plugins: [],
}
