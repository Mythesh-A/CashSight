/**
 * DataContext - Data management and API calls
 */
import React, { createContext, useContext, useState, useCallback } from 'react'
import { reconciliationService, uploadService } from '../api/services'

const DataContext = createContext()

export function DataProvider({ children }) {
  const [dataSource, setDataSource] = useState(null)
  const [reconciliationData, setReconciliationData] = useState(null)
  const [exceptions, setExceptions] = useState([])
  const [forecast, setForecast] = useState(null)
  const [cashPosition, setCashPosition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadSampleData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await uploadService.loadSample()
      
      const [reconcile, exceptionsRes, cash, forecastRes] = await Promise.all([
        reconciliationService.getResults(),
        reconciliationService.getExceptions(),
        reconciliationService.getCashPosition(),
        reconciliationService.getForecast(),
      ])
      
      setReconciliationData(reconcile.data)
      setExceptions(exceptionsRes.data.exceptions || [])
      setCashPosition(cash.data)
      setForecast(forecastRes.data)
      setDataSource('sample')
      setLastUpdated(new Date().toISOString())
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      console.error('Failed to load sample data:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [reconcile, exceptionsRes, cash, forecastRes] = await Promise.all([
        reconciliationService.getResults(),
        reconciliationService.getExceptions(),
        reconciliationService.getCashPosition(),
        reconciliationService.getForecast(),
      ])
      
      setReconciliationData(reconcile.data)
      setExceptions(exceptionsRes.data.exceptions || [])
      setCashPosition(cash.data)
      setForecast(forecastRes.data)
      setLastUpdated(new Date().toISOString())
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      console.error('Failed to refresh data:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const setUploadedData = useCallback((data) => {
    setReconciliationData(data)
    setDataSource('uploaded')
    setLastUpdated(new Date().toISOString())
  }, [])

  const updateDataSource = useCallback((source) => {
    console.log('📊 DataContext: updating dataSource to:', source)
    setDataSource(source)
  }, [])

  const clearData = useCallback(() => {
    setReconciliationData(null)
    setExceptions([])
    setForecast(null)
    setCashPosition(null)
    setDataSource(null)
    setLastUpdated(null)
    setError(null)
  }, [])

  const value = {
    dataSource,
    reconciliationData,
    exceptions,
    forecast,
    cashPosition,
    loading,
    error,
    lastUpdated,
    
    loadSampleData,
    refreshData,
    setUploadedData,
    updateDataSource,
    clearData,
    setExceptions,
    setReconciliationData,
    setCashPosition,
    setForecast,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}