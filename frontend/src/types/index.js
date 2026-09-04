/**
 * types/index.js - Type definitions for the application
 * 
 * This file contains all type definitions, constants, and enumerations
 * used across the application. It serves as a single source of truth
 * for data structures and types.
 */

// ============================================
// APP TYPES
// ============================================

/**
 * App step types
 * @typedef {'upload' | 'mapping' | 'validation' | 'dashboard' | 'exceptions'} AppStep
 */
export const AppStep = {
  UPLOAD: 'upload',
  MAPPING: 'mapping',
  VALIDATION: 'validation',
  DASHBOARD: 'dashboard',
  EXCEPTIONS: 'exceptions',
}

/**
 * View types
 * @typedef {'dashboard' | 'exceptions'} ViewType
 */
export const ViewType = {
  DASHBOARD: 'dashboard',
  EXCEPTIONS: 'exceptions',
}

/**
 * Data source types
 * @typedef {'sample' | 'uploaded'} DataSource
 */
export const DataSource = {
  SAMPLE: 'sample',
  UPLOADED: 'uploaded',
}

/**
 * Status types
 * @typedef {'pending' | 'resolved' | 'investigating' | 'rejected'} Status
 */
export const Status = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  INVESTIGATING: 'investigating',
  REJECTED: 'rejected',
}

// ============================================
// EXCEPTION TYPES
// ============================================

/**
 * Exception type enum
 * @typedef {'missing_bank_credit' | 'unresolved_batch' | 'ambiguous_batch' | 'unlinked_credit'} ExceptionType
 */
export const ExceptionType = {
  MISSING_BANK_CREDIT: 'missing_bank_credit',
  UNRESOLVED_BATCH: 'unresolved_batch',
  AMBIGUOUS_BATCH: 'ambiguous_batch',
  UNLINKED_CREDIT: 'unlinked_credit',
}

/**
 * Exception type labels
 * @type {Object<ExceptionType, string>}
 */
export const ExceptionLabels = {
  [ExceptionType.MISSING_BANK_CREDIT]: 'Missing Bank Credit',
  [ExceptionType.UNRESOLVED_BATCH]: 'Unresolved Batch',
  [ExceptionType.AMBIGUOUS_BATCH]: 'Ambiguous Batch',
  [ExceptionType.UNLINKED_CREDIT]: 'Unlinked Credit',
}

/**
 * Exception type icons
 * @type {Object<ExceptionType, string>}
 */
export const ExceptionIcons = {
  [ExceptionType.MISSING_BANK_CREDIT]: '🔴',
  [ExceptionType.UNRESOLVED_BATCH]: '🟡',
  [ExceptionType.AMBIGUOUS_BATCH]: '🟠',
  [ExceptionType.UNLINKED_CREDIT]: '🔵',
}

/**
 * Exception type colors
 * @type {Object<ExceptionType, string>}
 */
export const ExceptionColors = {
  [ExceptionType.MISSING_BANK_CREDIT]: 'error',
  [ExceptionType.UNRESOLVED_BATCH]: 'warning',
  [ExceptionType.AMBIGUOUS_BATCH]: 'warning',
  [ExceptionType.UNLINKED_CREDIT]: 'info',
}

// ============================================
// MATCH TYPES
// ============================================

/**
 * Match type enum
 * @typedef {'clean' | 'batched_settlement'} MatchType
 */
export const MatchType = {
  CLEAN: 'clean',
  BATCHED: 'batched_settlement',
}

/**
 * Match type labels
 * @type {Object<MatchType, string>}
 */
export const MatchLabels = {
  [MatchType.CLEAN]: 'Clean Match',
  [MatchType.BATCHED]: 'Batched Settlement',
}

// ============================================
// FILE TYPES
// ============================================

/**
 * File type enum
 * @typedef {'ledger' | 'settlements' | 'bank'} FileType
 */
export const FileType = {
  LEDGER: 'ledger',
  SETTLEMENTS: 'settlements',
  BANK: 'bank',
}

/**
 * File type labels
 * @type {Object<FileType, string>}
 */
export const FileTypeLabels = {
  [FileType.LEDGER]: 'Ledger / Orders',
  [FileType.SETTLEMENTS]: 'Gateway Settlements',
  [FileType.BANK]: 'Bank Statement',
}

/**
 * File type icons
 * @type {Object<FileType, string>}
 */
export const FileTypeIcons = {
  [FileType.LEDGER]: '📋',
  [FileType.SETTLEMENTS]: '🏦',
  [FileType.BANK]: '💰',
}

/**
 * Required columns for each file type
 * @type {Object<FileType, string[]>}
 */
export const RequiredColumns = {
  [FileType.LEDGER]: ['order_id', 'order_date', 'gross_amount', 'customer_id', 'status'],
  [FileType.SETTLEMENTS]: ['settlement_id', 'utr', 'settlement_date', 'gross_amount', 'razorpay_fee', 'gst_on_fee', 'tds_deducted', 'net_amount'],
  [FileType.BANK]: ['txn_id', 'value_date', 'utr', 'credited_amount', 'narration'],
}

