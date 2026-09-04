/**
 * Hooks Constants
 */
export const HOOK_CONFIG = {
  debounceDelay: 500,
  notificationDuration: 3000,
  refreshInterval: 30000, // 30 seconds
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFileTypes: ['text/csv', 'application/vnd.ms-excel'],
}

export const ERROR_MESSAGES = {
  fileValidation: 'Please upload a valid CSV file',
  fileTooLarge: 'File size exceeds 10MB limit',
  fetchFailed: 'Failed to fetch data',
  uploadFailed: 'Failed to upload file',
  parseFailed: 'Failed to parse CSV file',
}