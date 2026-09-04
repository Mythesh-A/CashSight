/**
 * MetricsPanel - Display reconciliation metrics
 */
import React from 'react'
import { Card } from '../common'
import { percentage } from '../../utils/formatters'

export default function MetricsPanel({ 
  matchRate, 
  totalSettlements, 
  matched, 
  exceptions, 
  dataSource 
}) {
  const metrics = [
    {
      label: 'Match Rate',
      value: percentage(matchRate),
      color: matchRate >= 80 ? '#2e7d32' : matchRate >= 50 ? '#e65100' : '#c62828',
      description: `${matched} of ${totalSettlements} settlements matched`,
    },
    {
      label: 'Total Settlements',
      value: totalSettlements,
      color: '#0d47a1',
      description: `${dataSource === 'sample' ? 'Sample' : 'Uploaded'} data`,
    },
    {
      label: 'Exception Rate',
      value: percentage(100 - matchRate),
      color: exceptions > 0 ? '#c62828' : '#2e7d32',
      description: `${exceptions} exceptions found`,
    },
  ]

  return (
    <Card title="📈 Reconciliation Metrics" variant="default">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
      }}>
        {metrics.map((metric, index) => (
          <div 
            key={index}
            style={{
              textAlign: 'center',
              padding: '16px',
              background: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              {metric.label}
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: metric.color,
            }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {metric.description}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}