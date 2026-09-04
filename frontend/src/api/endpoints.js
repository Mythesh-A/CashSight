export const ENDPOINTS = {
  // Reconciliation
  RECONCILE: '/api/reconcile',
  SCORE: '/api/score',
  FORECAST: '/api/forecast',
  CASH_POSITION: '/api/cash-position',
  EXCEPTIONS: '/api/exceptions',
  
  // Upload & Validation
  ANALYZE_CSV: '/api/analyze-csv',
  VALIDATE_DATA: '/api/validate-data',
  LOAD_SAMPLE: '/api/load-sample',
  
  // Exception Management
  RESOLVE_EXCEPTION: '/api/resolve-exception',
  EXPLAIN: '/api/explain',
  AUDIT: (id) => `/api/audit/${id}`,
  
  // System
  HEALTH: '/api/health',
  CACHE_STATUS: '/api/cache-status',
}