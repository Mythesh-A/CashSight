/**
 * Exceptions Styles - CSS-in-JS styles
 */
export const exceptionStyles = {
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
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#666',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },

  summaryCard: {
    textAlign: 'center',
    padding: '16px',
    borderRadius: '8px',
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
  },

  summaryIcon: {
    fontSize: '28px',
  },

  summaryCount: {
    fontSize: '20px',
    fontWeight: 'bold',
  },

  summaryLabel: {
    fontSize: '13px',
    color: '#666',
  },

  filters: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  filterLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#666',
  },

  filterButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  filterButton: (isActive) => ({
    padding: '4px 14px',
    borderRadius: '20px',
    border: '1px solid',
    borderColor: isActive ? '#2196F3' : '#ddd',
    background: isActive ? '#e3f2fd' : 'white',
    color: isActive ? '#0d47a1' : '#666',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  }),

  amountRange: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  amountInput: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    width: '120px',
    fontSize: '14px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },

  tableHeader: {
    background: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
  },

  tableHeaderCell: (sortable = false) => ({
    padding: '12px 16px',
    textAlign: 'left',
    cursor: sortable ? 'pointer' : 'default',
  }),

  tableRow: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.2s',
  },

  tableRowHover: {
    background: '#f8f9fa',
  },

  tableCell: {
    padding: '12px 16px',
  },

  tableCellMono: {
    padding: '12px 16px',
    fontFamily: 'monospace',
    fontSize: '13px',
  },

  tableCellRight: {
    padding: '12px 16px',
    textAlign: 'right',
    fontWeight: '500',
  },

  tableCellCenter: {
    padding: '12px 16px',
    textAlign: 'center',
  },

  actions: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
  },

  // Modal / Details
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    animation: 'fadeIn 0.3s ease',
  },

  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },

  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  modalIcon: {
    fontSize: '32px',
  },

  modalSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '2px',
  },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },

  detailLabel: {
    fontSize: '13px',
    color: '#666',
  },

  detailValue: {
    fontSize: '20px',
    fontWeight: 'bold',
  },

  detailText: {
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333',
  },

  combinations: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  combinationItem: (isSelected) => ({
    padding: '10px 14px',
    background: isSelected ? '#e3f2fd' : '#f8f9fa',
    borderRadius: '8px',
    border: isSelected ? '2px solid #2196F3' : '1px solid #e9ecef',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),

  explanation: {
    marginTop: '12px',
    padding: '16px',
    background: '#e3f2fd',
    borderRadius: '8px',
    border: '1px solid #90caf9',
  },

  explanationTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0d47a1',
    marginBottom: '8px',
  },

  explanationText: {
    margin: 0,
    fontSize: '14px',
    color: '#1a237e',
    lineHeight: '1.6',
  },

  modalActions: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },

  emptyState: {
    textAlign: 'center',
    padding: '40px',
  },

  emptyIcon: {
    fontSize: '48px',
  },

  emptyTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  emptySubtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px',
  },
}