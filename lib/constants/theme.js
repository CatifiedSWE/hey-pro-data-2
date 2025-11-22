/**
 * HeyProData Theme Constants
 * 
 * Centralized color palette and design tokens for consistent styling across the application.
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    button: '#FA6E80',
    coral: '#FA6E80',
    steelBlue: '#6A89BE',
    tealBlue: '#85AAB7',
    cyanTeal: '#31A7AC',
  },

  // Background Colors
  background: {
    grey: '#F8F8F8',
    white: '#FFFFFF',
    black: '#000000',
  },

  // Gradient Definitions
  gradients: {
    // Main conic gradient used across the app
    conic: 'conic-gradient(from 0deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)',
    
    // Linear gradient overlay
    overlay: 'linear-gradient(0deg, #000000, #000000), linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)',
    
    // Custom gradient variations
    primary: 'linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)',
  },

  // Text Colors
  text: {
    primary: '#000000',
    secondary: '#6B7280',
    light: '#9CA3AF',
    white: '#FFFFFF',
  },
};

// Tailwind class utilities for gradients
export const gradientClasses = {
  conic: 'bg-[conic-gradient(from_0deg_at_50%_50%,#FA6E80_0deg,#6A89BE_144deg,#85AAB7_216deg,#31A7AC_360deg)]',
  primary: 'bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] via-[#85AAB7] to-[#31A7AC]',
};

// Common styling patterns
export const styles = {
  button: {
    primary: 'bg-[#FA6E80] hover:bg-[#e95d6f] text-white transition-colors',
    secondary: 'bg-[#F8F8F8] hover:bg-gray-200 text-black transition-colors',
  },
  card: {
    default: 'bg-white rounded-lg shadow-md',
    widget: 'bg-white rounded-xl shadow-sm',
  },
};

export default { colors, gradientClasses, styles };
