/**
 * DataQualityReport - Data validation results
 */
import React, { useState } from 'react'
import { Button, Card, LoadingSpinner } from '../common'
import { uploadStyles } from './styles'

export default function DataQualityReport({ data, validationResult, onComplete, onBack }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const issues = validationResult?.issues || []
  const summary = validationResult?.summary || {}
  const isValid = validationResult?.valid !== undefined ? validationResult.valid : true

  // Calculate totals from the actual data
  const ledgerCount = data?.ledger_data?.length || 0
  const settlementCount = data?.settlement_data?.length || 0
  const bankCount = data?.bank_data?.length || 0

  // Calculate amounts from the actual data
  let totalLedgerAmount = 0
  let totalSettlementAmount = 0
  let totalBankAmount = 0

  if (data?.ledger_data) {
    totalLedgerAmount = data.ledger_data.reduce((sum, row) => {
      const amount = parseFloat(row.gross_amount || row.amount || row.total || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  }

  if (data?.settlement_data) {
    totalSettlementAmount = data.settlement_data.reduce((sum, row) => {
      const amount = parseFloat(row.gross_amount || row.amount || row.total || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  }

  if (data?.bank_data) {
    totalBankAmount = data.bank_data.reduce((sum, row) => {
      const amount = parseFloat(row.credited_amount || row.credit_amount || row.amount || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  }

  const handleContinue = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('📤 Sending data to backend for validation...')
      console.log('   Ledger:', data?.ledger_data?.length || 0, 'rows')
      console.log('   Settlements:', data?.settlement_data?.length || 0, 'rows')
      console.log('   Bank:', data?.bank_data?.length || 0, 'rows')
      
      const response = await fetch('https://cashsight-api.onrender.com/api/validate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ledger_data: data?.ledger_data || [],
          settlement_data: data?.settlement_data || [],
          bank_data: data?.bank_data || [],
          mappings: data?.mappings || {}
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Validation failed: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('✅ Validation complete:', result)
      onComplete(result)
      
    } catch (err) {
      setError(err.message)
      console.error('❌ Validation error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 20px' }}>
        <LoadingSpinner message="Validating data..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ color: '#dc3545' }}>Validation Error</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <Button variant="primary" onClick={handleContinue}>
          🔄 Retry
        </Button>
      </div>
    )
  }

  return (
    <div style={uploadStyles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '32px' }}>✅</span>
        <h2 style={{ margin: 0 }}>Data Quality Report</h2>
      </div>
      
      {/* Status Banner */}
      <div style={uploadStyles.reportBanner(isValid)}>
        <h3 style={uploadStyles.reportBannerTitle(isValid)}>
          {isValid ? '✅ All checks passed!' : '⚠️ Issues detected - but you can continue'}
        </h3>
      </div>

      {/* Summary Cards */}
      <div style={uploadStyles.reportSummaryCards}>
        <div style={uploadStyles.reportSummaryCard('#e3f2fd', '#e3f2fd')}>
          <div style={uploadStyles.reportSummaryNumber('#0d47a1')}>
            {ledgerCount}
          </div>
          <div style={uploadStyles.reportSummaryLabel}>📋 Orders</div>
          <div style={uploadStyles.reportSummaryAmount('#0d47a1')}>
            ₹{totalLedgerAmount.toFixed(2)}
          </div>
        </div>
        
        <div style={uploadStyles.reportSummaryCard('#e8f5e9', '#e8f5e9')}>
          <div style={uploadStyles.reportSummaryNumber('#1b5e20')}>
            {settlementCount}
          </div>
          <div style={uploadStyles.reportSummaryLabel}>🏦 Settlements</div>
          <div style={uploadStyles.reportSummaryAmount('#1b5e20')}>
            ₹{totalSettlementAmount.toFixed(2)}
          </div>
        </div>
        
        <div style={uploadStyles.reportSummaryCard('#fce4ec', '#fce4ec')}>
          <div style={uploadStyles.reportSummaryNumber('#b71c1c')}>
            {bankCount}
          </div>
          <div style={uploadStyles.reportSummaryLabel}>💰 Bank Transactions</div>
          <div style={uploadStyles.reportSummaryAmount('#b71c1c')}>
            ₹{totalBankAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#1a1a2e' }}>📊 Data Summary</h4>
        <div style={{ fontSize: '14px', color: '#555' }}>
          <div>• Ledger: {ledgerCount} orders totaling ₹{totalLedgerAmount.toFixed(2)}</div>
          <div>• Settlements: {settlementCount} settlements totaling ₹{totalSettlementAmount.toFixed(2)}</div>
          <div>• Bank: {bankCount} transactions totaling ₹{totalBankAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Issues List */}
      {issues.length > 0 && (
        <div style={uploadStyles.reportIssues}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1a1a2e' }}>Detailed Issues:</h4>
          {issues.map((issue, index) => {
            const severity = issue.severity || 'info'
            const emoji = severity === 'error' ? '🔴' : severity === 'warning' ? '🟡' : 'ℹ️'
            return (
              <div key={index} style={uploadStyles.reportIssueItem}>
                <span style={uploadStyles.reportIssueIcon}>{emoji}</span>
                <div>
                  <div style={uploadStyles.reportIssueMessage}>
                    {issue.message || issue.type}
                  </div>
                  {issue.details && (
                    <div style={uploadStyles.reportIssueDetails}>
                      {Array.isArray(issue.details) ? issue.details.slice(0, 5).join(', ') : issue.details}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info Box */}
      {issues.some(i => i.type === 'missing_column') && (
        <div style={uploadStyles.reportInfoBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span>💡</span>
            <strong style={{ color: '#0d47a1' }}>What this means:</strong>
          </div>
          <p style={uploadStyles.reportInfoText}>
            Your CSV files have different column names than CashSight expects. 
            The mapping step will help you match your columns to the required fields. 
            This is normal and doesn't prevent reconciliation.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={onBack}>
          ← Back to Mapping
        </Button>
        <Button variant="success" onClick={handleContinue}>
          Continue to Dashboard →
        </Button>
      </div>

      {/* Footer */}
      <div style={uploadStyles.footer}>
        <p>CashSight v3.0 — AI Finance Controller for Razorpay Buildathon</p>
      </div>
    </div>
  )
}