/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        gold: '#A37E2C',
        green: {
          DEFAULT: '#002419',
          light: '#003D23',
          dark: '#001A12',
        },
        // Semantic colors
        primary: '#A37E2C',
        background: {
          DEFAULT: '#002419',
          secondary: '#003D23',
          active: '#001A12',
          darker: '#001208',
        },
        text: {
          primary: '#A37E2C',
          secondary: '#A37E2C80',
          disabled: '#A37E2C40',
        },
        border: {
          DEFAULT: '#A37E2C20',
          hover: '#A37E2C40',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      backgroundImage: {
        'felt-texture': 'radial-gradient(#002419 1px, transparent 1px)',
      },
      backgroundSize: {
        'felt': '4px 4px',
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
        }
      })
    }
  ],
}

