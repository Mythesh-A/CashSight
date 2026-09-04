/**
 * MatchInbox - View all matched settlements
 */
import React, { useState, useEffect } from 'react'
import { Button, Card, LoadingSpinner, StatusBadge } from '../common'
import MatchTable from './MatchTable'
import MatchDetails from './MatchDetails'
import { currency, matchTypeLabel } from '../../utils/formatters'

export default function MatchInbox({ onBack }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    minAmount: '',
    maxAmount: '',
    search: '',
  })

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:5000/api/reconcile')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('📊 Matches API Response:', data)
      
      const matchList = data.matches || data || []
      setMatches(matchList)
    } catch (err) {
      console.error('❌ Failed to fetch matches:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleSelectMatch = (match) => {
    setSelectedMatch(match)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedMatch(null)
  }

  // Apply filters
  const getFilteredMatches = () => {
    let filtered = matches

    // Filter by match type
    if (filters.type !== 'all') {
      filtered = filtered.filter(m => m.match_type === filters.type)
    }

    // Filter by amount range
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount)
      filtered = filtered.filter(m => (m.net_amount || m.gross_amount || 0) >= min)
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount)
      filtered = filtered.filter(m => (m.net_amount || m.gross_amount || 0) <= max)
    }

    // Search by settlement_id or UTR
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(m => 
        m.settlement_id?.toLowerCase().includes(searchLower) ||
        m.utr?.toLowerCase().includes(searchLower) ||
        m.order_ids?.some(id => id.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }

  const filteredMatches = getFilteredMatches()
  const totalAmount = matches.reduce((sum, m) => sum + (m.net_amount || m.gross_amount || 0), 0)

  // Count by type
  const typeCounts = {}
  matches.forEach(m => {
    const type = m.match_type || 'clean'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })

  if (loading) {
    return (
      <div style={{ padding: '60px 20px' }}>
        <LoadingSpinner message="Loading matched records..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ color: '#dc3545' }}>Error Loading Matched Records</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <Button variant="primary" onClick={fetchMatches}>
          🔄 Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="match-inbox" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
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
          <h2 style={{ margin: 0, fontSize: '24px' }}>✅ Matched Settlements</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            {matches.length} matched settlements • Total amount: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="small" onClick={fetchMatches} icon="🔄">
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
        <div style={{
          background: '#e8f5e9',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #a5d6a7'
        }}>
          <div style={{ fontSize: '28px' }}>✅</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
            {matches.length}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Matches</div>
        </div>
        <div style={{
          background: '#e3f2fd',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #90caf9'
        }}>
          <div style={{ fontSize: '28px' }}>📦</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d47a1' }}>
            {typeCounts.clean || 0}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>Clean Matches</div>
        </div>
        <div style={{
          background: '#fff3e0',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ffcc80'
        }}>
          <div style={{ fontSize: '28px' }}>📦</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e65100' }}>
            {typeCounts.batched_settlement || 0}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>Batched Settlements</div>
        </div>
        <div style={{
          background: '#fce4ec',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ef9a9a'
        }}>
          <div style={{ fontSize: '28px' }}>💰</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#b71c1c' }}>
            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Amount</div>
        </div>
      </div>

      {/* Filters */}
      {matches.length > 0 && (
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {/* Type Filter */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>
                Match Type
              </div>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange({ type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '13px',
                }}
              >
                <option value="all">All Types</option>
                <option value="clean">Clean</option>
                <option value="batched_settlement">Batched</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>
                🔍 Search
              </div>
              <input
                type="text"
                placeholder="Search by ID or UTR..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Amount Range */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>
                Amount Range
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange({ minAmount: e.target.value })}
                  style={{
                    width: '50%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '13px',
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange({ maxAmount: e.target.value })}
                  style={{
                    width: '50%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button 
                variant="secondary" 
                size="small" 
                onClick={() => setFilters({ type: 'all', minAmount: '', maxAmount: '', search: '' })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Match Table */}
      {matches.length > 0 ? (
        <MatchTable
          matches={filteredMatches}
          onSelect={handleSelectMatch}
        />
      ) : (
        <Card variant="info">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#666' }}>No Matched Records Found</h3>
            <p style={{ color: '#999' }}>Run reconciliation to see matched settlements here</p>
          </div>
        </Card>
      )}

      {/* Match Details Modal */}
      {showDetails && selectedMatch && (
        <MatchDetails
          match={selectedMatch}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  )
}