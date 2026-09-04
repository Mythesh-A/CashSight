/**
 * AuditDetails - Full audit trail for a specific settlement
 * Used inside Exception Details Modal
 */
import React, { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner, StatusBadge } from '../common'
import { formatDate } from '../../utils/formatters'

export default function AuditDetails({ settlementId, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (settlementId) {
      fetchAuditTrail()
    }
  }, [settlementId])

  const fetchAuditTrail = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:5000/api/audit/${settlementId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch audit trail')
      }
      const data = await response.json()
      setLogs(data.audit_trail || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch audit trail:', err)
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

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <LoadingSpinner message="Loading audit trail..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
        ❌ {error}
      </div>
    )
  }

  return (
    <div style={{
      marginTop: '20px',
      padding: '16px',
      background: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <h4 style={{ margin: 0, fontSize: '14px', color: '#333' }}>
          📋 Audit Trail for {settlementId}
        </h4>
        <Button variant="secondary" size="small" onClick={onClose} icon="✕">
          Close
        </Button>
      </div>

      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          No audit events found for this settlement
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflow: 'auto' }}>
          {logs.map((log, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px 12px',
                background: 'white',
                borderRadius: '6px',
                border: '1px solid #f0f0f0',
                fontSize: '13px',
              }}
            >
              <span style={{ fontSize: '16px', marginTop: '2px' }}>
                {getActionIcon(log.action)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500' }}>
                    {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    {formatDate(log.time, { format: 'datetime' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <StatusBadge 
                    status={getActionColor(log.action)}
                    label={log.status || 'Completed'}
                    size="small"
                    showIcon={false}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    by {log.user || 'system'}
                  </span>
                </div>
                {log.description && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {log.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}