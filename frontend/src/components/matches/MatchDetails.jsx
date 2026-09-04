/**
 * MatchDetails - Detailed view of a matched settlement
 */
import React from 'react'
import { Button, Card, StatusBadge } from '../common'
import { currency, matchTypeLabel } from '../../utils/formatters'

export default function MatchDetails({ match, onClose }) {
  const amount = match.net_amount || match.gross_amount || 0
  const orderIds = match.order_ids || []

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
        maxWidth: '650px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>✅</span>
              <div>
                <h3 style={{ margin: 0 }}>Matched Settlement</h3>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                  {match.settlement_id}
                </div>
              </div>
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
          background: '#e8f5e9',
          border: '1px solid #a5d6a7',
          color: '#2e7d32',
          textAlign: 'center',
        }}>
          ✅ Successfully Reconciled
          <span style={{ marginLeft: '12px' }}>
            <StatusBadge 
              status={match.match_type === 'clean' ? 'success' : 'info'}
              label={matchTypeLabel(match.match_type)}
              size="small"
              showIcon={false}
            />
          </span>
        </div>

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Settlement ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>
              {match.settlement_id}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Match Type</div>
            <StatusBadge 
              status={match.match_type === 'clean' ? 'success' : 'info'}
              label={matchTypeLabel(match.match_type)}
              size="small"
              showIcon={false}
            />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>UTR</div>
            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              {match.utr || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Bank Transaction</div>
            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              {match.bank_txn_id || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Settlement Date</div>
            <div>{match.settlement_date ? new Date(match.settlement_date).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Amount</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
              {currency(amount)}
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        {(match.razorpay_fee !== undefined || match.gst_on_fee !== undefined || match.tds_deducted !== undefined) && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '8px' }}>
              📊 Fee Breakdown
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
            }}>
              <div style={{
                padding: '10px',
                background: '#fff3e0',
                borderRadius: '6px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Razorpay Fee</div>
                <div style={{ fontWeight: 'bold', color: '#e65100' }}>
                  {currency(match.razorpay_fee || 0)}
                </div>
              </div>
              <div style={{
                padding: '10px',
                background: '#e3f2fd',
                borderRadius: '6px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '11px', color: '#666' }}>GST on Fee</div>
                <div style={{ fontWeight: 'bold', color: '#0d47a1' }}>
                  {currency(match.gst_on_fee || 0)}
                </div>
              </div>
              <div style={{
                padding: '10px',
                background: '#fce4ec',
                borderRadius: '6px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '11px', color: '#666' }}>TDS Deducted</div>
                <div style={{ fontWeight: 'bold', color: '#b71c1c' }}>
                  {currency(match.tds_deducted || 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order IDs */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '8px' }}>
            📋 Linked Orders ({orderIds.length})
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px',
          }}>
            {orderIds.map((orderId, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 12px',
                  background: '#e3f2fd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#0d47a1',
                }}
              >
                {orderId}
              </span>
            ))}
            {orderIds.length === 0 && (
              <span style={{ color: '#999', fontSize: '13px' }}>No orders linked</span>
            )}
          </div>
        </div>

        {/* Reconciliation Summary */}
        <div style={{
          padding: '12px 16px',
          background: '#e8f5e9',
          borderRadius: '8px',
          border: '1px solid #a5d6a7',
          fontSize: '13px',
          color: '#2e7d32',
        }}>
          <strong>✅ Reconciliation Complete</strong>
          <span style={{ marginLeft: '8px' }}>
            Settlement successfully matched with bank transaction and {orderIds.length} order(s)
          </span>
        </div>

        {/* Close Button */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}