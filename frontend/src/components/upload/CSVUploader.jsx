/**
 * CSVUploader - File upload component with drag & drop
 */
import React, { useState, useCallback } from 'react'
import { Button, Card } from '../common'
import { uploadStyles } from './styles'

export default function CSVUploader({ onUpload, onUseSample }) {
  const [files, setFiles] = useState({
    ledger: null,
    settlements: null,
    bank: null
  })
  const [fileData, setFileData] = useState({
    ledger: null,
    settlements: null,
    bank: null
  })
  const [dragOver, setDragOver] = useState({
    ledger: false,
    settlements: false,
    bank: false
  })

  const fileTypes = {
    ledger: {
      label: 'Ledger / Orders',
      icon: '📋',
      description: 'Order data with amounts and customer info',
      requiredColumns: ['order_id', 'order_date', 'gross_amount', 'customer_id', 'status']
    },
    settlements: {
      label: 'Gateway Settlements',
      icon: '🏦',
      description: 'Razorpay settlement reports',
      requiredColumns: ['settlement_id', 'utr', 'settlement_date', 'gross_amount', 'net_amount']
    },
    bank: {
      label: 'Bank Statement',
      icon: '💰',
      description: 'Bank transaction records',
      requiredColumns: ['txn_id', 'value_date', 'utr', 'credited_amount', 'narration']
    }
  }

  const handleFileDrop = useCallback((type, file) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setFiles(prev => ({ ...prev, [type]: file }))
      
      // Read file content for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const rows = text.split('\n').filter(row => row.trim())
        const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        
        const dataRows = rows.slice(1).map(row => {
          const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
          const obj = {}
          headers.forEach((h, i) => {
            const value = cols[i] || ''
            obj[h] = !isNaN(value) && value !== '' ? parseFloat(value) : value
          })
          return obj
        }).filter(row => Object.values(row).some(v => v !== ''))
        
        setFileData(prev => ({
          ...prev,
          [type]: {
            headers,
            data: dataRows,
            totalRows: dataRows.length,
            fullText: text,
            filename: file.name,
            size: file.size
          }
        }))
      }
      reader.readAsText(file)
    } else {
      alert('Please upload a CSV file')
    }
  }, [])

  const handleFileSelect = (type, e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileDrop(type, file)
    }
  }

  const handleDragOver = (type, e) => {
    e.preventDefault()
    setDragOver(prev => ({ ...prev, [type]: true }))
  }

  const handleDragLeave = (type, e) => {
    e.preventDefault()
    setDragOver(prev => ({ ...prev, [type]: false }))
  }

  const handleDrop = (type, e) => {
    e.preventDefault()
    setDragOver(prev => ({ ...prev, [type]: false }))
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileDrop(type, file)
    }
  }

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }))
    setFileData(prev => ({ ...prev, [type]: null }))
  }

  const handleUploadAll = () => {
    const allFiles = Object.values(files)
    if (allFiles.some(f => f === null)) {
      alert('Please upload all three required files')
      return
    }
    onUpload({ files, fileData })
  }

  const isAllUploaded = Object.values(files).every(f => f !== null)

  const FileDropZone = ({ type }) => {
    const config = fileTypes[type]
    const isDragging = dragOver[type]
    const file = files[type]
    const data = fileData[type]

    return (
      <div
        style={uploadStyles.dropZone(isDragging, !!file)}
        onDragOver={(e) => handleDragOver(type, e)}
        onDragLeave={(e) => handleDragLeave(type, e)}
        onDrop={(e) => handleDrop(type, e)}
        onClick={() => document.getElementById(`file-${type}`).click()}
      >
        <input
          id={`file-${type}`}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(type, e)}
        />
        
        {file ? (
          <>
            <div style={{ fontSize: '32px' }}>✅</div>
            <div style={uploadStyles.fileInfo}>{file.name}</div>
            <div style={uploadStyles.fileSize}>
              {(file.size / 1024).toFixed(1)} KB • {data?.totalRows || 0} rows
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeFile(type)
              }}
              style={uploadStyles.removeButton}
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <div style={uploadStyles.dropZoneIcon}>{config.icon}</div>
            <div style={uploadStyles.dropZoneLabel}>{config.label}</div>
            <div style={uploadStyles.dropZoneDescription}>{config.description}</div>
            <div style={uploadStyles.dropZoneBadge}>CSV required</div>
          </>
        )}
      </div>
    )
  }

  return (
    <div style={uploadStyles.container}>
      {/* Header */}
      <div style={uploadStyles.header}>
        <h1 style={uploadStyles.title}>📊 Upload Your Data</h1>
        <p style={uploadStyles.subtitle}>CashSight needs three files to reconcile and forecast</p>
      </div>

      {/* File Upload Grid */}
      <div style={uploadStyles.grid}>
        <FileDropZone type="ledger" />
        <FileDropZone type="settlements" />
        <FileDropZone type="bank" />
      </div>

      {/* Required Columns Reference */}
      <div style={uploadStyles.requiredColumns}>
        <div style={uploadStyles.requiredColumnsTitle}>
          <span style={{ fontSize: '18px' }}>📋</span>
          <span>Required Columns by File</span>
        </div>
        <div style={uploadStyles.requiredColumnsGrid}>
          <div>
            <div style={uploadStyles.requiredColumnLabel}>Ledger</div>
            <div style={uploadStyles.requiredColumnFields}>
              order_id, order_date,<br />
              gross_amount, customer_id,<br />
              status
            </div>
          </div>
          <div>
            <div style={uploadStyles.requiredColumnLabel}>Settlements</div>
            <div style={uploadStyles.requiredColumnFields}>
              settlement_id, utr,<br />
              settlement_date, gross_amount,<br />
              razorpay_fee, gst_on_fee,<br />
              tds_deducted, net_amount
            </div>
          </div>
          <div>
            <div style={uploadStyles.requiredColumnLabel}>Bank Statement</div>
            <div style={uploadStyles.requiredColumnFields}>
              txn_id, value_date,<br />
              utr, credited_amount,<br />
              narration
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={uploadStyles.actions}>
        <button
          onClick={handleUploadAll}
          disabled={!isAllUploaded}
          style={uploadStyles.primaryButton(!isAllUploaded)}
        >
          🚀 Continue to Mapping
        </button>

        <button
          onClick={onUseSample}
          style={uploadStyles.secondaryButton}
          onMouseEnter={(e) => {
            e.target.style.background = '#e3f2fd'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
          }}
        >
          📊 Try Sample Data
        </button>
      </div>

      {/* Status Bar */}
      <div style={uploadStyles.statusBar}>
        <div style={uploadStyles.statusItem}>
          <span style={uploadStyles.statusDot(!!files.ledger)}>
            {files.ledger ? '✅' : '⬜'}
          </span>
          Ledger ({fileData.ledger?.totalRows || 0} rows)
        </div>
        <div style={uploadStyles.statusItem}>
          <span style={uploadStyles.statusDot(!!files.settlements)}>
            {files.settlements ? '✅' : '⬜'}
          </span>
          Settlements ({fileData.settlements?.totalRows || 0} rows)
        </div>
        <div style={uploadStyles.statusItem}>
          <span style={uploadStyles.statusDot(!!files.bank)}>
            {files.bank ? '✅' : '⬜'}
          </span>
          Bank Statement ({fileData.bank?.totalRows || 0} rows)
        </div>
      </div>

      {/* Footer */}
      <div style={uploadStyles.footer}>
        <p>💡 Tip: Drag & drop CSV files directly into each box</p>
        <p style={uploadStyles.footerTip}>CashSight v3.0 — AI Finance Controller for Razorpay Buildathon</p>
      </div>
    </div>
  )
}