/**
 * constants.js - Application constants
 */

// ============================================
// APP CONFIGURATION
// ============================================

export const APP_CONFIG = {
  name: 'CashSight',
  version: '3.0.0',
  description: 'Reconciliation-grounded probabilistic cash forecasting',
}

// ============================================
// API CONFIGURATION
// ============================================

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 120000,
  retryCount: 3,
  retryDelay: 1000,
}

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  HOME: '/',
  UPLOAD: '/upload',
  MAPPING: '/mapping',
  VALIDATION: '/validation',
  DASHBOARD: '/dashboard',
  EXCEPTIONS: '/exceptions',
  FORECAST: '/forecast',
}

// ============================================
// APP STEPS
// ============================================

export const APP_STEPS = {
  UPLOAD: 'upload',
  MAPPING: 'mapping',
  VALIDATION: 'validation',
  DASHBOARD: 'dashboard',
  EXCEPTIONS: 'exceptions',
  MATCHES: 'matches', 
  AUDIT: 'audit', 
  TAX: 'tax', 
  REPORTS: 'reports',
}

// ============================================
// DATA SOURCES
// ============================================

export const DATA_SOURCES = {
  SAMPLE: 'sample',
  UPLOADED: 'uploaded',
}

// ============================================
// EXCEPTION TYPES
// ============================================

export const EXCEPTION_TYPES = {
  MISSING_BANK_CREDIT: 'missing_bank_credit',
  UNRESOLVED_BATCH: 'unresolved_batch',
  AMBIGUOUS_BATCH: 'ambiguous_batch',
  UNLINKED_CREDIT: 'unlinked_credit',
}

export const EXCEPTION_LABELS = {
  [EXCEPTION_TYPES.MISSING_BANK_CREDIT]: 'Missing Bank Credit',
  [EXCEPTION_TYPES.UNRESOLVED_BATCH]: 'Unresolved Batch',
  [EXCEPTION_TYPES.AMBIGUOUS_BATCH]: 'Ambiguous Batch',
  [EXCEPTION_TYPES.UNLINKED_CREDIT]: 'Unlinked Credit',
}

export const EXCEPTION_ICONS = {
  [EXCEPTION_TYPES.MISSING_BANK_CREDIT]: '🔴',
  [EXCEPTION_TYPES.UNRESOLVED_BATCH]: '🟡',
  [EXCEPTION_TYPES.AMBIGUOUS_BATCH]: '🟠',
  [EXCEPTION_TYPES.UNLINKED_CREDIT]: '🔵',
}

export const EXCEPTION_COLORS = {
  [EXCEPTION_TYPES.MISSING_BANK_CREDIT]: 'error',
  [EXCEPTION_TYPES.UNRESOLVED_BATCH]: 'warning',
  [EXCEPTION_TYPES.AMBIGUOUS_BATCH]: 'warning',
  [EXCEPTION_TYPES.UNLINKED_CREDIT]: 'info',
}

// ============================================
// MATCH TYPES
// ============================================

export const MATCH_TYPES = {
  CLEAN: 'clean',
  BATCHED: 'batched_settlement',
}

export const MATCH_LABELS = {
  [MATCH_TYPES.CLEAN]: 'Clean Match',
  [MATCH_TYPES.BATCHED]: 'Batched Settlement',
}

// ============================================
// FILE UPLOAD
// ============================================

export const FILE_TYPES = {
  LEDGER: 'ledger',
  SETTLEMENTS: 'settlements',
  BANK: 'bank',
}

export const FILE_TYPE_LABELS = {
  [FILE_TYPES.LEDGER]: 'Ledger / Orders',
  [FILE_TYPES.SETTLEMENTS]: 'Gateway Settlements',
  [FILE_TYPES.BANK]: 'Bank Statement',
}

export const FILE_TYPE_ICONS = {
  [FILE_TYPES.LEDGER]: '📋',
  [FILE_TYPES.SETTLEMENTS]: '🏦',
  [FILE_TYPES.BANK]: '💰',
}

export const REQUIRED_COLUMNS = {
  [FILE_TYPES.LEDGER]: ['order_id', 'order_date', 'gross_amount', 'customer_id', 'status'],
  [FILE_TYPES.SETTLEMENTS]: ['settlement_id', 'utr', 'settlement_date', 'gross_amount', 'razorpay_fee', 'gst_on_fee', 'tds_deducted', 'net_amount'],
  [FILE_TYPES.BANK]: ['txn_id', 'value_date', 'utr', 'credited_amount', 'narration'],
}

export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFileTypes: ['.csv', 'text/csv'],
  maxRows: 10000,
}

// ============================================
// FORECAST
// ============================================

export const FORECAST_CONFIG = {
  days: 7,
  percentiles: ['p5', 'p50', 'p95'],
  colors: {
    p5: '#FF9800',
    p50: '#2196F3',
    p95: '#DC3545',
    band: 'rgba(33, 150, 243, 0.05)',
  },
}

export const PERCENTILE_LABELS = {
  p5: 'P5 (Optimistic)',
  p50: 'P50 (Expected)',
  p95: 'P95 (Pessimistic)',
}

// ============================================
// RESOLVE OPTIONS
// ============================================

export const RESOLVE_OPTIONS = [
  { value: 'confirm', label: '✅ Confirm', color: 'success' },
  { value: 'reject', label: '❌ Reject', color: 'danger' },
  { value: 'investigate', label: '🔍 Investigate', color: 'warning' },
]

// ============================================
// STATUS
// ============================================

export const STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  INVESTIGATING: 'investigating',
  REJECTED: 'rejected',
}

// ============================================
// DASHBOARD
// ============================================

export const DASHBOARD_CONFIG = {
  refreshInterval: 30000, // 30 seconds
  maxItemsDisplay: 5,
}

// ============================================
// NOTIFICATION
// ============================================

export const NOTIFICATION_CONFIG = {
  duration: 3000,
  position: 'bottom-right',
}

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  general: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  fileValidation: 'Please upload a valid CSV file.',
  fileTooLarge: 'File size exceeds the maximum limit.',
  fileEmpty: 'File is empty. Please upload a file with data.',
  missingColumns: 'Required columns are missing from the file.',
  uploadFailed: 'Failed to upload file. Please try again.',
  reconciliationFailed: 'Reconciliation failed. Please check your data.',
  forecastFailed: 'Failed to generate forecast.',
  exceptionResolveFailed: 'Failed to resolve exception.',
}

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
  uploadSuccess: 'Files uploaded successfully!',
  reconciliationSuccess: 'Reconciliation completed successfully!',
  exceptionResolved: 'Exception resolved successfully!',
  dataRefreshed: 'Data refreshed successfully!',
}

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
}