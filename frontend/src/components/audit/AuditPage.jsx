/**
 * AuditPage - Full audit log with filters
 */
import React, { useState, useEffect } from 'react'
import { Button, Card, LoadingSpinner, StatusBadge } from '../common'
import { formatDate } from '../../utils/formatters'

export default function AuditPage({ onBack }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:5000/api/audit')
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action) => {
    const icons = {
      exception_detected: '🚨',
      resolve_exception: '✅',
      batch_matched: '📦',
      reconciliation_completed: '📊',
      reconciliation_started: '🔄',
      explain_exception: '🤖',
      upload_completed: '📤',
      validation_completed: '✅',
      resolution_started: '🔍',
      resolution_completed: '✅'
    }
    return icons[action] || '📋'
  }

  const getActionColor = (action) => {
    const colors = {
      exception_detected: 'error',
      resolve_exception: 'success',
      batch_matched: 'info',
      reconciliation_completed: 'success',
      reconciliation_started: 'info',
      explain_exception: 'info',
      upload_completed: 'success',
      validation_completed: 'success',
      resolution_started: 'warning',
      resolution_completed: 'success'
    }
    return colors[action] || 'info'
  }

  // Apply filters
  const getFilteredLogs = () => {
    let filtered = logs

    // Filter by action type
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.action === filter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        (log.target || '').toLowerCase().includes(term) ||
        (log.action || '').toLowerCase().includes(term) ||
        (log.user || '').toLowerCase().includes(term)
      )
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(log => log.timestamp >= dateRange.start)
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59)
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate)
    }

    return filtered
  }

  const filteredLogs = getFilteredLogs()

  // Get unique action types for filter dropdown
  const actionTypes = [...new Set(logs.map(log => log.action))]

  // Get stats
  const stats = {
    total: logs.length,
    exceptions: logs.filter(l => l.action === 'exception_detected').length,
    resolutions: logs.filter(l => l.action === 'resolve_exception').length,
    matches: logs.filter(l => l.action === 'batch_matched').length,
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 20px' }}>
        <LoadingSpinner message="Loading audit logs..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ color: '#dc3545' }}>Error Loading Audit Logs</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <Button variant="primary" onClick={fetchAuditLogs}>
          🔄 Retry
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
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
          <h2 style={{ margin: 0, fontSize: '24px' }}>📋 Audit Log</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            {logs.length} total events recorded
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="small" onClick={fetchAuditLogs} icon="🔄">
            Refresh
          </Button>
          <Button variant="primary" size="small" onClick={onBack} icon="←">
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: '#e3f2fd',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #90caf9'
        }}>
          <div style={{ fontSize: '28px' }}>📋</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d47a1' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Events</div>
        </div>
        <div style={{
          background: '#ffebee',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ef9a9a'
        }}>
          <div style={{ fontSize: '28px' }}>🚨</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c62828' }}>
            {stats.exceptions}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>Exceptions</div>
        </div>
        <div style={{
          background: '#e8f5e9',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #a5d6a7'
        }}>
          <div style={{ fontSize: '28px' }}>✅</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
            {stats.resolutions}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>Resolutions</div>
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
            {stats.matches}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>Matches</div>
        </div>
      </div>

      {/* Filters */}
      <Card title="🔍 Filters">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {/* Action Type Filter */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>
              Action Type
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '13px',
              }}
            >
              <option value="all">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>
                  {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>
              🔍 Search
            </div>
            <input
              type="text"
              placeholder="Search by ID, action, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Date Range */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>
              Date Range
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '13px',
                }}
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{
                  flex: 1,
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
              onClick={() => {
                setFilter('all')
                setSearchTerm('')
                setDateRange({ start: '', end: '' })
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Table */}
      <div style={{ marginTop: '20px' }}>
        <Card title="📋 Audit Events">
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Time</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Target</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Action</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>User</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      No audit events found matching the filters
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: index < filteredLogs.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {formatDate(log.timestamp, { format: 'datetime' })}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px' }}>
                        {log.target || 'System'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{getActionIcon(log.action)}</span>
                          <StatusBadge 
                            status={getActionColor(log.action)}
                            label={log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            size="small"
                            showIcon={false}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px' }}>
                        {log.user || 'system'}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', color: '#666', maxWidth: '300px' }}>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          Object.entries(log.details).map(([key, value]) => (
                            <span key={key} style={{ marginRight: '8px' }}>
                              {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#999' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}