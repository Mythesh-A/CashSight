/**
 * Forecast Styles - CSS-in-JS styles
 */
export const forecastStyles = {
  container: {
    marginBottom: '24px',
  },

  chart: {
    height: '350px',
    width: '100%',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },

  legend: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },

  legendLabel: (color) => ({
    color: color,
  }),

  projectedValue: {
    marginLeft: 'auto',
    fontSize: '13px',
    color: '#666',
  },

  projectedAmount: {
    color: '#0d47a1',
    fontWeight: 'bold',
  },

  tooltip: {
    background: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },

  tooltipTitle: {
    margin: '0 0 8px 0',
    fontWeight: '600',
  },

  tooltipItem: {
    margin: '4px 0',
  },

  summary: {
    marginTop: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },

  summaryItem: {
    textAlign: 'center',
  },

  summaryLabel: {
    fontSize: '12px',
    color: '#666',
  },

  summaryValue: (color) => ({
    fontSize: '16px',
    fontWeight: 'bold',
    color: color,
  }),

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },

  tableHeader: {
    background: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
  },

  tableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left',
  },

  tableHeaderCellRight: {
    padding: '12px 16px',
    textAlign: 'right',
  },

  tableRow: {
    borderBottom: '1px solid #f0f0f0',
  },

  tableCell: {
    padding: '10px 16px',
    fontWeight: '500',
  },

  tableCellRight: (color) => ({
    padding: '10px 16px',
    textAlign: 'right',
    color: color || '#333',
  }),

  tableCellBold: {
    padding: '10px 16px',
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#2196F3',
  },

  tableCellDaily: (isPositive) => ({
    padding: '10px 16px',
    textAlign: 'right',
    color: isPositive ? '#2e7d32' : '#c62828',
  }),

  emptyState: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },

  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },

  errorState: {
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },

  errorIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },

  errorText: {
    color: '#dc3545',
  },

  retryButton: {
    padding: '8px 20px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '8px',
  },
}