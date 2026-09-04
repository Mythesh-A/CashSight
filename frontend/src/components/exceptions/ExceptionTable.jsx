/**
 * ExceptionTable - Display exceptions in a table with single action button
 */
import React, { useState } from 'react'
import { Card, Button, StatusBadge } from '../common'
import { currency, exceptionTypeLabel, exceptionTypeIcon } from '../../utils/formatters'

export default function ExceptionTable({ exceptions, onSelect }) {
  const [sortField, setSortField] = useState('amount')
  const [sortDirection, setSortDirection] = useState('desc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedExceptions = [...exceptions].sort((a, b) => {
    let aVal, bVal
    switch (sortField) {
      case 'amount':
        aVal = a.amount || a.net_amount || 0
        bVal = b.amount || b.net_amount || 0
        break
      case 'type':
        aVal = a.exception_type || a.type || ''
        bVal = b.exception_type || b.type || ''
        break
      case 'id':
        aVal = a.settlement_id || a.id || ''
        bVal = b.settlement_id || b.id || ''
        break
      default:
        aVal = a.amount || 0
        bVal = b.amount || 0
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getStatusColor = (type) => {
    const colors = {
      missing_bank_credit: 'error',
      unresolved_batch: 'warning',
      ambiguous_batch: 'warning',
      unlinked_credit: 'info',
    }
    return colors[type] || 'warning'
  }

  return (
    <Card title="📋 Exception List">
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
              <th 
                onClick={() => handleSort('type')}
                style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer' }}
              >
                Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('id')}
                style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer' }}
              >
                ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('amount')}
                style={{ padding: '12px 16px', textAlign: 'right', cursor: 'pointer' }}
              >
                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Detail</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedExceptions.map((exception, index) => {
              const type = exception.exception_type || exception.type || 'unknown'
              const amount = exception.amount || exception.net_amount || 0
              const id = exception.settlement_id || exception.id || exception.txn_id || 'N/A'

              return (
                <tr 
                  key={index}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{exceptionTypeIcon(type)}</span>
                      <StatusBadge 
                        status={getStatusColor(type)}
                        label={exceptionTypeLabel(type)}
                        size="small"
                        showIcon={false}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px' }}>
                    {id}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>
                    {currency(amount)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                    {exception.detail || exception.details || 'No details available'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Button 
                      variant="primary" 
                      size="small" 
                      onClick={() => onSelect(exception)}
                      icon="🔍"
                    >
                      View & Resolve
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}