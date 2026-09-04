/**
 * TaxMonthly - Monthly breakdown of tax and fee data
 */
import React from 'react'
import { Card } from '../common'
import { currency } from '../../utils/formatters'

export default function TaxMonthly({ monthlyData }) {
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <Card title="📊 Monthly Breakdown">
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#999',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
          <p>No monthly data available</p>
          <p style={{ fontSize: '13px', color: '#bbb' }}>
            Settlements will be grouped by month when data is available
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card title="📊 Monthly Breakdown">
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Month</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Gross</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Fee</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>GST</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>TDS</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Deductions</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Net</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Deduction %</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Settlements</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((month, index) => (
              <tr key={index} style={{ borderBottom: index < monthlyData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td style={{ padding: '10px 14px', fontWeight: '500' }}>
                  {month.month}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '500' }}>
                  {currency(month.gross)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e65100' }}>
                  {currency(month.fee)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#0d47a1' }}>
                  {currency(month.gst)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#c62828' }}>
                  {currency(month.tds)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '500', color: '#e65100' }}>
                  {currency(month.total_deductions)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#2e7d32' }}>
                  {currency(month.net)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '500' }}>
                  {month.effective_deduction_rate}%
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  {month.settlement_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {monthlyData.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>Showing {monthlyData.length} months</span>
          <span>Total Settlements: {monthlyData.reduce((sum, m) => sum + m.settlement_count, 0)}</span>
        </div>
      )}
    </Card>
  )
}