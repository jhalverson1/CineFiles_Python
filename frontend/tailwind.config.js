/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Brand colors
        emerald: {
          DEFAULT: '#1A3B31',
          light: '#234A3E',
          dark: '#0A1613',
          muted: '#1A3B3180'
        },
        gold: {
          DEFAULT: '#C4A052',
          light: '#D4B76B',
          dark: '#A68939',
          muted: '#C4A05240'
        },
        cream: '#F5F0E5',
        // Semantic colors
        primary: '#1A3B31',
        background: {
          DEFAULT: '#0C1311',
          secondary: '#111916',
          tertiary: '#1A3B31',
          accent: '#C4A05210'
        },
        text: {
          primary: '#F5F0E5',
          secondary: '#F5F0E580',
          disabled: '#F5F0E540',
          inverse: '#1A3B31'
        },
        border: {
          DEFAULT: '#C4A05220',
          hover: '#C4A05240',
          active: '#C4A05260'
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      backgroundImage: {
        'dots': 'radial-gradient(circle, #234A3E 1.25px, transparent 1.25px)',
        'felt': 'radial-gradient(#C4A052 1px, transparent 1px)',
      },
      backgroundSize: {
        'dots': '20px 20px',
        'felt': '12px 12px',
      },
      opacity: {
        '15': '0.15',
        '5': '0.05',
        '25': '0.25',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.felt-texture': {
          'position': 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0',
            'background-image': 'radial-gradient(#C4A052 1px, transparent 1px)',
            'background-size': '12px 12px',
            opacity: '0.15',
            'pointer-events': 'none',
            'z-index': '-1',
          }
        },
        '.dot-texture': {
          'position': 'relative',
          'background-color': '#0C1311',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0',
            'background-image': 'radial-gradient(circle, #3D5C4D 1.25px, transparent 1.25px)',
            'background-size': '20px 20px',
            opacity: '0.25',
            'pointer-events': 'none',
            'z-index': '0',
          }
        }
      })
    }
  ],
}

