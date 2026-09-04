/**
 * Exceptions Constants
 */
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

export const RESOLVE_OPTIONS = [
  { value: 'confirm', label: '✅ Confirm' },
  { value: 'reject', label: '❌ Reject' },
  { value: 'investigate', label: '🔍 Investigate' },
]