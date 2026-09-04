/**
 * Dashboard Styles - CSS-in-JS styles
 */
export const dashboardStyles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },

  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
  },

  subtitle: {
    marginTop: '4px',
    fontSize: '14px',
    color: '#666',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px',
  },

  footer: {
    marginTop: '20px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '13px',
    color: '#666',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },

  metricCard: {
    textAlign: 'center',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },

  metricLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },

  metricValue: (color) => ({
    fontSize: '28px',
    fontWeight: 'bold',
    color: color,
  }),

  metricDescription: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px',
  },

  matchCard: {
    maxHeight: '200px',
    overflow: 'auto',
  },

  matchItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '13px',
  },

  exceptionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '13px',
  },

  emptyState: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },

  successState: {
    textAlign: 'center',
    padding: '20px',
    color: '#2e7d32',
  },
}