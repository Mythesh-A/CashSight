/**
 * StatusBadge - Reusable status indicator
 */
import React from 'react'

export default function StatusBadge({
  status,
  label,
  size = 'medium',
  showIcon = true,
  className = '',
}) {
  const statusConfig = {
    success: {
      icon: '✅',
      color: '#2e7d32',
      background: '#e8f5e9',
    },
    warning: {
      icon: '⚠️',
      color: '#e65100',
      background: '#fff3e0',
    },
    error: {
      icon: '❌',
      color: '#c62828',
      background: '#ffebee',
    },
    info: {
      icon: 'ℹ️',
      color: '#0d47a1',
      background: '#e3f2fd',
    },
    pending: {
      icon: '⏳',
      color: '#e65100',
      background: '#fff3e0',
    },
    resolved: {
      icon: '✅',
      color: '#2e7d32',
      background: '#e8f5e9',
    },
    ambiguous: {
      icon: '🟠',
      color: '#e65100',
      background: '#fff3e0',
    },
    missing: {
      icon: '🔴',
      color: '#c62828',
      background: '#ffebee',
    },
  }

  const config = statusConfig[status] || statusConfig.info

  const sizes = {
    small: { padding: '2px 10px', fontSize: '11px', iconSize: '12px' },
    medium: { padding: '4px 14px', fontSize: '13px', iconSize: '16px' },
    large: { padding: '6px 18px', fontSize: '15px', iconSize: '20px' },
  }

  const sizeStyle = sizes[size] || sizes.medium

  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: sizeStyle.padding,
    borderRadius: '20px',
    fontSize: sizeStyle.fontSize,
    fontWeight: '500',
    color: config.color,
    background: config.background,
    border: `1px solid ${config.background}`,
  }

  return (
    <span style={styles} className={`status-badge status-${status} ${className}`}>
      {showIcon && <span style={{ fontSize: sizeStyle.iconSize }}>{config.icon}</span>}
      {label || status}
    </span>
  )
}