// ============================================
// DATA MODELS
// ============================================

/**
 * Order data model
 * @typedef {Object} Order
 * @property {string} order_id - Unique order identifier
 * @property {string} order_date - Order date (YYYY-MM-DD)
 * @property {number} gross_amount - Order amount
 * @property {string} customer_id - Customer identifier
 * @property {string} status - Order status (paid, refunded, etc.)
 */
export const OrderModel = {
  fields: ['order_id', 'order_date', 'gross_amount', 'customer_id', 'status'],
  required: ['order_id', 'order_date', 'gross_amount'],
}

/**
 * Settlement data model
 * @typedef {Object} Settlement
 * @property {string} settlement_id - Unique settlement identifier
 * @property {string} utr - Unique transaction reference
 * @property {string} settlement_date - Settlement date (YYYY-MM-DD)
 * @property {number} gross_amount - Gross settlement amount
 * @property {number} razorpay_fee - Razorpay platform fee
 * @property {number} gst_on_fee - GST on fee
 * @property {number} tds_deducted - TDS deducted
 * @property {number} net_amount - Net settlement amount
 */
export const SettlementModel = {
  fields: ['settlement_id', 'utr', 'settlement_date', 'gross_amount', 'razorpay_fee', 'gst_on_fee', 'tds_deducted', 'net_amount'],
  required: ['settlement_id', 'utr', 'settlement_date', 'gross_amount', 'net_amount'],
}

/**
 * Bank Transaction data model
 * @typedef {Object} BankTransaction
 * @property {string} txn_id - Unique transaction identifier
 * @property {string} value_date - Value date (YYYY-MM-DD)
 * @property {string} utr - Unique transaction reference
 * @property {number} credited_amount - Amount credited
 * @property {string} narration - Transaction description
 */
export const BankTransactionModel = {
  fields: ['txn_id', 'value_date', 'utr', 'credited_amount', 'narration'],
  required: ['txn_id', 'utr', 'value_date', 'credited_amount'],
}

// ============================================
// RECONCILIATION MODELS
// ============================================

/**
 * Match result model
 * @typedef {Object} MatchResult
 * @property {string} settlement_id - Settlement ID
 * @property {string} bank_txn_id - Bank transaction ID
 * @property {string[]} order_ids - Array of order IDs
 * @property {MatchType} match_type - Type of match
 * @property {number} net_amount - Net amount
 * @property {number} gross_amount - Gross amount
 * @property {number} razorpay_fee - Razorpay fee
 * @property {number} gst_on_fee - GST on fee
 * @property {number} tds_deducted - TDS deducted
 * @property {string} settlement_date - Settlement date
 * @property {string} utr - UTR number
 */
export const MatchResultModel = {
  fields: ['settlement_id', 'bank_txn_id', 'order_ids', 'match_type', 'net_amount', 'gross_amount', 'razorpay_fee', 'gst_on_fee', 'tds_deducted', 'settlement_date', 'utr'],
  required: ['settlement_id', 'bank_txn_id', 'order_ids', 'match_type'],
}

/**
 * Exception record model
 * @typedef {Object} ExceptionRecord
 * @property {string} id - Exception ID
 * @property {ExceptionType} exception_type - Type of exception
 * @property {string} settlement_id - Settlement ID
 * @property {string} bank_txn_id - Bank transaction ID
 * @property {string} detail - Detailed description
 * @property {number} amount - Amount
 * @property {number} gross_amount - Gross amount
 * @property {string} utr - UTR number
 * @property {string} txn_id - Transaction ID
 * @property {string} value_date - Value date
 * @property {string} status - Exception status
 * @property {string[][]} candidate_combinations - Possible order combinations
 */
export const ExceptionRecordModel = {
  fields: ['id', 'exception_type', 'settlement_id', 'bank_txn_id', 'detail', 'amount', 'gross_amount', 'utr', 'txn_id', 'value_date', 'status', 'candidate_combinations'],
  required: ['id', 'exception_type'],
}

// ============================================
// FORECAST MODELS
// ============================================

/**
 * Forecast data model
 * @typedef {Object} Forecast
 * @property {Object} percentiles - Percentile data
 * @property {number[]} percentiles.p5 - 5th percentile values
 * @property {number[]} percentiles.p50 - 50th percentile values
 * @property {number[]} percentiles.p95 - 95th percentile values
 * @property {string[]} days - Day labels
 * @property {number} pending_count - Number of pending settlements
 * @property {string} data_source - Data source
 */
export const ForecastModel = {
  fields: ['percentiles', 'days', 'pending_count', 'data_source'],
  required: ['percentiles'],
}

