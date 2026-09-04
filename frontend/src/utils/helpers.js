/**
 * helpers.js - General utility helper functions
 */

/**
 * Debounce a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle a function call
 * @param {Function} func - The function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Deep clone an object
 * @param {Object} obj - The object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone(obj[key])
    })
    return clonedObj
  }
  return obj
}

/**
 * Generate a unique ID
 * @param {string} prefix - Prefix for the ID (optional)
 * @returns {string} Unique ID
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

/**
 * Group an array by a key
 * @param {Array} array - The array to group
 * @param {string} key - The key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

/**
 * Sort an array by a key
 * @param {Array} array - The array to sort
 * @param {string} key - The key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  const sorted = [...array]
  return sorted.sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Filter an array by a search term
 * @param {Array} array - The array to filter
 * @param {string} searchTerm - The search term
 * @param {Array<string>} searchKeys - Keys to search in
 * @returns {Array} Filtered array
 */
export const filterBySearch = (array, searchTerm, searchKeys) => {
  if (!searchTerm || !searchKeys || searchKeys.length === 0) return array
  const term = searchTerm.toLowerCase()
  return array.filter(item => {
    return searchKeys.some(key => {
      const value = item[key]
      if (value === undefined || value === null) return false
      return String(value).toLowerCase().includes(term)
    })
  })
}

/**
 * Paginate an array
 * @param {Array} array - The array to paginate
 * @param {number} page - Current page (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Object} Paginated result { data, total, totalPages, currentPage }
 */
export const paginate = (array, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const total = array.length
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: array.slice(startIndex, endIndex),
    total,
    totalPages,
    currentPage: page,
    pageSize,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Download a file as CSV
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file
 * @param {Array<string>} headers - Column headers
 */
export const downloadCSV = (data, filename, headers = null) => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const headerKeys = headers || Object.keys(data[0])
  const headerRow = headerKeys.join(',')
  
  const rows = data.map(item => {
    return headerKeys.map(key => {
      const value = item[key]
      if (value === undefined || value === null) return ''
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return value
    }).join(',')
  })

  const csv = [headerRow, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy text:', error)
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (fallbackError) {
      document.body.removeChild(textarea)
      console.error('Fallback copy failed:', fallbackError)
      return false
    }
  }
}

/**
 * Get the difference between two dates in days
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Difference in days
 */
export const daysBetween = (date1, date2) => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffTime = Math.abs(d2 - d1)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get the sum of an array of numbers
 * @param {Array<number>} array - Array of numbers
 * @returns {number} Sum
 */
export const sum = (array) => {
  if (!array || !Array.isArray(array)) return 0
  return array.reduce((acc, val) => acc + (val || 0), 0)
}

/**
 * Get the average of an array of numbers
 * @param {Array<number>} array - Array of numbers
 * @returns {number} Average
 */
export const average = (array) => {
  if (!array || !Array.isArray(array) || array.length === 0) return 0
  return sum(array) / array.length
}

/**
 * Get the unique values from an array
 * @param {Array} array - Array to get unique values from
 * @returns {Array} Array of unique values
 */
export const unique = (array) => {
  if (!array || !Array.isArray(array)) return []
  return [...new Set(array)]
}

/**
 * Get a nested object value using dot notation
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot notation path (e.g., 'user.address.city')
 * @param {any} defaultValue - Default value if path doesn't exist
 * @returns {any} Value at path or default
 */
export const getNestedValue = (obj, path, defaultValue = undefined) => {
  if (!obj || typeof obj !== 'object') return defaultValue
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return defaultValue
    }
    current = current[key]
  }
  return current !== undefined ? current : defaultValue
}

/**
 * Set a nested object value using dot notation
 * @param {Object} obj - The object to modify
 * @param {string} path - Dot notation path
 * @param {any} value - Value to set
 * @returns {Object} Modified object
 */
export const setNestedValue = (obj, path, value) => {
  if (!obj || typeof obj !== 'object') return obj
  const keys = path.split('.')
  const lastKey = keys.pop()
  let current = obj
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  current[lastKey] = value
  return obj
}

/**
 * Check if a value is a valid JSON string
 * @param {string} str - String to check
 * @returns {boolean} True if valid JSON
 */
export const isValidJSON = (str) => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Parse JSON safely
 * @param {string} str - String to parse
 * @param {any} defaultValue - Default value if parse fails
 * @returns {any} Parsed JSON or default value
 */
export const safeJSONParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}