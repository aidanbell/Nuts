// Theme configuration for the Nuts game
export const theme = {
  colors: {
    primary: '#4a90e2',
    secondary: '#7b68ee',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    info: '#2196f3',
    
    // Game specific colors
    nut: '#8b4513',
    nutLight: '#d2691e',
    squirrel: '#ff6b6b',
    gold: '#ffd700',
    
    // Neutrals
    background: '#f5f5f5',
    surface: '#ffffff',
    border: '#e0e0e0',
    text: '#333333',
    textLight: '#666666',
    textMuted: '#999999',
    
    // UI States
    disabled: '#cccccc',
    hover: '#e3f2fd',
    active: '#bbdefb',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 20px rgba(0,0,0,0.15)',
    xl: '0 20px 40px rgba(0,0,0,0.2)',
    inset: 'inset 0 2px 4px rgba(0,0,0,0.1)',
  },
  
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Courier New", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      xxl: '32px',
      xxxl: '48px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
} as const;

export type Theme = typeof theme;
