/**
 * ForecastChart - Cash Flow Forecast Table
 * Clean, professional forecast display without chart complexity
 */
import React from 'react'
import { Card } from '../common'
import { currency } from '../../utils/formatters'

export default function ForecastChart({ data, loading, error, onRefresh }) {
  if (loading) {
    return (
      <Card title="📈 Cash Flow Forecast">
        <div style={{ 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#666'
        }}>
          Loading forecast...
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card title="📈 Cash Flow Forecast">
        <div style={{ 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexDirection: 'column' 
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
          <p style={{ color: '#dc3545' }}>Failed to load forecast</p>
          <button
            onClick={onRefresh}
            style={{
              padding: '8px 20px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            🔄 Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!data || !data.percentiles) {
    return (
      <Card title="📈 Cash Flow Forecast">
        <div style={{ 
          height: '150px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#666'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <p>No forecast data available</p>
          <p style={{ fontSize: '13px', color: '#999' }}>Run reconciliation to generate forecast</p>
        </div>
      </Card>
    )
  }

  const { p5, p50, p95 } = data.percentiles
  const days = data.days || p5.map((_, i) => `Day ${i + 1}`)
  const currentCash = data?.current_cash || 0
  const pendingAmount = data?.pending_amount || 0
  const pendingCount = data?.pending_count || 0

  // Calculate daily changes
  const dailyChanges = p50.map((value, index) => {
    const prev = index === 0 ? currentCash : p50[index - 1]
    return value - prev
  })

  return (
    <Card title="📈 Cash Flow Forecast">
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          background: '#e3f2fd',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #90caf9'
        }}>
          <div style={{ fontSize: '12px', color: '#0d47a1' }}>💰 Current Cash</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d47a1' }}>
            {currency(currentCash)}
          </div>
        </div>
        <div style={{
          background: '#fff3e0',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ffcc80'
        }}>
          <div style={{ fontSize: '12px', color: '#e65100' }}>⏳ Pending</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e65100' }}>
            {currency(pendingAmount)}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>{pendingCount} settlements</div>
        </div>
        <div style={{
          background: '#e8f5e9',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #a5d6a7'
        }}>
          <div style={{ fontSize: '12px', color: '#1b5e20' }}>📋 Total Expected</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1b5e20' }}>
            {currency(currentCash + pendingAmount)}
          </div>
        </div>
        <div style={{
          background: '#fce4ec',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ef9a9a'
        }}>
          <div style={{ fontSize: '12px', color: '#b71c1c' }}>📈 Projected (Day 7)</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#b71c1c' }}>
            {currency(p50[p50.length - 1] || 0)}
          </div>
        </div>
      </div>

      {/* Forecast Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Day</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>P5 (Downside)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>P50 (Expected)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>P95 (Upside)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Daily Change</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => (
              <tr 
                key={index}
                style={{
                  borderBottom: index < days.length - 1 ? '1px solid #f0f0f0' : 'none',
                  background: index === days.length - 1 ? '#f8f9fa' : 'transparent',
                }}
              >
                <td style={{ 
                  padding: '10px 16px', 
                  fontWeight: index === days.length - 1 ? 'bold' : 'normal'
                }}>
                  {day}
                  {index === days.length - 1 && ' 📌'}
                </td>
                <td style={{ 
                  padding: '10px 16px', 
                  textAlign: 'right',
                  color: '#ff9800',
                  fontWeight: index === days.length - 1 ? 'bold' : 'normal'
                }}>
                  {currency(p5[index] || 0)}
                </td>
                <td style={{ 
                  padding: '10px 16px', 
                  textAlign: 'right',
                  color: '#2196F3',
                  fontWeight: 'bold'
                }}>
                  {currency(p50[index] || 0)}
                </td>
                <td style={{ 
                  padding: '10px 16px', 
                  textAlign: 'right',
                  color: '#dc3545',
                  fontWeight: index === days.length - 1 ? 'bold' : 'normal'
                }}>
                  {currency(p95[index] || 0)}
                </td>
                <td style={{ 
                  padding: '10px 16px', 
                  textAlign: 'right',
                  color: dailyChanges[index] >= 0 ? '#2e7d32' : '#c62828',
                  fontWeight: index === days.length - 1 ? 'bold' : 'normal'
                }}>
                  {dailyChanges[index] >= 0 ? '+' : ''}
                  {currency(dailyChanges[index] || 0)}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Footer with totals */}
          <tfoot>
            <tr style={{ 
              background: '#f8f9fa', 
              borderTop: '2px solid #e9ecef',
              fontWeight: 'bold'
            }}>
              <td style={{ padding: '12px 16px' }}>📊 Final</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#ff9800' }}>
                {currency(p5[p5.length - 1] || 0)}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#2196F3' }}>
                {currency(p50[p50.length - 1] || 0)}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc3545' }}>
                {currency(p95[p95.length - 1] || 0)}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#2e7d32' }}>
                {currency(p50[p50.length - 1] - currentCash || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend / Notes */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '3px', background: '#ff9800' }}></span>
          <span>P5 — Downside (Conservative)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '3px', background: '#2196F3' }}></span>
          <span>P50 — Expected (Median)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '3px', background: '#dc3545' }}></span>
          <span>P95 — Upside (Optimistic)</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span>📌 Day 7 — Projected Cash</span>
        </div>
      </div>

      {/* Assumption Note */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffc107',
        fontSize: '12px',
        color: '#856404',
      }}>
        <strong>📝 Note:</strong> Insufficient historical data is currently available for a reliable Monte Carlo forecast.
                This version uses synthetic scenarios for demonstration.
                "Monte Carlo-based probabilistic forecasting will be introduced in upcoming versions
                as sufficient historical data becomes available (minimum 30+ historical observations).
      </div>
    </Card>
  )
}