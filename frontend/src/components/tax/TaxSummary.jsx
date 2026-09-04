/**
 * TaxSummary - Professional summary cards for Tax Analyzer
 */
import React from 'react'
import { Card } from '../common'
import { currency } from '../../utils/formatters'

export default function TaxSummary({ summary, rates }) {
  // Calculate GST as percentage of fee (not gross)
  const gst_as_percent_of_fee = summary.razorpay_fee > 0 
    ? (summary.gst_on_fee / summary.razorpay_fee) * 100 
    : 0

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Summary Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Gross Settlements
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginTop: '4px' }}>
            {currency(summary.gross_amount)}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '11px', color: '#e65100', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Gateway Fees
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#e65100', marginTop: '4px' }}>
            {currency(summary.razorpay_fee)}
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            {rates.fee_rate}% of gross
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '11px', color: '#0d47a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            GST on Fees
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#0d47a1', marginTop: '4px' }}>
            {currency(summary.gst_on_fee)}
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            {gst_as_percent_of_fee.toFixed(0)}% of fee
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '11px', color: '#c62828', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            TDS Deducted
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#c62828', marginTop: '4px' }}>
            {currency(summary.tds_deducted)}
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            {rates.tds_rate}% of gross
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '11px', color: '#e65100', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Deductions
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#e65100', marginTop: '4px' }}>
            {currency(summary.total_deductions)}
          </div>
        </div>

        {/* 🔥 Net Settlement - NO GREEN OUTLINE */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',  // Same as others
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '11px', color: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Net Settlement
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#2e7d32', marginTop: '4px' }}>
            {currency(summary.net_amount)}
          </div>
        </div>
      </div>

      {/* Effective Deduction Rate - Professional Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Effective Deduction Rate
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginTop: '2px' }}>
            {rates.effective_deduction_rate}%
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#e65100' }}>Gateway Fee</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ff9800' }}>
              {rates.fee_rate}%
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>of gross</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#0d47a1' }}>GST on Fee</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#64b5f6' }}>
              {gst_as_percent_of_fee.toFixed(0)}% of fee
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              ({rates.gst_fee_rate}% of gross)
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#c62828' }}>TDS</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ef5350' }}>
              {rates.tds_rate}%
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>of gross</div>
          </div>
        </div>
      </div>
    </div>
  )
}