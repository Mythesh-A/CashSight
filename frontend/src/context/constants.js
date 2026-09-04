/**
 * Context Constants
 */
export const APP_STEPS = {
  UPLOAD: 'upload',
  MAPPING: 'mapping',
  VALIDATION: 'validation',
  DASHBOARD: 'dashboard',
  EXCEPTIONS: 'exceptions',
}

export const DATA_SOURCES = {
  SAMPLE: 'sample',
  UPLOADED: 'uploaded',
}

export const VIEWS = {
  DASHBOARD: 'dashboard',
  EXCEPTIONS: 'exceptions',
}

export const DEFAULT_STATE = {
  step: APP_STEPS.UPLOAD,
  currentView: VIEWS.DASHBOARD,
  dataSource: DATA_SOURCES.SAMPLE,
  loading: false,
  error: null,
}