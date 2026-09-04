/**
 * TaxDetails - Detailed view of a settlement's tax breakdown
 */
import React from 'react'
import { Button, Card, StatusBadge } from '../common'
import { currency } from '../../utils/formatters'

export default function TaxDetails({ settlement, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}>
          <div>
            <h3 style={{ margin: 0 }}>📋 Settlement Details</h3>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
              {settlement.settlement_id} • {settlement.utr}
            </div>
          </div>
          <Button variant="secondary" size="small" onClick={onClose} icon="✕">
            Close
          </Button>
        </div>

        {/* Status */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          background: settlement.is_valid ? '#e8f5e9' : '#ffebee',
          border: `1px solid ${settlement.is_valid ? '#a5d6a7' : '#ef9a9a'}`,
          color: settlement.is_valid ? '#2e7d32' : '#c62828',
          textAlign: 'center',
        }}>
          <StatusBadge
            status={settlement.is_valid ? 'success' : 'error'}
            label={settlement.is_valid ? 'Calculation Valid' : '⚠️ Calculation Mismatch'}
            size="medium"
          />
        </div>

        {/* Amount Breakdown */}
        <div style={{
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ color: '#666' }}>Gross Amount</span>
            <span style={{ fontWeight: '500' }}>{currency(settlement.gross_amount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ color: '#e65100' }}>− Razorpay Fee</span>
            <span style={{ color: '#e65100' }}>{currency(settlement.razorpay_fee)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ color: '#0d47a1' }}>− GST on Fee</span>
            <span style={{ color: '#0d47a1' }}>{currency(settlement.gst_on_fee)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ color: '#c62828' }}>− TDS Deducted</span>
            <span style={{ color: '#c62828' }}>{currency(settlement.tds_deducted)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 'bold', fontSize: '16px' }}>
            <span>= Net Settlement</span>
            <span style={{ color: '#2e7d32' }}>{currency(settlement.net_amount)}</span>
          </div>
        </div>

        {/* Additional Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Deductions</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e65100' }}>
              {currency(settlement.total_deductions)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Effective Deduction %</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {settlement.effective_deduction_rate}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Settlement Date</div>
            <div>{settlement.settlement_date}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>UTR</div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>{settlement.utr}</div>
          </div>
        </div>

        {/* Mismatch Details */}
        {!settlement.is_valid && settlement.issues && settlement.issues.length > 0 && (
          <div style={{
            padding: '12px 16px',
            background: '#ffebee',
            borderRadius: '8px',
            border: '1px solid #ef9a9a',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#c62828', marginBottom: '4px' }}>
              ⚠️ Calculation Mismatch
            </div>
            {settlement.issues.map((issue, index) => (
              <div key={index} style={{ fontSize: '12px', color: '#666' }}>
                {issue.type === 'CALCULATION_MISMATCH' && (
                  `Source Net: ${currency(issue.source_net)} → Calculated Net: ${currency(issue.calculated_net)}`
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #eee',
        }}>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}