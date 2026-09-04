import apiClient from './index'
import { ENDPOINTS } from './endpoints'

// ========== Reconciliation Services ==========

export const reconciliationService = {
  getResults: () => apiClient.get(ENDPOINTS.RECONCILE),
  getScores: () => apiClient.get(ENDPOINTS.SCORE),
  getForecast: () => apiClient.get(ENDPOINTS.FORECAST),
  getCashPosition: () => apiClient.get(ENDPOINTS.CASH_POSITION),
  getExceptions: (filters = {}) => apiClient.get(ENDPOINTS.EXCEPTIONS, { params: filters }),
}

// ========== Upload Services ==========

export const uploadService = {
  analyzeCSV: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(ENDPOINTS.ANALYZE_CSV, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  validateData: (data) => apiClient.post(ENDPOINTS.VALIDATE_DATA, data),
  
  loadSample: () => apiClient.post(ENDPOINTS.LOAD_SAMPLE),
}

// ========== Exception Management Services ==========

export const exceptionService = {
  resolve: (exceptionId, decision, selectedCombination, notes) => 
    apiClient.post(ENDPOINTS.RESOLVE_EXCEPTION, {
      exception_id: exceptionId,
      decision,
      selected_combination: selectedCombination,
      notes,
    }),
  
  explain: (exceptionRecord) => 
    apiClient.post(ENDPOINTS.EXPLAIN, { exception: exceptionRecord }),
  
  getAudit: (settlementId) => 
    apiClient.get(ENDPOINTS.AUDIT(settlementId)),
}

// ========== System Services ==========

export const systemService = {
  health: () => apiClient.get(ENDPOINTS.HEALTH),
  cacheStatus: () => apiClient.get(ENDPOINTS.CACHE_STATUS),
}