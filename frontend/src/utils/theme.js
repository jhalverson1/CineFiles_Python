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
      secondary: '#FFFFFF',
      tertiary: '#F5F5F5',
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
  },
  filter: {
    container: 'fixed top-0 right-0 h-full w-[400px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto',
    header: 'sticky top-0 z-10 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between',
    section: 'px-6 py-4 border-b border-gray-200',
    button: {
      base: 'w-full px-4 py-2 text-sm font-medium text-left rounded-lg transition-colors duration-200',
      active: 'bg-black text-white hover:bg-gray-900',
      inactive: 'border border-black text-black hover:bg-black hover:text-white'
    },
    range: `w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
            focus:outline-none focus:ring-2 focus:ring-black
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-black
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-black
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer`,
    select: 'w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black',
    checkbox: {
      base: 'sr-only',
      label: 'ml-2 text-sm text-gray-900'
    },
    tag: {
      base: 'inline-flex items-center px-3 py-1 rounded-full text-sm',
      active: 'bg-black text-white',
      inactive: 'bg-gray-100 text-black hover:bg-gray-200'
    }
  },
  header: {
    container: 'fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg',
    backdrop: 'absolute inset-0 bg-white',
    content: 'relative container mx-auto px-4 md:px-8 lg:px-12',
    toolbar: 'py-4',
    button: {
      base: 'p-2 rounded-lg transition-colors',
      active: 'bg-black text-white hover:bg-gray-900',
      inactive: 'text-black hover:bg-black hover:text-white'
    }
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
  
  filter: {
    appliedFilters: 'flex flex-wrap gap-2 px-6 py-4',
    filterTag: 'inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100',
    clearButton: 'ml-2 text-gray-500 hover:text-gray-700',
    expandIcon: 'w-5 h-5 transform transition-transform duration-200',
    expanded: 'rotate-180',
    count: 'ml-2 text-sm text-gray-500',
    priceRange: 'flex items-center gap-4',
    priceInput: 'w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black',
    colorSwatch: 'w-6 h-6 rounded-full border border-gray-200',
    sizeGrid: 'grid grid-cols-3 gap-2',
    sizeButton: 'px-4 py-2 text-sm border rounded-md hover:border-black transition-colors',
    sortButton: 'flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100'
  }
}; 