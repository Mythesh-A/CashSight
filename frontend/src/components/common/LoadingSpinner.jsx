/**
 * LoadingSpinner - Reusable loading spinner
 */
import React from 'react'

export default function LoadingSpinner({
  size = 'medium',
  message = 'Loading...',
  fullScreen = false,
}) {
  const sizes = {
    small: { width: '24px', height: '24px', border: '3px' },
    medium: { width: '48px', height: '48px', border: '4px' },
    large: { width: '64px', height: '64px', border: '5px' },
  }

  const sizeStyle = sizes[size] || sizes.medium

  const spinnerStyles = {
    display: 'inline-block',
    width: sizeStyle.width,
    height: sizeStyle.height,
    border: `${sizeStyle.border} solid #e0e0e0`,
    borderTop: `${sizeStyle.border} solid #2196F3`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }

  const containerStyles = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.9)',
    zIndex: 9999,
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  }

  return (
    <div style={containerStyles}>
      <div style={spinnerStyles} />
      {message && <p style={{ marginTop: '16px', color: '#666' }}>{message}</p>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}