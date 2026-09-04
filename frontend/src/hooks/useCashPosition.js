/**
 * useCashPosition - Hook for cash position data
 */
import { useState, useEffect, useCallback } from 'react'
import { reconciliationService } from '../api/services'

export function useCashPosition(options = {}) {
  const { 
    autoFetch = true, 
    refreshInterval = null 
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchCashPosition = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await reconciliationService.getCashPosition()
      const cashData = response.data
      
      // Store previous data in history
      if (data) {
        setHistory(prev => [...prev, { ...data, timestamp: new Date().toISOString() }].slice(-50))
      }
      
      setData(cashData)
      setLastUpdated(new Date().toISOString())
      return cashData
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch cash position'
      setError(errorMsg)
      console.error('useCashPosition error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [data])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchCashPosition()
    }
  }, [autoFetch, fetchCashPosition])

  // Auto-refresh if interval is set
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchCashPosition()
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [refreshInterval, fetchCashPosition])

  // Get cash position breakdown
  const getBreakdown = useCallback(() => {
    if (!data) return null
    return {
      reconciled: data.current_cash || 0,
      pending: data.pending_settlements || 0,
      total: data.total_expected || 0,
      matchRate: data.match_rate || 0,
    }
  }, [data])

  // Get match statistics
  const getMatchStats = useCallback(() => {
    if (!data) return null
    const total = (data.reconciled_count || 0) + (data.pending_count || 0)
    return {
      total,
      matched: data.reconciled_count || 0,
      pending: data.pending_count || 0,
      matchRate: data.match_rate || 0,
      pendingRate: total > 0 ? ((data.pending_count || 0) / total) * 100 : 0,
    }
  }, [data])

  // Check if cash position is healthy
  const isHealthy = useCallback(() => {
    if (!data) return false
    return (data.match_rate || 0) >= 70 && (data.pending_count || 0) < 10
  }, [data])

  // Get status message
  const getStatus = useCallback(() => {
    if (!data) return { status: 'unknown', message: 'No data available' }
    
    const rate = data.match_rate || 0
    const pending = data.pending_count || 0
    
    if (rate >= 90 && pending === 0) {
      return { status: 'excellent', message: 'All settlements reconciled! ✅' }
    } else if (rate >= 75) {
      return { status: 'good', message: 'Most settlements reconciled' }
    } else if (rate >= 50) {
      return { status: 'fair', message: 'Some settlements pending' }
    } else {
      return { status: 'poor', message: 'Many settlements need attention' }
    }
  }, [data])

  // Get amount distribution
  const getAmountDistribution = useCallback(() => {
    if (!data) return null
    const total = data.total_expected || 0
    const current = data.current_cash || 0
    const pending = data.pending_settlements || 0
    
    return {
      current: total > 0 ? (current / total) * 100 : 0,
      pending: total > 0 ? (pending / total) * 100 : 0,
      reconciled: total > 0 ? (current / total) * 100 : 0,
    }
  }, [data])

  // Get time series data for charts
  const getTimeSeries = useCallback(() => {
    if (history.length === 0) return []
    return history.map((item, index) => ({
      time: index,
      timestamp: item.timestamp,
      cash: item.current_cash || 0,
      pending: item.pending_settlements || 0,
      total: item.total_expected || 0,
    }))
  }, [history])

  return {
    // State
    data,
    loading,
    error,
    history,
    lastUpdated,
    
    // Actions
    fetchCashPosition,
    refetch: fetchCashPosition,
    
    // Data access
    getBreakdown,
    getMatchStats,
    getStatus,
    getAmountDistribution,
    getTimeSeries,
    isHealthy: isHealthy(),
    
    // Derived values
    currentCash: data?.current_cash || 0,
    pendingSettlements: data?.pending_settlements || 0,
    totalExpected: data?.total_expected || 0,
    reconciledCount: data?.reconciled_count || 0,
    pendingCount: data?.pending_count || 0,
    matchRate: data?.match_rate || 0,
    dataSource: data?.data_source || 'sample',
    
    // Convenience
    hasData: data !== null,
    hasPending: (data?.pending_count || 0) > 0,
    hasMatches: (data?.reconciled_count || 0) > 0,
  }
}