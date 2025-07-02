// Dark Terminal Theme Colors for Admin Pages
export const ADMIN_COLORS = {
  // Backgrounds
  pageBackground: '#0f0f23',        // Darkest - full page background
  surfaceBackground: '#1e1e2e',     // Medium - main content areas (papers, cards)
  hoverBackground: '#282a36',       // Lighter - hover states and interactive elements
  
  // Text
  primaryText: '#f8f8f2',           // Main text color
  secondaryText: '#6272a4',         // Muted text, timestamps, etc.
  
  // Accents
  primary: '#50fa7b',               // Main accent - headers, success, active states
  primaryBright: '#69ff94',         // Brighter version for hover effects
  secondary: '#8be9fd',             // Secondary accent - icons, links
  warning: '#f1fa8c',               // Warning/pending states
  error: '#ff5555',                 // Error/cancelled states
  magenta: '#ff79c6',               // Special accent - admin badges, chips
  
  // Borders
  border: '#6272a4',                // Standard border color
  
  // Typography
  fontFamily: 'monospace',          // Consistent terminal-style font
};

// Helper function to get consistent styling objects
export const getAdminStyles = () => ({
  pageContainer: {
    backgroundColor: ADMIN_COLORS.pageBackground,
    minHeight: '100vh'
  },
  
  tabBar: {
    backgroundColor: ADMIN_COLORS.surfaceBackground,
    border: `1px solid ${ADMIN_COLORS.border}`
  },
  
  contentPaper: {
    backgroundColor: ADMIN_COLORS.surfaceBackground,
    border: `1px solid ${ADMIN_COLORS.border}`
  },
  
  card: {
    backgroundColor: ADMIN_COLORS.surfaceBackground,
    border: `1px solid ${ADMIN_COLORS.border}`,
    '&:hover': {
      backgroundColor: ADMIN_COLORS.hoverBackground,
      borderColor: ADMIN_COLORS.primary
    }
  },
  
  primaryText: {
    color: ADMIN_COLORS.primaryText,
    fontFamily: ADMIN_COLORS.fontFamily
  },
  
  primaryHeading: {
    color: ADMIN_COLORS.primary,
    fontFamily: ADMIN_COLORS.fontFamily,
    fontWeight: 'bold'
  },
  
  secondaryText: {
    color: ADMIN_COLORS.secondaryText,
    fontFamily: ADMIN_COLORS.fontFamily
  }
}); 