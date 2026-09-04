/**
 * Forecast Constants
 */
export const FORECAST_CONFIG = {
  days: 7,
  percentiles: ['p5', 'p50', 'p95'],
  colors: {
    p5: '#ff9800',
    p50: '#2196F3',
    p95: '#dc3545',
    band: 'rgba(33, 150, 243, 0.05)',
  },
}

export const PERCENTILE_LABELS = {
  p5: 'P5 (Optimistic)',
  p50: 'P50 (Expected)',
  p95: 'P95 (Pessimistic)',
}

export const FORECAST_MESSAGES = {
  loading: 'Generating forecast...',
  noData: 'No forecast data available',
  error: 'Failed to load forecast',
  runReconciliation: 'Run reconciliation to generate forecast',
}