// Core design system inspired by adidas.com
export const theme = {
  colors: {
    // Brand colors
    brand: {
      primary: '#000000',    // Core black
      secondary: '#FFFFFF',   // Core white
      accent: '#0071AE',     // Adidas blue
      accent2: '#FF6B00',    // Vibrant orange for CTAs
    },
    // UI colors
    text: {
      primary: '#000000',
      secondary: '#767677',
      tertiary: '#C4C4C4',
      inverse: '#FFFFFF',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#ECEFF1',
      inverse: '#000000',
    },
    border: {
      light: '#ECEFF1',
      default: '#C4C4C4',
      dark: '#767677',
    },
    status: {
      error: '#FF4B4B',
      success: '#00A862',
      warning: '#FFB700',
      info: '#0071AE',
    }
  },
  
  // Typography system
  typography: {
    fonts: {
      body: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'Oswald, system-ui, -apple-system, sans-serif',
    },
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    lineHeights: {
      tight: 1.2,
      base: 1.5,
      relaxed: 1.75,
    }
  },

  // Spacing system
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation
  animation: {
    durations: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms',
    },
    easings: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
};

// Component variants based on the theme
export const variants = {
  button: {
    primary: {
      base: 'bg-black text-white font-bold py-4 px-6 transition-all duration-300',
      hover: 'hover:bg-[#1a1a1a]',
      active: 'active:bg-[#333333]',
    },
    secondary: {
      base: 'bg-white text-black border-2 border-black font-bold py-4 px-6 transition-all duration-300',
      hover: 'hover:bg-black hover:text-white',
      active: 'active:bg-[#333333]',
    },
    text: {
      base: 'bg-transparent text-black font-bold py-2 px-4 transition-all duration-300 underline-offset-4',
      hover: 'hover:underline',
      active: 'active:text-[#333333]',
    }
  },
  input: {
    base: 'bg-white border border-[#C4C4C4] text-black placeholder-[#767677] py-3 px-4 w-full transition-all duration-300',
    focus: 'focus:border-black focus:ring-1 focus:ring-black focus:outline-none',
    error: 'border-[#FF4B4B] focus:border-[#FF4B4B] focus:ring-[#FF4B4B]',
  },
  card: {
    base: 'bg-white rounded-none border border-[#ECEFF1] transition-all duration-300',
    hover: 'hover:shadow-lg',
    interactive: 'cursor-pointer hover:shadow-lg active:shadow-md',
  },
  layout: {
    container: 'max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8',
    grid: 'grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-6',
    section: 'py-8 sm:py-12 lg:py-16',
  }
};

// Utility function to get nested theme values
export const getThemeValue = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme) || path;
};

// Common class combinations for reuse
export const classes = {
  // Typography
  h1: 'font-display text-4xl font-bold leading-tight',
  h2: 'font-display text-3xl font-bold leading-tight',
  h3: 'font-display text-2xl font-bold leading-tight',
  h4: 'font-display text-xl font-bold leading-tight',
  body: 'font-body text-base leading-relaxed',
  caption: 'font-body text-sm leading-relaxed text-[#767677]',
  
  // Layout
  pageContainer: 'min-h-screen bg-white',
  contentSection: 'py-8 sm:py-12 lg:py-16',
  gridContainer: 'grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-6',
  
  // Interactive
  link: 'text-black hover:underline underline-offset-4 transition-all duration-300',
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
}; 