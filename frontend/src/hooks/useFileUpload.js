/**
 * useFileUpload - Hook for file upload handling
 */
import { useState, useCallback } from 'react'
import { uploadService } from '../api/services'

export function useFileUpload() {
  const [files, setFiles] = useState({
    ledger: null,
    settlements: null,
    bank: null,
  })
  const [fileData, setFileData] = useState({
    ledger: null,
    settlements: null,
    bank: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState({
    ledger: 0,
    settlements: 0,
    bank: 0,
  })

  const validateFile = useCallback((file) => {
    if (!file) {
      return { valid: false, error: 'No file selected' }
    }
    
    if (!file.type || (!file.type.includes('csv') && !file.name.endsWith('.csv'))) {
      return { valid: false, error: 'Please upload a CSV file' }
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size exceeds 10MB limit' }
    }
    
    return { valid: true }
  }, [])

  const parseCSV = useCallback((text) => {
    const rows = text.split('\n').filter(row => row.trim())
    if (rows.length === 0) {
      return { headers: [], data: [], totalRows: 0 }
    }
    
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
    
    return { headers, data: dataRows, totalRows: dataRows.length }
  }, [])

  const handleFileDrop = useCallback((type, file) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return false
    }

    setFiles(prev => ({ ...prev, [type]: file }))
    setProgress(prev => ({ ...prev, [type]: 20 }))

    const reader = new FileReader()
    reader.onload = (e) => {
      setProgress(prev => ({ ...prev, [type]: 50 }))
      const text = e.target.result
      const parsed = parseCSV(text)
      
      setFileData(prev => ({
        ...prev,
        [type]: {
          ...parsed,
          filename: file.name,
          size: file.size,
          fullText: text,
        }
      }))
      setProgress(prev => ({ ...prev, [type]: 100 }))
    }
    
    reader.onerror = () => {
      setError('Failed to read file')
      setProgress(prev => ({ ...prev, [type]: 0 }))
    }
    
    reader.readAsText(file)
    return true
  }, [validateFile, parseCSV])

  const handleFileSelect = useCallback((type, event) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileDrop(type, file)
    }
  }, [handleFileDrop])

  const removeFile = useCallback((type) => {
    setFiles(prev => ({ ...prev, [type]: null }))
    setFileData(prev => ({ ...prev, [type]: null }))
    setProgress(prev => ({ ...prev, [type]: 0 }))
  }, [])

  const clearAllFiles = useCallback(() => {
    setFiles({ ledger: null, settlements: null, bank: null })
    setFileData({ ledger: null, settlements: null, bank: null })
    setProgress({ ledger: 0, settlements: 0, bank: 0 })
    setError(null)
  }, [])

  const isAllUploaded = useCallback(() => {
    return Object.values(files).every(f => f !== null)
  }, [files])

  const getFileStats = useCallback(() => {
    const stats = {}
    Object.keys(fileData).forEach(type => {
      const data = fileData[type]
      stats[type] = {
        filename: files[type]?.name || null,
        totalRows: data?.totalRows || 0,
        headers: data?.headers || [],
        size: files[type]?.size || 0,
        progress: progress[type] || 0,
        uploaded: files[type] !== null,
      }
    })
    return stats
  }, [files, fileData, progress])

  return {
    files,
    fileData,
    loading,
    error,
    progress,
    handleFileDrop,
    handleFileSelect,
    removeFile,
    clearAllFiles,
    isAllUploaded: isAllUploaded(),
    fileStats: getFileStats(),
    setError,
    setLoading,
  }
}