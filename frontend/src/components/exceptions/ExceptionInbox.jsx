/**
 * ExceptionInbox - Main exception management page
 */
import React, { useState, useEffect } from 'react'
import { Button, Card, LoadingSpinner, StatusBadge } from '../common'
import ExceptionFilters from './ExceptionFilters'
import ExceptionTable from './ExceptionTable'
import ExceptionDetails from './ExceptionDetails'
import { exceptionTypeLabel, exceptionTypeIcon } from '../../utils/formatters'

export default function ExceptionInbox({ onBack }) {
  const [exceptions, setExceptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedException, setSelectedException] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: '',
  })
  const [summary, setSummary] = useState({})

  // 🔥 Fetch exceptions on mount
  useEffect(() => {
    fetchExceptions()
  }, [])

  const fetchExceptions = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 Fetching exceptions...')
      const response = await fetch('http://localhost:5000/api/exceptions')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Exceptions API Response:', data)
      
      // Extract exceptions from response
      const exceptionList = data.exceptions || data || []
      setExceptions(exceptionList)
      
      // Calculate summary
      const summaryData = {}
      exceptionList.forEach(e => {
        const type = e.exception_type || e.type || 'unknown'
        summaryData[type] = (summaryData[type] || 0) + 1
      })
      setSummary(summaryData)
      
      console.log(`✅ Loaded ${exceptionList.length} exceptions`)
      
    } catch (err) {
      console.error('❌ Failed to fetch exceptions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleSelectException = (exception) => {
    setSelectedException(exception)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedException(null)
  }

  const handleResolve = async (exception) => {
    try {
      // For quick resolve, use confirm decision
      const response = await fetch('http://localhost:5000/api/resolve-exception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exception_id: exception.settlement_id || exception.id || exception.txn_id,
          decision: 'confirm',
          selected_combination: null,
          notes: 'Quick resolve from exception table'
        })
      })
      
      if (response.ok) {
        await fetchExceptions()
      }
    } catch (error) {
      console.error('Failed to resolve:', error)
    }
  }

  // Apply filters
  const getFilteredExceptions = () => {
    let filtered = exceptions

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(e => 
        (e.exception_type || e.type) === filters.type
      )
    }

    // Filter by amount range
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount)
      filtered = filtered.filter(e => 
        (e.amount || e.net_amount || 0) >= min
      )
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount)
      filtered = filtered.filter(e => 
        (e.amount || e.net_amount || 0) <= max
      )
    }

    return filtered
  }

  const filteredExceptions = getFilteredExceptions()
  const totalAmount = exceptions.reduce((sum, e) => sum + (e.amount || e.net_amount || 0), 0)

  if (loading) {
    return (
      <div style={{ padding: '60px 20px' }}>
        <LoadingSpinner message="Loading exceptions..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ color: '#dc3545' }}>Error Loading Exceptions</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <Button variant="primary" onClick={fetchExceptions}>
          🔄 Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="exception-inbox" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>🚨 Exception Center</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            {exceptions.length} total exceptions • Total amount: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span style={{ marginLeft: '12px' }}>
              <span style={{ color: '#dc3545' }}>🔴 {exceptions.filter(e => e.exception_type === 'missing_bank_credit').length} pending bank credits</span>
              <span style={{ marginLeft: '8px', color: '#ff9800' }}>🟠 {exceptions.filter(e => e.exception_type === 'ambiguous_batch').length} ambiguous</span>
              <span style={{ marginLeft: '8px', color: '#2196F3' }}>🔵 {exceptions.filter(e => e.exception_type === 'unlinked_credit').length} unlinked</span>
              <span style={{ marginLeft: '8px', color: '#ffc107' }}>🟡 {exceptions.filter(e => e.exception_type === 'unresolved_batch').length} unresolved</span>
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="small" onClick={fetchExceptions} icon="🔄">
            Refresh
          </Button>
          <Button variant="primary" size="small" onClick={onBack} icon="←">
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {Object.keys(summary).length > 0 ? (
          Object.entries(summary).map(([type, count]) => (
            <Card key={type} variant={type === 'missing_bank_credit' ? 'danger' : 'warning'}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px' }}>{exceptionTypeIcon(type)}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{count}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{exceptionTypeLabel(type)}</div>
              </div>
            </Card>
          ))
        ) : (
          <Card variant="success" style={{ gridColumn: '1 / -1' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px' }}>🎉</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                No exceptions found!
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                All settlements were reconciled successfully
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Filters */}
      {exceptions.length > 0 && (
        <ExceptionFilters filters={filters} onFilterChange={handleFilterChange} />
      )}

      {/* Exception Table */}
      {exceptions.length > 0 && (
        <ExceptionTable
          exceptions={filteredExceptions}
          onSelect={handleSelectException}
          onResolve={handleResolve}
        />
      )}

      {/* Exception Details Modal */}
      {showDetails && selectedException && (
        <ExceptionDetails
          exception={selectedException}
          onClose={handleCloseDetails}
          onResolve={handleResolve}
        />
      )}

      {/* Debug Info */}
      {exceptions.length === 0 && !loading && !error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: '#fff3cd', 
          borderRadius: '8px',
          border: '1px solid #ffc107'
        }}>
          <p style={{ margin: 0, color: '#856404' }}>
            💡 No exceptions found. Try:
            <br />
            1. Check if reconciliation has been run
            <br />
            2. Load sample data using the "Load Sample" button
            <br />
            3. Upload CSV files with data
          </p>
        </div>
      )}
    </div>
  )
}