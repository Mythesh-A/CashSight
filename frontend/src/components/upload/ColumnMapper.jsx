/**
 * ColumnMapper - Map uploaded CSV columns to CashSight schema with auto-mapping
 */
import React, { useState, useEffect } from 'react'
import { Button, LoadingSpinner } from '../common'
import { uploadStyles } from './styles'

export default function ColumnMapper({ files, onComplete, onBack }) {
  const [analysis, setAnalysis] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mappings, setMappings] = useState({})
  const [csvData, setCsvData] = useState({})

  useEffect(() => {
    const analyzeFiles = async () => {
      setLoading(true)
      setError(null)
      try {
        const results = {}
        const csvDataResults = {}
        const types = ['ledger', 'settlements', 'bank']
        
        for (const type of types) {
          const fileObj = files.files?.[type]
          const fileInfo = files.fileData?.[type]
          
          if (fileObj && fileInfo) {
            const dataRows = fileInfo.data || []
            const headers = fileInfo.headers || []
            
            csvDataResults[type] = dataRows
            
            results[type] = {
              filename: fileObj.name,
              headers: headers,
              sampleRows: dataRows.slice(0, 5),
              totalRows: dataRows.length,
              suggestedMapping: {}
            }
          }
        }
        
        setAnalysis(results)
        setCsvData(csvDataResults)
        
        // 🔥 AUTO-MAP columns based on field matching
        const initialMappings = {}
        Object.keys(results).forEach(key => {
          const data = results[key]
          const mapping = {}
          
          // Define field patterns for each type
          const fieldPatterns = {
            // Ledger fields
            'order_id': ['order_id', 'orderid', 'order number', 'order_no', 'order'],
            'order_date': ['order_date', 'orderdate', 'date', 'order date', 'created_at', 'createdat', 'order_date'],
            'gross_amount': ['gross_amount', 'amount', 'gross', 'order_amount', 'total', 'orderamount', 'gross amount'],
            'customer_id': ['customer_id', 'customerid', 'customer', 'user_id', 'client_id'],
            'status': ['status', 'order_status', 'payment_status', 'state'],
            // Settlement fields
            'settlement_id': ['settlement_id', 'settlementid', 'settlement no', 'settlement_no', 'stl_id', 'settlement id'],
            'utr': ['utr', 'utr_number', 'utr_no', 'bank_ref', 'reference_no'],
            'settlement_date': ['settlement_date', 'settlementdate', 'settlement date', 'txn_date', 'settlement_date'],
            'razorpay_fee': ['razorpay_fee', 'fee', 'razorpay_fees', 'platform_fee', 'pg_charge', 'azorpay_fee', 'razorpay fee'],
            'gst_on_fee': ['gst_on_fee', 'gst', 'tax', 'gst_amount', 'tax_amount', 'gst on fee', 'gst_on_fee'],
            'tds_deducted': ['tds_deducted', 'tds', 'tds_amount', 'withholding_tax', 'tds deducted'],
            'net_amount': ['net_amount', 'net', 'net_settlement', 'settled_amount', 'net amount'],
            // Bank fields
            'txn_id': ['txn_id', 'transaction_id', 'txnid', 'transaction_no', 'bank_ref_no'],
            'value_date': ['value_date', 'valuedate', 'value date', 'bank_date', 'transaction_date', 'value_date'],
            'credited_amount': ['credited_amount', 'credit_amount', 'credit', 'deposit', 'inflow', 'credited amount'],
            'narration': ['narration', 'description', 'remarks', 'particulars', 'details']
          }
          
          // 🔥 Auto-map: For each expected field, find the best matching header
          const expectedFields = getExpectedFields(key)
          expectedFields.forEach(field => {
            const patterns = fieldPatterns[field] || []
            let bestMatch = null
            let bestScore = 0
            
            data.headers.forEach(header => {
              const headerLower = header.toLowerCase().trim().replace(/[_\s]+/g, ' ')
              // Check exact match first
              if (headerLower === field || headerLower === field.replace(/_/g, ' ')) {
                bestMatch = header
                bestScore = 100
                return
              }
              // Check pattern match
              for (const pattern of patterns) {
                const patternLower = pattern.toLowerCase().trim()
                if (headerLower === patternLower || 
                    headerLower.includes(patternLower) || 
                    patternLower.includes(headerLower)) {
                  const score = patternLower.length / Math.max(headerLower.length, patternLower.length)
                  if (score > bestScore) {
                    bestScore = score
                    bestMatch = header
                  }
                }
              }
            })
            
            // Only set mapping if confidence is reasonable (> 0.5)
            if (bestMatch && bestScore > 0.5) {
              mapping[field] = bestMatch
            }
          })
          
          initialMappings[key] = mapping
        })
        
        setMappings(initialMappings)
      } catch (err) {
        setError(err.message)
        console.error('Error analyzing files:', err)
      } finally {
        setLoading(false)
      }
    }
    
    analyzeFiles()
  }, [files])

  const getExpectedFields = (type) => {
    const fields = {
      ledger: ['order_id', 'order_date', 'gross_amount', 'customer_id', 'status'],
      settlements: ['settlement_id', 'utr', 'settlement_date', 'gross_amount', 'razorpay_fee', 'gst_on_fee', 'tds_deducted', 'net_amount'],
      bank: ['txn_id', 'value_date', 'utr', 'credited_amount', 'narration']
    }
    return fields[type] || []
  }

  const handleMappingChange = (type, field, value) => {
    setMappings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  const handleContinue = () => {
    const mappedData = {
      ledger_data: csvData.ledger || [],
      settlement_data: csvData.settlements || [],
      bank_data: csvData.bank || [],
      mappings: mappings,
      original_columns: {
        ledger: analysis.ledger?.headers || [],
        settlements: analysis.settlements?.headers || [],
        bank: analysis.bank?.headers || []
      }
    }
    
    console.log('📤 Sending data to validation:', {
      ledger_rows: mappedData.ledger_data.length,
      settlement_rows: mappedData.settlement_data.length,
      bank_rows: mappedData.bank_data.length
    })
    
    onComplete(mappedData)
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner message="Analyzing CSV files..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ color: '#dc3545' }}>Error Analyzing Files</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <Button variant="primary" onClick={onBack}>← Go Back</Button>
      </div>
    )
  }

  const typeLabels = {
    ledger: '📋 Ledger / Orders',
    settlements: '🏦 Gateway Settlements',
    bank: '💰 Bank Statement'
  }

  const expectedFields = {
    ledger: ['order_id', 'order_date', 'gross_amount', 'customer_id', 'status'],
    settlements: ['settlement_id', 'utr', 'settlement_date', 'gross_amount', 'razorpay_fee', 'gst_on_fee', 'tds_deducted', 'net_amount'],
    bank: ['txn_id', 'value_date', 'utr', 'credited_amount', 'narration']
  }

  const hasData = Object.keys(csvData).some(key => csvData[key] && csvData[key].length > 0)

  if (!hasData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2>No Data Found</h2>
        <p style={{ color: '#666' }}>Please make sure your CSV files contain valid data.</p>
        <Button variant="primary" onClick={onBack}>← Go Back</Button>
      </div>
    )
  }

  return (
    <div style={uploadStyles.mapperContainer}>
      <h2>🔍 Map Your Columns</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        CashSight has automatically detected and mapped your columns. Confirm or adjust the mappings below.
      </p>
      
      {Object.keys(analysis).map(type => {
        const data = analysis[type]
        if (!data || data.totalRows === 0) return null

        return (
          <div key={type} style={uploadStyles.mapperFileCard}>
            <h3 style={uploadStyles.mapperFileTitle}>
              {typeLabels[type] || type}
            </h3>
            <div style={uploadStyles.mapperFileInfo}>
              {data.totalRows} rows • {data.filename}
            </div>
            
            <div style={uploadStyles.mapperColumns}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Detected Columns:</div>
                <div style={uploadStyles.mapperColumnList}>
                  {data.headers.map((h, i) => (
                    <span key={i} style={uploadStyles.mapperColumnTag}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Map to CashSight Fields:</div>
                {expectedFields[type].map(field => {
                  const currentValue = mappings[type]?.[field] || ''
                  const isMapped = currentValue !== ''
                  
                  return (
                    <div key={field} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}>
                      <span style={uploadStyles.mapperFieldLabel}>
                        {field}
                      </span>
                      <select
                        value={currentValue}
                        onChange={(e) => handleMappingChange(type, field, e.target.value)}
                        style={{
                          ...uploadStyles.mapperSelect,
                          borderColor: isMapped ? '#4CAF50' : '#ddd',
                          background: isMapped ? '#f0faf0' : 'white',
                        }}
                      >
                        <option value="">— Select column —</option>
                        {data.headers.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {isMapped && (
                        <span style={{ fontSize: '16px', color: '#4CAF50' }}>✅</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sample data preview */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Preview (first 3 rows):</div>
              <div style={uploadStyles.mapperPreview}>
                <table style={uploadStyles.mapperPreviewTable}>
                  <thead>
                    <tr>
                      {data.headers.map((h, i) => (
                        <th key={i} style={uploadStyles.mapperPreviewTh}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.sampleRows.slice(0, 3).map((row, i) => (
                      <tr key={i}>
                        {data.headers.map((h, j) => (
                          <td key={j} style={uploadStyles.mapperPreviewTd}>
                            {row[h] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      })}
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
        <Button variant="secondary" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="primary" onClick={handleContinue}>
          Continue to Validation →
        </Button>
      </div>
    </div>
  )
}