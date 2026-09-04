/**
 * Card - Reusable card component
 */
import React from 'react'

export default function Card({
  children,
  title,
  subtitle,
  icon,
  className = '',
  variant = 'default',
  onClick,
  ...props
}) {
  const variants = {
    default: {
      background: 'white',
      border: '1px solid #e9ecef',
    },
    primary: {
      background: '#e3f2fd',
      border: '1px solid #90caf9',
    },
    success: {
      background: '#e8f5e9',
      border: '1px solid #a5d6a7',
    },
    warning: {
      background: '#fff3e0',
      border: '1px solid #ffcc80',
    },
    danger: {
      background: '#ffebee',
      border: '1px solid #ef9a9a',
    },
  }

  const variantStyle = variants[variant] || variants.default

  const styles = {
    background: variantStyle.background,
    border: variantStyle.border,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
  }

  return (
    <div style={styles} className={`card card-${variant} ${className}`} onClick={onClick} {...props}>
      {(title || icon) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
          <div>
            {title && <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{title}</h3>}
            {subtitle && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}