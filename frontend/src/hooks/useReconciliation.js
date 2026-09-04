/**
 * useReconciliation - Hook for reconciliation data
 */
import { useState, useEffect, useCallback } from 'react'
import { reconciliationService } from '../api/services'

export function useReconciliation() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await reconciliationService.getResults()
      setData(response.data)
      return response.data
    } catch (err) {
      setError(err.message || 'Failed to fetch reconciliation data')
      console.error('useReconciliation error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    matches: data?.matches || [],
    exceptions: data?.exceptions || [],
    summary: data?.summary || {},
  }
}

export function useCashPosition() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await reconciliationService.getCashPosition()
      setData(response.data)
      return response.data
    } catch (err) {
      setError(err.message || 'Failed to fetch cash position')
      console.error('useCashPosition error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    currentCash: data?.current_cash || 0,
    pendingSettlements: data?.pending_settlements || 0,
    totalExpected: data?.total_expected || 0,
    reconciledCount: data?.reconciled_count || 0,
    pendingCount: data?.pending_count || 0,
    matchRate: data?.match_rate || 0,
  }
}

export function useExceptions(filters = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await reconciliationService.getExceptions(filters)
      const exceptions = response.data.exceptions || []
      setData(exceptions)
      
      // Calculate summary
      const summaryData = {}
      exceptions.forEach(e => {
        const type = e.exception_type || e.type || 'unknown'
        summaryData[type] = (summaryData[type] || 0) + 1
      })
      setSummary(summaryData)
      
      return response.data
    } catch (err) {
      setError(err.message || 'Failed to fetch exceptions')
      console.error('useExceptions error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { 
    data, 
    loading, 
    error, 
    summary,
    refetch: fetchData,
    total: data.length,
    getByType: (type) => data.filter(e => (e.exception_type || e.type) === type),
  }
}

export function useForecast() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await reconciliationService.getForecast()
      setData(response.data)
      return response.data
    } catch (err) {
      setError(err.message || 'Failed to fetch forecast')
      console.error('useForecast error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    percentiles: data?.percentiles || {},
    days: data?.days || [],
    pendingCount: data?.pending_count || 0,
    dataSource: data?.data_source || 'sample',
  }
}