/**
 * TaxAnalyzer - Main Tax & Fee Analyzer component
 */
import React, { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner, StatusBadge } from '../common'
import TaxSummary from './TaxSummary'
import TaxTable from './TaxTable'
import TaxMonthly from './TaxMonthly'
import TaxDetails from './TaxDetails'
import { currency } from '../../utils/formatters'

export default function TaxAnalyzer({ onBack }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSettlement, setSelectedSettlement] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchTaxAnalysis()
  }, [])

  const fetchTaxAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://cashsight-api.onrender.com/api/tax-analyzer')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch tax analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (settlement) => {
    setSelectedSettlement(settlement)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedSettlement(null)
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 20px' }}>
        <LoadingSpinner message="Analyzing tax and fee data..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ color: '#dc3545' }}>Error Loading Tax Analysis</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <Button variant="primary" onClick={fetchTaxAnalysis}>
          🔄 Retry
        </Button>
      </div>
    )
  }

  if (!data || data.summary.total_settlements === 0) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{ margin: 0 }}>🧾 Tax & Fee Analyzer</h2>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>
              Analyze gateway fees, GST, and TDS from settlement data
            </p>
          </div>
          <Button variant="primary" onClick={onBack} icon="←">
            Back to Dashboard
          </Button>
        </div>

        <Card variant="info">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#666' }}>No Settlement Data Available</h3>
            <p style={{ color: '#999' }}>
              Upload settlement data to analyze gateway fees, GST, and TDS deductions.
            </p>
            <Button variant="primary" onClick={onBack}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>🧾 Tax & Fee Analyzer</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            Analyze gateway fees, GST, and TDS from {data.summary.total_settlements} settlements
            {data.validation_status.has_errors && (
              <span style={{ marginLeft: '12px', color: '#dc3545' }}>
                ⚠️ {data.validation_status.mismatches} calculation mismatches found
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="small" onClick={fetchTaxAnalysis} icon="🔄">
            Refresh
          </Button>
          <Button variant="primary" size="small" onClick={onBack} icon="←">
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <TaxSummary summary={data.summary} rates={data.rates} />

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '24px',
      }}>
        {/* Gross vs Net Chart - Simplified */}
        <Card title="📊 Gross vs Net Settlement">
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Gross Amount</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d47a1' }}>
                  {currency(data.summary.gross_amount)}
                </div>
              </div>
              <div style={{ fontSize: '24px', color: '#ccc' }}>→</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Net Settlement</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
                  {currency(data.summary.net_amount)}
                </div>
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(data.summary.net_amount / data.summary.gross_amount) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2196F3, #4CAF50)',
                borderRadius: '4px',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#666' }}>
              <span>0%</span>
              <span>{data.rates.effective_deduction_rate}% deducted</span>
              <span>100%</span>
            </div>
          </div>
        </Card>

        {/* Fee Breakdown */}
        <Card title="📊 Fee Breakdown">
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Gateway Fee</span>
                  <span style={{ fontWeight: 'bold' }}>{currency(data.summary.razorpay_fee)}</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#f0f0f0',
                  borderRadius: '2px',
                  marginTop: '2px',
                }}>
                  <div style={{
                    width: `${(data.summary.razorpay_fee / data.summary.gross_amount) * 100}%`,
                    height: '100%',
                    background: '#ff9800',
                    borderRadius: '2px',
                  }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>GST on Fee</span>
                  <span style={{ fontWeight: 'bold' }}>{currency(data.summary.gst_on_fee)}</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#f0f0f0',
                  borderRadius: '2px',
                  marginTop: '2px',
                }}>
                  <div style={{
                    width: `${(data.summary.gst_on_fee / data.summary.gross_amount) * 100}%`,
                    height: '100%',
                    background: '#2196F3',
                    borderRadius: '2px',
                  }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>TDS Deducted</span>
                  <span style={{ fontWeight: 'bold' }}>{currency(data.summary.tds_deducted)}</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#f0f0f0',
                  borderRadius: '2px',
                  marginTop: '2px',
                }}>
                  <div style={{
                    width: `${(data.summary.tds_deducted / data.summary.gross_amount) * 100}%`,
                    height: '100%',
                    background: '#dc3545',
                    borderRadius: '2px',
                  }} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <div style={{ marginBottom: '24px' }}>
        <TaxMonthly monthlyData={data.monthly_breakdown} />
      </div>

      {/* Settlement Table */}
      <div style={{ marginBottom: '24px' }}>
        <TaxTable
          settlements={data.settlements}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Exceptions */}
      {data.exceptions.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Card title="⚠️ Exceptions Detected">
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Settlement</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>UTR</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Issue</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.exceptions.map((exc, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                        {exc.settlement_id}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px' }}>
                        {exc.utr}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <StatusBadge
                          status="error"
                          label={exc.issue.type}
                          size="small"
                        />
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', color: '#666' }}>
                        {exc.issue.type === 'CALCULATION_MISMATCH' && (
                          `Source: ${currency(exc.issue.source_net)} → Calculated: ${currency(exc.issue.calculated_net)}`
                        )}
                        {exc.issue.type === 'NEGATIVE_GROSS' && `Gross: ${currency(exc.issue.value)}`}
                        {exc.issue.type === 'EXCESSIVE_DEDUCTIONS' && (
                          `Deductions: ${currency(exc.issue.deductions)} > Gross: ${currency(exc.issue.gross)}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        padding: '16px',
        background: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffc107',
        fontSize: '13px',
        color: '#856404',
        marginTop: '20px',
      }}>
        <strong>📝 Note:</strong> Tax & Fee Analyzer summarizes deductions reported in the uploaded settlement data. 
        It is not a tax filing or tax-liability calculator. Actual tax treatment may depend on the merchant's 
        circumstances and applicable regulations.
      </div>

      {/* Settlement Details Modal */}
      {showDetails && selectedSettlement && (
        <TaxDetails
          settlement={selectedSettlement}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  )
}