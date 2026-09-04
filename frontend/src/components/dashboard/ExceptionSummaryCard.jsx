/**
 * ExceptionSummaryCard - Display exceptions summary with View All button
 */
import React from 'react'
import { Card, Button, StatusBadge } from '../common'
import { currency, exceptionTypeLabel, exceptionTypeIcon } from '../../utils/formatters'

export default function ExceptionSummaryCard({ 
  count, 
  amount, 
  exceptions = [], 
  onViewAll 
}) {
  return (
    <Card 
      title="Exceptions" 
      icon="⚠️"
      subtitle={`${count} exceptions • ${currency(amount)}`}
      variant="warning"
    >
      {exceptions.length > 0 ? (
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          {exceptions.map((exception, index) => {
            const type = exception.exception_type || exception.type || 'unknown'
            return (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: index < exceptions.length - 1 ? '1px solid #f0f0f0' : 'none',
                  fontSize: '13px',
                }}
              >
                <span style={{ fontFamily: 'monospace' }}>
                  {exception.settlement_id || exception.id || 'N/A'}
                </span>
                <span>
                  <StatusBadge 
                    status={type === 'missing_bank_credit' ? 'error' : 'warning'}
                    label={exceptionTypeLabel(type)}
                    size="small"
                    showIcon={false}
                  />
                </span>
                <span style={{ fontWeight: '500' }}>
                  {currency(exception.amount || exception.net_amount || 0)}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#2e7d32' }}>
          🎉 No exceptions! All settlements matched.
        </div>
      )}
      
      {/* 🔥 View All Exceptions Button */}
      {count > 0 && onViewAll && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <Button 
            variant="warning" 
            size="small" 
            onClick={onViewAll}
            icon="🚨"
          >
            View All {count} Exceptions →
          </Button>
        </div>
      )}
    </Card>
  )
}