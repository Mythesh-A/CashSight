/**
 * ForecastSummary - Summary cards for forecast data
 */
import React from 'react'
import { Card } from '../common'
import { currency } from '../../utils/formatters'

export default function ForecastSummary({ 
  currentCash,
  pendingAmount,
  projectedCash,
  pendingCount,
  matchRate,
  dataSource,
}) {
  const cards = [
    {
      label: '💰 Current Cash',
      value: currency(currentCash || 0),
      sub: `${pendingCount || 0} pending settlements`,
      color: '#2e7d32',
      background: '#e8f5e9',
    },
    {
      label: '⏳ Pending Settlements',
      value: currency(pendingAmount || 0),
      sub: `${pendingCount || 0} exceptions to resolve`,
      color: '#e65100',
      background: '#fff3e0',
    },
    {
      label: '📈 Projected Cash (7 Days)',
      value: currency(projectedCash || 0),
      sub: `${matchRate || 0}% match rate`,
      color: '#0d47a1',
      background: '#e3f2fd',
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
    }}>
      {cards.map((card, index) => (
        <Card key={index} variant="default">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
              {card.label}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: card.color,
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {card.sub}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}