/**
 * useExceptions - Hook for managing exceptions data
 */
import { useState, useEffect, useCallback } from 'react'
import { reconciliationService, exceptionService } from '../api/services'

export function useExceptions(filters = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({})
  const [selectedException, setSelectedException] = useState(null)
  const [resolving, setResolving] = useState(false)

  // Fetch exceptions with filters
  const fetchExceptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await reconciliationService.getExceptions(filters)
      const exceptions = response.data.exceptions || []
      setData(exceptions)
      
      // Calculate summary statistics
      const summaryData = {}
      exceptions.forEach(e => {
        const type = e.exception_type || e.type || 'unknown'
        summaryData[type] = (summaryData[type] || 0) + 1
      })
      setSummary(summaryData)
      
      return exceptions
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch exceptions'
      setError(errorMsg)
      console.error('useExceptions error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Auto-fetch on mount or filter change
  useEffect(() => {
    fetchExceptions()
  }, [fetchExceptions])

  // Resolve an exception
  const resolveException = useCallback(async (exceptionId, decision, selectedCombination = null, notes = '') => {
    setResolving(true)
    setError(null)
    try {
      const response = await exceptionService.resolve(
        exceptionId,
        decision,
        selectedCombination,
        notes
      )
      
      // Refresh the list after resolution
      await fetchExceptions()
      
      return response.data
    } catch (err) {
      const errorMsg = err.message || 'Failed to resolve exception'
      setError(errorMsg)
      console.error('resolveException error:', err)
      throw err
    } finally {
      setResolving(false)
    }
  }, [fetchExceptions])

  // Get explanation for an exception
  const getExplanation = useCallback(async (exceptionRecord) => {
    setLoading(true)
    setError(null)
    try {
      const response = await exceptionService.explain(exceptionRecord)
      return response.data.explanation
    } catch (err) {
      const errorMsg = err.message || 'Failed to get explanation'
      setError(errorMsg)
      console.error('getExplanation error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter exceptions by type
  const getByType = useCallback((type) => {
    if (!type || type === 'all') return data
    return data.filter(e => (e.exception_type || e.type) === type)
  }, [data])

  // Filter exceptions by amount range
  const getByAmountRange = useCallback((min, max) => {
    return data.filter(e => {
      const amount = e.amount || e.net_amount || 0
      return amount >= min && amount <= max
    })
  }, [data])

  // Get total exception amount
  const getTotalAmount = useCallback(() => {
    return data.reduce((sum, e) => sum + (e.amount || e.net_amount || 0), 0)
  }, [data])

  // Get exception counts by type
  const getCountsByType = useCallback(() => {
    return summary
  }, [summary])

  return {
    // State
    data,
    loading,
    error,
    summary,
    selectedException,
    resolving,
    
    // Actions
    fetchExceptions,
    resolveException,
    getExplanation,
    setSelectedException,
    
    // Helpers
    getByType,
    getByAmountRange,
    getTotalAmount,
    getCountsByType,
    
    // Derived
    total: data.length,
    totalAmount: data.reduce((sum, e) => sum + (e.amount || e.net_amount || 0), 0),
    hasExceptions: data.length > 0,
    isEmpty: data.length === 0,
    exceptionTypes: Object.keys(summary),
  }
}