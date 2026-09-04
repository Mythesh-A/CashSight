/**
 * Button - Reusable button component with variants
 */
import React from 'react'

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  icon = null,
  ...props
}) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      color: 'white',
      hoverBackground: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
    },
    secondary: {
      background: '#6c757d',
      color: 'white',
      hoverBackground: '#5a6268',
    },
    success: {
      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
      color: 'white',
      hoverBackground: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
    },
    danger: {
      background: '#dc3545',
      color: 'white',
      hoverBackground: '#c82333',
    },
    warning: {
      background: '#ff9800',
      color: 'white',
      hoverBackground: '#e68900',
    },
    outline: {
      background: 'transparent',
      color: '#2196F3',
      hoverBackground: '#e3f2fd',
      border: '2px solid #2196F3',
    },
    ghost: {
      background: 'transparent',
      color: '#333',
      hoverBackground: '#f5f5f5',
    },
  }

  const sizes = {
    small: { padding: '6px 16px', fontSize: '13px' },
    medium: { padding: '10px 24px', fontSize: '15px' },
    large: { padding: '14px 32px', fontSize: '17px' },
  }

  const variantStyle = variants[variant] || variants.primary
  const sizeStyle = sizes[size] || sizes.medium

  const styles = {
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    background: variantStyle.background,
    color: variantStyle.color,
    border: variantStyle.border || 'none',
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: disabled || loading ? 0.6 : 1,
    boxShadow: variant === 'primary' || variant === 'success' ? '0 4px 15px rgba(0,0,0,0.15)' : 'none',
    ...(disabled || loading ? {} : { '&:hover': { background: variantStyle.hoverBackground } }),
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={styles}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {loading && <span className="spinner">⏳</span>}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  )
}