// ============================================
// CASH POSITION MODEL
// ============================================

/**
 * Cash position data model
 * @typedef {Object} CashPosition
 * @property {number} current_cash - Current cash amount
 * @property {number} pending_settlements - Pending settlement amount
 * @property {number} total_expected - Total expected amount
 * @property {number} reconciled_count - Number of reconciled settlements
 * @property {number} pending_count - Number of pending settlements
 * @property {number} match_rate - Match rate percentage
 * @property {string} data_source - Data source
 */
export const CashPositionModel = {
  fields: ['current_cash', 'pending_settlements', 'total_expected', 'reconciled_count', 'pending_count', 'match_rate', 'data_source'],
  required: ['current_cash', 'pending_settlements', 'total_expected'],
}

// ============================================
// API RESPONSE MODELS
// ============================================

/**
 * API Response wrapper
 * @typedef {Object} ApiResponse
 * @property {any} data - Response data
 * @property {string} message - Response message
 * @property {boolean} success - Success status
 * @property {string} error - Error message
 */
export const ApiResponseModel = {
  fields: ['data', 'message', 'success', 'error'],
}

// ============================================
// FILTER MODELS
// ============================================

/**
 * Exception filter model
 * @typedef {Object} ExceptionFilter
 * @property {ExceptionType} type - Exception type filter
 * @property {Status} status - Status filter
 * @property {number} minAmount - Minimum amount filter
 * @property {number} maxAmount - Maximum amount filter
 * @property {string} search - Search term
 */
export const ExceptionFilterModel = {
  fields: ['type', 'status', 'minAmount', 'maxAmount', 'search'],
}

// ============================================
// CONFIGURATION TYPES
// ============================================

/**
 * App configuration
 * @typedef {Object} AppConfig
 * @property {string} name - App name
 * @property {string} version - App version
 * @property {string} description - App description
 */
export const AppConfigModel = {
  fields: ['name', 'version', 'description'],
}

/**
 * Upload configuration
 * @typedef {Object} UploadConfig
 * @property {number} maxFileSize - Maximum file size in bytes
 * @property {string[]} acceptedFileTypes - Accepted file extensions
 * @property {number} maxRows - Maximum rows
 */
export const UploadConfigModel = {
  fields: ['maxFileSize', 'acceptedFileTypes', 'maxRows'],
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a value is a valid exception type
 * @param {string} type - The type to check
 * @returns {boolean} True if valid exception type
 */
export const isValidExceptionType = (type) => {
  return Object.values(ExceptionType).includes(type)
}

/**
 * Check if a value is a valid match type
 * @param {string} type - The type to check
 * @returns {boolean} True if valid match type
 */
export const isValidMatchType = (type) => {
  return Object.values(MatchType).includes(type)
}

/**
 * Check if a value is a valid file type
 * @param {string} type - The type to check
 * @returns {boolean} True if valid file type
 */
export const isValidFileType = (type) => {
  return Object.values(FileType).includes(type)
}

/**
 * Check if a value is a valid status
 * @param {string} status - The status to check
 * @returns {boolean} True if valid status
 */
export const isValidStatus = (status) => {
  return Object.values(Status).includes(status)
}

/**
 * Get exception label by type
 * @param {string} type - Exception type
 * @returns {string} Human-readable label
 */
export const getExceptionLabel = (type) => {
  return ExceptionLabels[type] || type || 'Unknown'
}

/**
 * Get exception icon by type
 * @param {string} type - Exception type
 * @returns {string} Emoji icon
 */
export const getExceptionIcon = (type) => {
  return ExceptionIcons[type] || '⚠️'
}

/**
 * Get match label by type
 * @param {string} type - Match type
 * @returns {string} Human-readable label
 */
export const getMatchLabel = (type) => {
  return MatchLabels[type] || type || 'Unknown'
}

/**
 * Get required columns for a file type
 * @param {string} type - File type
 * @returns {string[]} Required columns
 */
export const getRequiredColumns = (type) => {
  return RequiredColumns[type] || []
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  // Enums
  AppStep,
  ViewType,
  DataSource,
  Status,
  ExceptionType,
  MatchType,
  FileType,
  
  // Labels & Icons
  ExceptionLabels,
  ExceptionIcons,
  ExceptionColors,
  MatchLabels,
  FileTypeLabels,
  FileTypeIcons,
  RequiredColumns,
  
  // Models
  OrderModel,
  SettlementModel,
  BankTransactionModel,
  MatchResultModel,
  ExceptionRecordModel,
  ForecastModel,
  CashPositionModel,
  ApiResponseModel,
  ExceptionFilterModel,
  AppConfigModel,
  UploadConfigModel,
  
  // Helper Functions
  isValidExceptionType,
  isValidMatchType,
  isValidFileType,
  isValidStatus,
  getExceptionLabel,
  getExceptionIcon,
  getMatchLabel,
  getRequiredColumns,
}