/**
 * ReportCard - Individual report card component
 */
import React from 'react'
import { Button } from '../common'

export default function ReportCard({ 
  title, 
  description, 
  isPrimary = false, 
  isLoading = false,
  onDownload 
}) {
  return (
    <div style={{
      background: isPrimary ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'white',
      padding: '24px',
      borderRadius: '12px',
      border: isPrimary ? '2px solid #2196F3' : '1px solid #e9ecef',
      boxShadow: isPrimary ? '0 8px 30px rgba(33,150,243,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{
        fontSize: isPrimary ? '28px' : '24px',
        marginBottom: '12px',
      }}>
        {title.split(' ')[0]}
      </div>
      
      <h3 style={{
        margin: 0,
        fontSize: isPrimary ? '18px' : '16px',
        fontWeight: isPrimary ? '700' : '600',
        color: isPrimary ? 'white' : '#1a1a2e',
      }}>
        {title}
      </h3>
      
      <p style={{
        margin: '8px 0 16px 0',
        fontSize: '13px',
        color: isPrimary ? 'rgba(255,255,255,0.7)' : '#666',
        lineHeight: '1.5',
        flex: 1,
      }}>
        {description}
      </p>
      
      {isPrimary && (
        <div style={{
          marginBottom: '12px',
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
        }}>
          ⭐ Recommended — Complete financial operations report
        </div>
      )}
      
      <Button
        variant={isPrimary ? 'primary' : 'secondary'}
        size="medium"
        onClick={onDownload}
        disabled={isLoading}
        icon={isLoading ? '⏳' : '📥'}
        style={{
          width: '100%',
          justifyContent: 'center',
        }}
      >
        {isLoading ? 'Generating...' : 'Download PDF'}
      </Button>
    </div>
  )
}