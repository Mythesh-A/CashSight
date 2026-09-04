/**
 * formatters.js - Utility functions for formatting data
 */

/**
 * Format currency in Indian Rupees (INR)
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @param {string} options.currency - Currency code (default: 'INR')
 * @param {number} options.minimumFractionDigits - Min decimal places (default: 2)
 * @param {number} options.maximumFractionDigits - Max decimal places (default: 2)
 * @param {boolean} options.compact - Use compact notation (default: false)
 * @returns {string} Formatted currency string
 */
export const currency = (amount, options = {}) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00'
  }

  const {
    currency: currencyCode = 'INR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    compact = false,
  } = options

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  })

  return formatter.format(amount)
}

/**
 * Format currency without the ₹ symbol
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number string
 */
export const formatAmount = (amount, options = {}) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0.00'
  }

  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

/**
 * Format a number with Indian number system (comma separated)
 * @param {number} num - The number to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, options = {}) => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0'
  }

  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num)
}

/**
 * Format a percentage
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const percentage = (value, decimals = 1) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%'
  }
  return `${value.toFixed(decimals)}%`
}

/**
 * Format a date
 * @param {string|Date} dateString - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A'

  const d = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(d.getTime())) return 'Invalid Date'

  const {
    format = 'medium',
    timezone = 'en-IN',
  } = options

  const formats = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  }

  const formatOptions = formats[format] || formats.medium

  return new Intl.DateTimeFormat(timezone, formatOptions).format(d)
}

/**
 * Format a date relative to now (e.g., "2 days ago")
 * @param {string|Date} dateString - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A'

  const d = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(d.getTime())) return 'Invalid Date'

  const now = new Date()
  const diffMs = now - d
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 30) return formatDate(dateString)
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  return 'Just now'
}

/**
 * Format exception type to human-readable label
 * @param {string} type - Exception type key
 * @returns {string} Human-readable label
 */
export const exceptionTypeLabel = (type) => {
  const labels = {
    missing_bank_credit: 'Missing Bank Credit',
    unresolved_batch: 'Unresolved Batch',
    ambiguous_batch: 'Ambiguous Batch',
    unlinked_credit: 'Unlinked Credit',
    clean: 'Clean Match',
    batched_settlement: 'Batched Settlement',
  }
  return labels[type] || type || 'Unknown'
}

/**
 * Get icon for exception type
 * @param {string} type - Exception type key
 * @returns {string} Emoji icon
 */
export const exceptionTypeIcon = (type) => {
  const icons = {
    missing_bank_credit: '🔴',
    unresolved_batch: '🟡',
    ambiguous_batch: '🟠',
    unlinked_credit: '🔵',
    clean: '✅',
    batched_settlement: '📦',
  }
  return icons[type] || '⚠️'
}

/**
 * Format match type to human-readable label
 * @param {string} type - Match type key
 * @returns {string} Human-readable label
 */
export const matchTypeLabel = (type) => {
  const labels = {
    clean: 'Clean Match',
    batched_settlement: 'Batched Settlement',
  }
  return labels[type] || type || 'Unknown'
}

/**
 * Truncate text to a maximum length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 50, suffix = '...') => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert a string to title case
 * @param {string} str - The string to convert
 * @returns {string} Title cased string
 */
export const titleCase = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format a file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Human-readable file size
 */
export const formatFileSize = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 Bytes'
  if (bytes === undefined || bytes === null) return 'N/A'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))

  return `${size} ${sizes[i]}`
}

/**
 * Format a timestamp to ISO string
 * @param {Date} date - The date to format
 * @returns {string} ISO string
 */
export const toISOString = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toISOString()
}