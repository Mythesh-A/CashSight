/**
 * Audit Constants
 */

// Action types with their display names and icons
export const AUDIT_ACTIONS = {
  EXCEPTION_DETECTED: 'exception_detected',
  RESOLVE_EXCEPTION: 'resolve_exception',
  BATCH_MATCHED: 'batch_matched',
  RECONCILIATION_COMPLETED: 'reconciliation_completed',
  RECONCILIATION_STARTED: 'reconciliation_started',
  EXPLAIN_EXCEPTION: 'explain_exception',
  UPLOAD_COMPLETED: 'upload_completed',
  VALIDATION_COMPLETED: 'validation_completed',
  SAMPLE_DATA_LOADED: 'sample_data_loaded',
  RESOLUTION_STARTED: 'resolution_started',
  RESOLUTION_COMPLETED: 'resolution_completed',
}

// Action display names
export const AUDIT_ACTION_LABELS = {
  exception_detected: 'Exception Detected',
  resolve_exception: 'Exception Resolved',
  batch_matched: 'Batch Matched',
  reconciliation_completed: 'Reconciliation Completed',
  reconciliation_started: 'Reconciliation Started',
  explain_exception: 'AI Explanation Requested',
  upload_completed: 'Upload Completed',
  validation_completed: 'Validation Completed',
  sample_data_loaded: 'Sample Data Loaded',
  resolution_started: 'Resolution Started',
  resolution_completed: 'Resolution Completed',
}

// Action icons
export const AUDIT_ACTION_ICONS = {
  exception_detected: '🚨',
  resolve_exception: '✅',
  batch_matched: '📦',
  reconciliation_completed: '📊',
  reconciliation_started: '🔄',
  explain_exception: '🤖',
  upload_completed: '📤',
  validation_completed: '✅',
  sample_data_loaded: '📊',
  resolution_started: '🔍',
  resolution_completed: '✅',
}

// Action colors for StatusBadge
export const AUDIT_ACTION_COLORS = {
  exception_detected: 'error',
  resolve_exception: 'success',
  batch_matched: 'info',
  reconciliation_completed: 'success',
  reconciliation_started: 'info',
  explain_exception: 'info',
  upload_completed: 'success',
  validation_completed: 'success',
  sample_data_loaded: 'info',
  resolution_started: 'warning',
  resolution_completed: 'success',
}

// Filter options
export const AUDIT_FILTERS = {
  ALL: 'all',
  EXCEPTIONS: 'exceptions',
  RESOLUTIONS: 'resolutions',
  MATCHES: 'matches',
  UPLOADS: 'uploads',
  SYSTEM: 'system',
}

export const AUDIT_FILTER_LABELS = {
  all: '📋 All',
  exceptions: '🚨 Exceptions',
  resolutions: '✅ Resolutions',
  matches: '📦 Matches',
  uploads: '📤 Uploads',
  system: '⚙️ System',
}

// Filter mapping for backend
export const AUDIT_FILTER_ACTION_MAP = {
  all: null,
  exceptions: 'exception_detected',
  resolutions: 'resolve_exception',
  matches: 'batch_matched',
  uploads: 'upload_completed',
  system: ['reconciliation_started', 'reconciliation_completed'],
}

// Default values
export const AUDIT_DEFAULTS = {
  limit: 100,
  widgetLimit: 5,
  pageSize: 20,
}

// Messages
export const AUDIT_MESSAGES = {
  noLogs: 'No audit events found',
  noLogsForSettlement: 'No audit events found for this settlement',
  loading: 'Loading audit logs...',
  error: 'Failed to load audit logs',
  viewFull: 'View Full Audit Log',
  refresh: 'Refresh',
  backToDashboard: 'Back to Dashboard',
}