/**
 * Upload Constants
 */
export const UPLOAD_CONFIG = {
  acceptedFileTypes: ['.csv'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxRows: 10000,
}

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

export const UPLOAD_MESSAGES = {
  dragDrop: 'Drag & drop CSV files here',
  clickToUpload: 'Click to browse files',
  invalidFile: 'Please upload a valid CSV file',
  fileTooLarge: 'File size exceeds 10MB limit',
  emptyFile: 'File is empty',
  missingColumns: 'Missing required columns',
}