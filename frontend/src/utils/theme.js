// Rolex-inspired theme colors
export const theme = {
  colors: {
    // Main brand colors
    gold: '#A37E2C',
    green: {
      DEFAULT: '#000201', // Almost pure black with minimal green tint
      light: '#000302',   // Slightly lighter for contrast
      dark: '#000100',    // Darkest shade for active states
    },
    // UI states
    text: {
      primary: '#A37E2C',    // Gold for primary text
      secondary: '#A37E2C80', // Gold with 50% opacity
      disabled: '#A37E2C40',  // Gold with 25% opacity
    },
    background: {
      primary: '#000201',    // Darker main background
      secondary: '#000302',  // Secondary backgrounds
      active: '#000100',     // Active/Selected states
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
      base: 'bg-[#000302] text-[#A37E2C]',
      hover: 'hover:bg-[#000100] hover:text-[#A37E2C]',
      active: 'active:bg-[#000100]',
    },
    secondary: {
      base: 'bg-transparent border border-[#A37E2C20] text-[#A37E2C]',
      hover: 'hover:border-[#A37E2C40] hover:text-[#A37E2C]',
      active: 'active:bg-[#000100]',
    },
  },
  input: {
    base: 'bg-[#000302] text-[#A37E2C] placeholder-[#A37E2C40]',
    focus: 'focus:ring-1 focus:ring-[#A37E2C] focus:outline-none',
  },
  dropdown: {
    base: 'bg-[#000302] border border-[#A37E2C20]',
    hover: 'hover:bg-[#000100]',
  },
  // Add felt texture utility classes
  feltTexture: {
    base: 'relative before:absolute before:inset-0 before:bg-[radial-gradient(#000302_0.75px,transparent_0.75px)] before:bg-[length:3px_3px] before:opacity-50 before:pointer-events-none before:content-[""] before:-z-10',
  }
}; 