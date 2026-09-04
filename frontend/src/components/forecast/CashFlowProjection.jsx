/**
 * CashFlowProjection - Daily cash flow projection table
 */
import React from 'react'
import { Card } from '../common'
import { currency } from '../../utils/formatters'

export default function CashFlowProjection({ data, loading }) {
  if (loading) {
    return (
      <Card title="📊 Cash Flow Projection">
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Loading projection...
        </div>
      </Card>
    )
  }

  if (!data || !data.percentiles) {
    return (
      <Card title="📊 Cash Flow Projection">
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No projection data available
        </div>
      </Card>
    )
  }

  const { p5, p50, p95 } = data.percentiles
  const days = data.days || p5.map((_, i) => `Day ${i + 1}`)

  // Calculate daily changes
  const dailyChanges = p50.map((value, index) => {
    const prev = index === 0 ? 0 : p50[index - 1]
    return value - prev
  })

  return (
    <Card title="📊 Cash Flow Projection (7 Days)">
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Day</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>P5 (Optimistic)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>P50 (Expected)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>P95 (Pessimistic)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Daily Inflow</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => (
              <tr 
                key={index}
                style={{
                  borderBottom: index < days.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <td style={{ padding: '10px 16px', fontWeight: '500' }}>{day}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#ff9800' }}>
                  {currency(p5[index] || 0)}
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 'bold', color: '#2196F3' }}>
                  {currency(p50[index] || 0)}
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#dc3545' }}>
                  {currency(p95[index] || 0)}
                </td>
                <td style={{ 
                  padding: '10px 16px', 
                  textAlign: 'right',
                  color: dailyChanges[index] >= 0 ? '#2e7d32' : '#c62828',
                }}>
                  {dailyChanges[index] >= 0 ? '+' : ''}{currency(dailyChanges[index] || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}