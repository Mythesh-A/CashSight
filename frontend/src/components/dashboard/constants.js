/**
 * Dashboard Constants
 */
export const DASHBOARD_CONFIG = {
  refreshInterval: 30000, // 30 seconds
  maxItemsDisplay: 5,
  
  colors: {
    match: '#2e7d32',
    exception: '#c62828',
    pending: '#e65100',
    primary: '#0d47a1',
  },
  
  messages: {
    noData: 'No data available',
    loading: 'Loading dashboard data...',
    error: 'Failed to load dashboard data',
    refresh: 'Refreshing data...',
  },
}

export const EXCEPTION_TYPES = {
  MISSING_BANK_CREDIT: 'missing_bank_credit',
  UNRESOLVED_BATCH: 'unresolved_batch',
  AMBIGUOUS_BATCH: 'ambiguous_batch',
  UNLINKED_CREDIT: 'unlinked_credit',
}

export const MATCH_TYPES = {
  CLEAN: 'clean',
  BATCHED: 'batched_settlement',
}