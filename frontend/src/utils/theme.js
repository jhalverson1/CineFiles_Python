// Rolex-inspired theme colors
export const theme = {
  colors: {
    // Main brand colors
    gold: '#A37E2C',
    green: {
      DEFAULT: '#001810', // Darker base green
      light: '#002419',   // Slightly lighter for contrast
      dark: '#001208',    // Darkest shade for active states
    },
    // UI states
    text: {
      primary: '#A37E2C',    // Gold for primary text
      secondary: '#A37E2C80', // Gold with 50% opacity
      disabled: '#A37E2C40',  // Gold with 25% opacity
    },
    background: {
      primary: '#001810',    // Darker main background
      secondary: '#002419',  // Secondary backgrounds
      active: '#001208',     // Active/Selected states
    },
    border: {
      DEFAULT: '#A37E2C20',  // Default border color (gold with 12.5% opacity)
      hover: '#A37E2C40',    // Border hover state
    }
  },
  // Add other theme properties as needed (spacing, typography, etc.)
};

// Utility function to get nested color values
export const getColor = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme.colors) || path;
};

// Common color combinations for reuse
export const colorVariants = {
  button: {
    primary: {
      base: 'bg-[#002419] text-[#A37E2C]',
      hover: 'hover:bg-[#001208] hover:text-[#A37E2C]',
      active: 'active:bg-[#001208]',
    },
    secondary: {
      base: 'bg-transparent border border-[#A37E2C20] text-[#A37E2C]',
      hover: 'hover:border-[#A37E2C40] hover:text-[#A37E2C]',
      active: 'active:bg-[#001208]',
    },
  },
  input: {
    base: 'bg-[#002419] text-[#A37E2C] placeholder-[#A37E2C40]',
    focus: 'focus:ring-1 focus:ring-[#A37E2C] focus:outline-none',
  },
  dropdown: {
    base: 'bg-[#002419] border border-[#A37E2C20]',
    hover: 'hover:bg-[#001208]',
  },
  // Add felt texture utility classes
  feltTexture: {
    base: 'relative before:absolute before:inset-0 before:bg-[radial-gradient(#002419_1px,transparent_1px)] before:bg-[length:4px_4px] before:opacity-50 before:pointer-events-none before:content-[""]',
  }
}; 