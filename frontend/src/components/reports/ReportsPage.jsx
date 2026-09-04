/**
 * ReportsPage - Download Reports page
 */
import React, { useState } from 'react'
import { Card, Button, LoadingSpinner } from '../common'
import ReportCard from './ReportCard'

export default function ReportsPage({ onBack }) {
  const [loading, setLoading] = useState(null)
  const [success, setSuccess] = useState(null)

  const downloadReport = async (reportType, endpoint, filename) => {
    setLoading(reportType)
    setSuccess(null)
    
    try {
      const response = await fetch(`https://cashsight-api.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }
      
      // Get the blob from response
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setSuccess(reportType)
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (error) {
      console.error(`Failed to download ${reportType} report:`, error)
      alert(error.message || 'Failed to generate report. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const reports = [
    {
      id: 'reconciliation',
      title: '📊 Reconciliation Report',
      description: 'Detailed settlement matching, exceptions, pending items and data-quality analysis.',
      endpoint: '/api/reports/reconciliation',
      filename: 'CashSight_Reconciliation_Report.pdf',
      primary: false,
    },
    {
      id: 'forecast',
      title: '📈 Cash Flow Forecast Report',
      description: '7-day synthetic cash-flow scenarios with P5, P50 and P95 projections.',
      endpoint: '/api/reports/forecast',
      filename: 'CashSight_Forecast_Report.pdf',
      primary: false,
    },
    {
      id: 'tax-fee',
      title: '🧾 Tax & Fee Analysis Report',
      description: 'Detailed analysis of gateway fees, GST, TDS, deductions and net settlements.',
      endpoint: '/api/reports/tax-fee',
      filename: 'CashSight_Tax_Fee_Analysis.pdf',
      primary: false,
    },
    {
      id: 'full',
      title: '📑 Full CashSight Report',
      description: 'Complete financial operations report combining reconciliation, forecasting and tax & fee analysis.',
      endpoint: '/api/reports/full',
      filename: 'CashSight_Full_Report.pdf',
      primary: true,
    },
  ]

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
          <h2 style={{ margin: 0, fontSize: '24px' }}>📄 Download Reports</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            Generate detailed, shareable financial reports from your CashSight analysis.
          </p>
        </div>
        <Button variant="primary" onClick={onBack} icon="←">
          Back to Dashboard
        </Button>
      </div>

      {/* Success Toast */}
      {success && (
        <div style={{
          padding: '12px 20px',
          background: '#e8f5e9',
          borderRadius: '8px',
          border: '1px solid #a5d6a7',
          color: '#2e7d32',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          ✅ Report downloaded successfully!
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
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
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <LoadingSpinner message="Generating report..." />
            <p style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>
              Please wait while your report is being generated...
            </p>
          </div>
        </div>
      )}

      {/* Report Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '20px',
      }}>
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            isPrimary={report.primary}
            isLoading={loading === report.id}
            onDownload={() => downloadReport(report.id, report.endpoint, report.filename)}
          />
        ))}
      </div>

      {/* Info Note */}
      <div style={{
        marginTop: '30px',
        padding: '16px',
        background: '#e3f2fd',
        borderRadius: '8px',
        border: '1px solid #90caf9',
        fontSize: '13px',
        color: '#0d47a1',
      }}>
        <strong>💡 Note:</strong> All reports are generated in real-time from your uploaded data. 
        Please ensure you have uploaded and reconciled data before generating reports.
      </div>
    </div>
  )
}