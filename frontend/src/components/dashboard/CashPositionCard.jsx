/**
 * CashPositionCard - Display cash position with proper labels
 */
import React from 'react'
import { Card } from '../common'
import { currency } from '../../utils/formatters'

export default function CashPositionCard({ 
  title, 
  amount, 
  subtitle, 
  variant = 'default',
  displayText = null  // 🔥 NEW: Optional custom display text
}) {
  const variants = {
    success: {
      icon: '✅',
      amountColor: '#2e7d32',
    },
    warning: {
      icon: '⏳',
      amountColor: '#e65100',
    },
    primary: {
      icon: '📋',
      amountColor: '#0d47a1',
    },
    default: {
      icon: '💰',
      amountColor: '#1a1a2e',
    },
  }

  const config = variants[variant] || variants.default

  return (
    <Card variant={variant}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: config.amountColor,
        }}>
          {currency(amount)}
        </div>
        {displayText ? (
          <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            {displayText}
          </div>
        ) : subtitle && (
          <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </Card>
  )
}