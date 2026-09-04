/**
 * ThemeContext - Single theme configuration (no dark/light mode)
 * Future: Add dark/light mode support here
 */
import React, { createContext, useContext } from 'react'

// Single theme configuration
const theme = {
  colors: {
    // Primary colors
    primary: '#2196F3',
    primaryDark: '#1976D2',
    primaryLight: '#e3f2fd',
    
    // Secondary colors
    secondary: '#6c757d',
    secondaryLight: '#f8f9fa',
    
    // Status colors
    success: '#4CAF50',
    successLight: '#e8f5e9',
    successDark: '#2e7d32',
    
    warning: '#FF9800',
    warningLight: '#fff3e0',
    warningDark: '#e65100',
    
    danger: '#DC3545',
    dangerLight: '#ffebee',
    dangerDark: '#c62828',
    
    info: '#17A2B8',
    infoLight: '#e3f2fd',
    
    // Neutral colors
    white: '#FFFFFF',
    black: '#000000',
    gray: '#6C757D',
    grayLight: '#F8F9FA',
    grayDark: '#343A40',
    
    // Text colors
    text: '#1A1A2E',
    textSecondary: '#666666',
    textLight: '#999999',
    
    // Border colors
    border: '#E9ECEF',
    borderLight: '#F0F0F0',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundDark: '#F5F5F5',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: {
      xs: '11px',
      sm: '13px',
      md: '15px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 4px 20px rgba(0,0,0,0.12)',
    lg: '0 8px 40px rgba(0,0,0,0.16)',
  },
  
  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
  
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px',
    wide: '1200px',
  },
}

// Helper function to get color with opacity
const getColorWithOpacity = (color, opacity) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const value = {
    theme,
    getColorWithOpacity,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Export theme directly for use in styles
export { theme }