/**
 * AuditTrail - Dashboard widget showing recent audit events
 */
import React, { useState, useEffect } from 'react'
import { Card, Button, StatusBadge } from '../common'
import { formatDate } from '../../utils/formatters'
import { auditStyles } from './styles'  // ✅ Import from styles.js

import { 
  AUDIT_ACTION_ICONS, 
  AUDIT_ACTION_LABELS, 
  AUDIT_ACTION_COLORS,
  AUDIT_FILTERS,
  AUDIT_FILTER_LABELS,
  AUDIT_MESSAGES,
  AUDIT_DEFAULTS
} from './constants'
import { AUDIT_FILTER_ACTION_MAP } from './constants'

export default function AuditTrail({ onViewAll, limit = AUDIT_DEFAULTS.widgetLimit }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(AUDIT_FILTERS.ALL)

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/audit')
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action) => {
    return AUDIT_ACTION_ICONS[action] || '📋'
  }

  const getActionLabel = (action) => {
    return AUDIT_ACTION_LABELS[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getActionColor = (action) => {
    return AUDIT_ACTION_COLORS[action] || 'info'
  }

  const getFilteredLogs = () => {
    if (filter === AUDIT_FILTERS.ALL) {
      return logs.slice(0, limit)
    }

    const actions = AUDIT_FILTER_ACTION_MAP[filter]
    if (!actions) return logs.slice(0, limit)

    const actionArray = Array.isArray(actions) ? actions : [actions]
    return logs
      .filter(log => actionArray.includes(log.action))
      .slice(0, limit)
  }

  const filteredLogs = getFilteredLogs()

  const filterConfigs = [
    { key: AUDIT_FILTERS.ALL, color: '#2196F3', bg: '#e3f2fd' },
    { key: AUDIT_FILTERS.EXCEPTIONS, color: '#dc3545', bg: '#ffebee' },
    { key: AUDIT_FILTERS.RESOLUTIONS, color: '#4CAF50', bg: '#e8f5e9' },
    { key: AUDIT_FILTERS.MATCHES, color: '#2196F3', bg: '#e3f2fd' },
  ]

  if (loading) {
    return (
      <Card title="📋 Audit Trail">
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          {AUDIT_MESSAGES.loading}
        </div>
      </Card>
    )
  }

  return (
    <Card title="📋 Audit Trail">
      {/* Filters */}
      <div style={auditStyles.filterButtons}>
        {filterConfigs.map((config) => (
          <button
            key={config.key}
            onClick={() => setFilter(config.key)}
            style={auditStyles.filterButton(
              filter === config.key,
              config.color,
              config.bg
            )}
          >
            {AUDIT_FILTER_LABELS[config.key]}
          </button>
        ))}
      </div>

      {/* Audit Logs */}
      {filteredLogs.length === 0 ? (
        <div style={auditStyles.emptyState}>
          <div style={auditStyles.emptyIcon}>📭</div>
          <div style={auditStyles.emptyTitle}>{AUDIT_MESSAGES.noLogs}</div>
        </div>
      ) : (
        <div style={auditStyles.widgetContainer}>
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              style={auditStyles.widgetItem(index)}
            >
              <span style={auditStyles.widgetItemIcon}>
                {getActionIcon(log.action)}
              </span>
              <div style={auditStyles.widgetItemContent}>
                <div style={auditStyles.widgetItemHeader}>
                  <span style={auditStyles.widgetItemTarget}>
                    {log.target || 'System'}
                  </span>
                  <span style={auditStyles.widgetItemTime}>
                    {formatDate(log.timestamp, { format: 'datetime' })}
                  </span>
                </div>
                <div style={auditStyles.widgetItemMeta}>
                  <StatusBadge 
                    status={getActionColor(log.action)}
                    label={getActionLabel(log.action)}
                    size="small"
                    showIcon={false}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    by {log.user || 'system'}
                  </span>
                </div>
                {log.details && Object.keys(log.details).length > 0 && (
                  <div style={auditStyles.widgetItemDetails}>
                    {Object.entries(log.details).map(([key, value]) => (
                      <span key={key} style={{ marginRight: '8px' }}>
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {onViewAll && logs.length > limit && (
        <div style={auditStyles.viewAllButton}>
          <Button variant="primary" size="small" onClick={onViewAll} icon="📋">
            {AUDIT_MESSAGES.viewFull} ({logs.length} events)
          </Button>
        </div>
      )}
    </Card>
  )
}