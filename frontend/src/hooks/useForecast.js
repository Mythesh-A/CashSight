/**
 * useForecast - Hook for forecast data
 */
import { useState, useEffect, useCallback } from 'react'

export function useForecast(options = {}) {
  const { autoFetch = true } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchForecast = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://cashsight-api.onrender.com/api/forecast')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setData(data)
      return data
    } catch (err) {
      setError(err.message)
      console.error('useForecast error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchForecast()
    }
  }, [autoFetch, fetchForecast])

  const getChartData = useCallback(() => {
    if (!data?.percentiles) return []
    const { p5, p50, p95 } = data.percentiles
    const days = data.days || p5.map((_, i) => `Day ${i + 1}`)
    
    return days.map((day, index) => ({
      day,
      dayNumber: index + 1,
      p5: p5[index] || 0,
      p50: p50[index] || 0,
      p95: p95[index] || 0,
    }))
  }, [data])

  const getSummary = useCallback(() => {
    if (!data?.percentiles) return null
    const { p5, p50, p95 } = data.percentiles
    const lastIndex = p5.length - 1
    
    return {
      optimistic: p5[lastIndex] || 0,
      expected: p50[lastIndex] || 0,
      pessimistic: p95[lastIndex] || 0,
      totalPending: data.pending_count || 0,
    }
  }, [data])

  return {
    data,
    loading,
    error,
    fetchForecast,
    refetch: fetchForecast,
    getChartData,
    getSummary,
    hasData: data !== null && data.percentiles !== undefined,
  }
}