/**
 * ExceptionFilters - Filter controls for exceptions
 */
import React from 'react'
import { Card, Button } from '../common'
import { exceptionTypeLabel } from '../../utils/formatters'

export default function ExceptionFilters({ filters, onFilterChange }) {
  const handleTypeChange = (type) => {
    onFilterChange({ type: filters.type === type ? 'all' : type })
  }

  const handleStatusChange = (status) => {
    onFilterChange({ status: filters.status === status ? 'all' : status })
  }

  const handleMinAmountChange = (e) => {
    onFilterChange({ minAmount: e.target.value })
  }

  const handleMaxAmountChange = (e) => {
    onFilterChange({ maxAmount: e.target.value })
  }

  const handleClearFilters = () => {
    onFilterChange({
      type: 'all',
      status: 'all',
      minAmount: '',
      maxAmount: '',
    })
  }

  const exceptionTypes = [
    'all',
    'missing_bank_credit',
    'unresolved_batch',
    'ambiguous_batch',
    'unlinked_credit',
  ]

  const statusTypes = ['all', 'pending', 'investigating', 'resolved']

  return (
    <Card title="🔍 Filter Exceptions">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Type Filter */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '8px' }}>
            Exception Type
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {exceptionTypes.map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                style={{
                  padding: '4px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: filters.type === type ? '#2196F3' : '#ddd',
                  background: filters.type === type ? '#e3f2fd' : 'white',
                  color: filters.type === type ? '#0d47a1' : '#666',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                {type === 'all' ? '📋 All' : exceptionTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '8px' }}>
            Status
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {statusTypes.map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                style={{
                  padding: '4px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: filters.status === status ? '#2196F3' : '#ddd',
                  background: filters.status === status ? '#e3f2fd' : 'white',
                  color: filters.status === status ? '#0d47a1' : '#666',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Range */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '8px' }}>
            Amount Range (₹)
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Min"
              value={filters.minAmount}
              onChange={handleMinAmountChange}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                width: '120px',
                fontSize: '14px',
              }}
            />
            <span style={{ color: '#666' }}>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxAmount}
              onChange={handleMaxAmountChange}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                width: '120px',
                fontSize: '14px',
              }}
            />
            <Button variant="secondary" size="small" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}