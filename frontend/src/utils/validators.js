/**
 * validators.js - Utility functions for validation
 */

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - The value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Check if a value is a valid email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Check if a value is a valid phone number (Indian format)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (phone) => {
  if (!phone) return false
  const cleaned = phone.replace(/[\s\-()]/g, '')
  const regex = /^[6-9]\d{9}$/
  return regex.test(cleaned)
}

/**
 * Check if a value is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a value is a valid number
 * @param {any} value - The value to check
 * @returns {boolean} True if valid number
 */
export const isValidNumber = (value) => {
  if (value === undefined || value === null) return false
  const num = parseFloat(value)
  return !isNaN(num) && isFinite(num)
}

/**
 * Check if a value is a positive number
 * @param {any} value - The value to check
 * @returns {boolean} True if positive number
 */
export const isPositiveNumber = (value) => {
  if (!isValidNumber(value)) return false
  return parseFloat(value) > 0
}

/**
 * Check if a value is within a range
 * @param {number} value - The value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if within range
 */
export const isInRange = (value, min, max) => {
  if (!isValidNumber(value)) return false
  const num = parseFloat(value)
  return num >= min && num <= max
}

/**
 * Check if a date is valid
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if valid date
 */
export const isValidDate = (date) => {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return !isNaN(d.getTime())
}

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!isValidDate(date)) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

/**
 * Check if a date is in the future
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return d > new Date()
}

/**
 * Validate a CSV file
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 10MB)
 * @param {Array<string>} options.requiredColumns - Required column names
 * @param {boolean} options.allowEmpty - Allow empty file
 * @returns {Object} Validation result { valid, errors }
 */
export const validateCSVFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024,
    requiredColumns = [],
    allowEmpty = false,
  } = options

  const errors = []

  if (!file) {
    errors.push('No file selected')
    return { valid: false, errors }
  }

  // Check file type
  const validTypes = ['text/csv', 'application/vnd.ms-excel']
  if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
    errors.push('File must be a CSV')
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit`)
  }

  // Check file content (async - this is a sync version)
  if (file.size === 0 && !allowEmpty) {
    errors.push('File is empty')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate CSV content (parse and check columns)
 * @param {string} text - CSV content as text
 * @param {Object} options - Validation options
 * @param {Array<string>} options.requiredColumns - Required column names
 * @param {number} options.maxRows - Maximum number of rows (default: 10000)
 * @returns {Object} Validation result { valid, errors, headers, data, totalRows }
 */
export const validateCSVContent = (text, options = {}) => {
  const {
    requiredColumns = [],
    maxRows = 10000,
  } = options

  const errors = []

  try {
    const rows = text.split('\n').filter(row => row.trim())
    if (rows.length === 0) {
      return { valid: false, errors: ['File is empty'], headers: [], data: [], totalRows: 0 }
    }

    if (rows.length > maxRows + 1) {
      errors.push(`File exceeds ${maxRows} row limit`)
    }

    const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

    // Check required columns
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
    }

    // Parse data rows
    const dataRows = rows.slice(1).map(row => {
      const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      const obj = {}
      headers.forEach((h, i) => {
        const value = cols[i] || ''
        obj[h] = !isNaN(value) && value !== '' ? parseFloat(value) : value
      })
      return obj
    }).filter(row => Object.values(row).some(v => v !== ''))

    return {
      valid: errors.length === 0,
      errors,
      headers,
      data: dataRows,
      totalRows: dataRows.length,
      hasHeaders: true,
    }
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error.message}`)
    return {
      valid: false,
      errors,
      headers: [],
      data: [],
      totalRows: 0,
    }
  }
}

/**
 * Validate amount (positive number with 2 decimal places)
 * @param {any} value - The value to validate
 * @returns {Object} Validation result { valid, error }
 */
export const validateAmount = (value) => {
  if (!isValidNumber(value)) {
    return { valid: false, error: 'Amount must be a valid number' }
  }

  const num = parseFloat(value)
  if (num < 0) {
    return { valid: false, error: 'Amount must be positive' }
  }

  // Check for more than 2 decimal places
  const decimalMatch = String(num).match(/\.(\d+)$/)
  if (decimalMatch && decimalMatch[1].length > 2) {
    return { valid: false, error: 'Amount cannot have more than 2 decimal places' }
  }

  return { valid: true }
}

/**
 * Validate UTR (Unique Transaction Reference)
 * @param {string} utr - The UTR to validate
 * @returns {Object} Validation result { valid, error }
 */
export const validateUTR = (utr) => {
  if (!utr || typeof utr !== 'string') {
    return { valid: false, error: 'UTR is required' }
  }

  const cleaned = utr.trim()
  if (cleaned.length < 6) {
    return { valid: false, error: 'UTR must be at least 6 characters' }
  }

  if (cleaned.length > 30) {
    return { valid: false, error: 'UTR cannot exceed 30 characters' }
  }

  return { valid: true }
}

/**
 * Validate order ID
 * @param {string} orderId - The order ID to validate
 * @returns {Object} Validation result { valid, error }
 */
export const validateOrderId = (orderId) => {
  if (!orderId || typeof orderId !== 'string') {
    return { valid: false, error: 'Order ID is required' }
  }

  const cleaned = orderId.trim()
  if (cleaned.length === 0) {
    return { valid: false, error: 'Order ID cannot be empty' }
  }

  return { valid: true }
}

/**
 * Validate all required fields in an object
 * @param {Object} obj - The object to validate
 * @param {Array<string>} requiredFields - Required field names
 * @returns {Object} Validation result { valid, errors }
 */
export const validateRequiredFields = (obj, requiredFields) => {
  const errors = []

  requiredFields.forEach(field => {
    const value = obj[field]
    if (value === undefined || value === null || value === '') {
      errors.push(`${field} is required`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}