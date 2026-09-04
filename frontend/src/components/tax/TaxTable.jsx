/**
 * TaxTable - Settlement-level tax analysis table
 */
import React, { useState } from 'react'
import { Card, Button, StatusBadge } from '../common'
import { currency } from '../../utils/formatters'

export default function TaxTable({ settlements, onViewDetails }) {
  const [sortField, setSortField] = useState('settlement_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [filter, setFilter] = useState('all')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getFilteredSettlements = () => {
    if (filter === 'all') return settlements
    if (filter === 'valid') return settlements.filter(s => s.is_valid)
    if (filter === 'mismatch') return settlements.filter(s => !s.is_valid)
    return settlements
  }

  const sortedSettlements = [...getFilteredSettlements()].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''

    if (typeof aVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  if (!settlements || settlements.length === 0) {
    return (
      <Card title="📋 Settlement-Level Analysis">
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
          <p>No settlement data available</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title="📋 Settlement-Level Analysis">
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '4px 14px',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: filter === 'all' ? '#2196F3' : '#ddd',
            background: filter === 'all' ? '#e3f2fd' : 'white',
            color: filter === 'all' ? '#0d47a1' : '#666',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          📋 All ({settlements.length})
        </button>
        <button
          onClick={() => setFilter('valid')}
          style={{
            padding: '4px 14px',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: filter === 'valid' ? '#4CAF50' : '#ddd',
            background: filter === 'valid' ? '#e8f5e9' : 'white',
            color: filter === 'valid' ? '#2e7d32' : '#666',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          ✅ Valid ({settlements.filter(s => s.is_valid).length})
        </button>
        <button
          onClick={() => setFilter('mismatch')}
          style={{
            padding: '4px 14px',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: filter === 'mismatch' ? '#dc3545' : '#ddd',
            background: filter === 'mismatch' ? '#ffebee' : 'white',
            color: filter === 'mismatch' ? '#c62828' : '#666',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          ⚠️ Mismatch ({settlements.filter(s => !s.is_valid).length})
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
              <th onClick={() => handleSort('settlement_id')} style={{ padding: '10px 14px', textAlign: 'left', cursor: 'pointer' }}>
                Settlement ID {sortField === 'settlement_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'left' }}>UTR</th>
              <th onClick={() => handleSort('settlement_date')} style={{ padding: '10px 14px', textAlign: 'left', cursor: 'pointer' }}>
                Date {sortField === 'settlement_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('gross_amount')} style={{ padding: '10px 14px', textAlign: 'right', cursor: 'pointer' }}>
                Gross {sortField === 'gross_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Fee</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>GST</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>TDS</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Net</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Deduction %</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedSettlements.map((s, index) => (
              <tr key={index} style={{ borderBottom: index < sortedSettlements.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px' }}>
                  {s.settlement_id}
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '11px' }}>
                  {s.utr}
                </td>
                <td style={{ padding: '10px 14px', fontSize: '12px' }}>
                  {s.settlement_date}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '500' }}>
                  {currency(s.gross_amount)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e65100' }}>
                  {currency(s.razorpay_fee)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#0d47a1' }}>
                  {currency(s.gst_on_fee)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#c62828' }}>
                  {currency(s.tds_deducted)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#2e7d32' }}>
                  {currency(s.net_amount)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '500' }}>
                  {s.effective_deduction_rate}%
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <StatusBadge
                    status={s.is_valid ? 'success' : 'error'}
                    label={s.is_valid ? '✅ Valid' : '⚠️ Mismatch'}
                    size="small"
                    showIcon={false}
                  />
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => onViewDetails(s)}
                  >
                    📋 View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>Showing {sortedSettlements.length} of {settlements.length} settlements</span>
        <span>Valid: {settlements.filter(s => s.is_valid).length} | Mismatch: {settlements.filter(s => !s.is_valid).length}</span>
      </div>
    </Card>
  )
}