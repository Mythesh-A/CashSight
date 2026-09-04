/**
 * AppContext - Global app state
 */
import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [appState, setAppState] = useState({
    step: 'upload',
    currentView: 'dashboard',
    loading: false,
    error: null,
  })

  const [dataSource, setDataSource] = useState('sample')
  const [uploadedFiles, setUploadedFiles] = useState(null)
  const [mappedData, setMappedData] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [reconciliationData, setReconciliationData] = useState(null)
  const [exceptions, setExceptions] = useState([])
  const [forecastData, setForecastData] = useState(null)
  const [cashPosition, setCashPosition] = useState(null)

  const setStep = useCallback((step) => {
    setAppState(prev => ({ ...prev, step }))
  }, [])

  const setLoading = useCallback((loading) => {
    setAppState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error) => {
    setAppState(prev => ({ ...prev, error }))
  }, [])

  const updateDataSource = useCallback((source) => {
    console.log('📊 AppContext: updating dataSource to:', source)
    setDataSource(source)
  }, [])

  const resetApp = useCallback(() => {
    setAppState({
      step: 'upload',
      currentView: 'dashboard',
      loading: false,
      error: null,
    })
    setDataSource('sample')
    setUploadedFiles(null)
    setMappedData(null)
    setValidationResult(null)
    setReconciliationData(null)
    setExceptions([])
    setForecastData(null)
    setCashPosition(null)
  }, [])

  const value = {
    appState,
    dataSource,
    uploadedFiles,
    mappedData,
    validationResult,
    reconciliationData,
    exceptions,
    forecastData,
    cashPosition,
    setStep,
    setLoading,
    setError,
    updateDataSource,
    setUploadedFiles,
    setMappedData,
    setValidationResult,
    setReconciliationData,
    setExceptions,
    setForecastData,
    setCashPosition,
    resetApp,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// 🔥 Also export AppContext if needed
export { AppContext }