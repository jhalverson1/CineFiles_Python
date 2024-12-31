// Dark elegant theme with subtle green tints
export const theme = {
  colors: {
    // Main brand colors
    emerald: {
      DEFAULT: '#1A3B31', // Muted emerald
      light: '#234A3E',   // Slightly lighter emerald
      dark: '#0A1613',    // Very dark emerald, almost black
      muted: '#1A3B3180'  // Transparent version for overlays
    },
    gold: {
      DEFAULT: '#C4A052', // Warm gold
      light: '#D4B76B',   // Lighter gold for hover
      dark: '#A68939',    // Darker gold for active states
      muted: '#C4A05240'  // Transparent version for subtle elements
    },
    cream: '#F5F0E5',     // Warm cream for contrast
    // UI states
    text: {
      primary: '#F5F0E5',    // Cream for primary text
      secondary: '#F5F0E580', // Semi-transparent cream
      disabled: '#F5F0E540',  // More transparent cream
      inverse: '#1A3B31'      // Green for light backgrounds
    },
    background: {
      primary: '#0A0D0C',    // Darker almost black with slight green tint
      secondary: '#0E1210',  // Slightly lighter dark background
      tertiary: '#0F1512',   // Dark background for navbar and highlights
      accent: '#C4A05210'    // Very subtle gold tint
    },
    border: {
      DEFAULT: '#C4A05220',  // Subtle gold border
      hover: '#C4A05240',    // More visible on hover
      active: '#C4A05260'    // Most visible for active states
    }
  }
};

// Utility function to get nested color values
export const getColor = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme.colors) || path;
};

// Common color combinations for reuse
export const colorVariants = {
  button: {
    primary: {
      base: 'bg-[#C4A052] text-[#0C1311]',
      hover: 'hover:bg-[#D4B76B]',
      active: 'active:bg-[#A68939]',
    },
    secondary: {
      base: 'bg-transparent border border-[#C4A05240] text-[#C4A052]',
      hover: 'hover:border-[#C4A05260] hover:bg-[#C4A05210]',
      active: 'active:bg-[#C4A05220]',
    },
  },
  input: {
    base: 'bg-[#111916] text-[#F5F0E5] placeholder-[#F5F0E580]',
    focus: 'focus:ring-1 focus:ring-[#C4A052] focus:outline-none',
  },
  dropdown: {
    base: 'bg-[#111916] border border-[#C4A05220]',
    hover: 'hover:bg-[#1A3B31]',
  },
  feltTexture: {
    base: 'felt-texture',
  },
  dotTexture: {
    base: 'dot-texture',
  },
  layout: {
    page: 'min-h-screen bg-[#0C1311] dot-texture text-[#F5F0E5]',
    section: 'bg-[#111916] rounded-lg p-6',
    card: 'bg-[#111916] rounded-lg p-4 border border-[#C4A05220]'
  }
}; 