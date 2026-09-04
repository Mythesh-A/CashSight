/**
 * MatchTable - Display matched records in a table
 */
import React, { useState } from 'react'
import { Card, Button, StatusBadge } from '../common'
import { currency, matchTypeLabel } from '../../utils/formatters'

export default function MatchTable({ matches, onSelect }) {
  const [sortField, setSortField] = useState('settlement_id')
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedMatches = [...matches].sort((a, b) => {
    let aVal, bVal
    switch (sortField) {
      case 'settlement_id':
        aVal = a.settlement_id || ''
        bVal = b.settlement_id || ''
        break
      case 'match_type':
        aVal = a.match_type || ''
        bVal = b.match_type || ''
        break
      case 'net_amount':
        aVal = a.net_amount || a.gross_amount || 0
        bVal = b.net_amount || b.gross_amount || 0
        break
      case 'order_count':
        aVal = a.order_ids?.length || 0
        bVal = b.order_ids?.length || 0
        break
      default:
        aVal = a.settlement_id || ''
        bVal = b.settlement_id || ''
    }

    if (typeof aVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  return (
    <Card title="📋 Matched Records">
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
              <th 
                onClick={() => handleSort('settlement_id')}
                style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer' }}
              >
                Settlement ID {sortField === 'settlement_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('match_type')}
                style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer' }}
              >
                Match Type {sortField === 'match_type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>UTR</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Bank TXN</th>
              <th 
                onClick={() => handleSort('order_count')}
                style={{ padding: '12px 16px', textAlign: 'center', cursor: 'pointer' }}
              >
                Orders {sortField === 'order_count' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('net_amount')}
                style={{ padding: '12px 16px', textAlign: 'right', cursor: 'pointer' }}
              >
                Amount {sortField === 'net_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedMatches.map((match, index) => {
              const amount = match.net_amount || match.gross_amount || 0
              const orderCount = match.order_ids?.length || 0

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
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px' }}>
                    {match.settlement_id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge 
                      status={match.match_type === 'clean' ? 'success' : 'info'}
                      label={matchTypeLabel(match.match_type)}
                      size="small"
                      showIcon={false}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px' }}>
                    {match.utr || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px' }}>
                    {match.bank_txn_id || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      background: '#e3f2fd',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#0d47a1',
                    }}>
                      {orderCount}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>
                    {currency(amount)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Button 
                      variant="primary" 
                      size="small" 
                      onClick={() => onSelect(match)}
                      icon="🔍"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: '#666',
      }}>
        <span>Showing {matches.length} matched records</span>
        <span>Total Amount: {currency(matches.reduce((sum, m) => sum + (m.net_amount || m.gross_amount || 0), 0))}</span>
      </div>
    </Card>
  )
}