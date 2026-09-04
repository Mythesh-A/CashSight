/**
 * Audit Styles - CSS-in-JS styles for audit components
 */

export const auditStyles = {
  // Container
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },

  // Header
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

  // Stats Cards
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },

  statsCard: {
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e9ecef',
  },

  statsIcon: {
    fontSize: '28px',
  },

  statsNumber: {
    fontSize: '20px',
    fontWeight: 'bold',
  },

  statsLabel: {
    fontSize: '13px',
    color: '#666',
  },

  // Filters
  filtersContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  filterLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#666',
    marginBottom: '4px',
  },

  filterSelect: {
    width: '100%',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '13px',
    background: 'white',
  },

  filterInput: {
    width: '100%',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '13px',
  },

  filterDateGroup: {
    display: 'flex',
    gap: '8px',
  },

  filterDateInput: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '13px',
  },

  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },

  tableHeader: {
    background: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
  },

  tableHeaderCell: {
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: '600',
  },

  tableRow: {
    borderBottom: '1px solid #f0f0f0',
  },

  tableCell: {
    padding: '10px 14px',
  },

  tableCellMono: {
    padding: '10px 14px',
    fontFamily: 'monospace',
    fontSize: '12px',
  },

  tableCellTime: {
    padding: '10px 14px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },

  tableCellDetails: {
    padding: '10px 14px',
    fontSize: '12px',
    color: '#666',
    maxWidth: '300px',
  },

  // Action Badge
  actionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  actionIcon: {
    fontSize: '16px',
  },

  // Timeline / Trail
  trailContainer: {
    marginTop: '20px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },

  trailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },

  trailTitle: {
    margin: 0,
    fontSize: '14px',
    color: '#333',
  },

  trailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '300px',
    overflow: 'auto',
  },

  trailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '8px 12px',
    background: 'white',
    borderRadius: '6px',
    border: '1px solid #f0f0f0',
    fontSize: '13px',
  },

  trailItemIcon: {
    fontSize: '16px',
    marginTop: '2px',
  },

  trailItemContent: {
    flex: 1,
  },

  trailItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  trailItemAction: {
    fontWeight: '500',
  },

  trailItemTime: {
    fontSize: '11px',
    color: '#999',
  },

  trailItemStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '2px',
  },

  trailItemDescription: {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px',
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },

  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },

  emptyTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#666',
  },

  emptySubtitle: {
    fontSize: '14px',
    color: '#999',
    marginTop: '4px',
  },

  // Widget (Dashboard)
  widgetContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  widgetItem: (isEven) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    background: isEven ? '#f8f9fa' : 'white',
    borderRadius: '6px',
    border: '1px solid #f0f0f0',
    fontSize: '13px',
  }),

  widgetItemIcon: {
    fontSize: '16px',
  },

  widgetItemContent: {
    flex: 1,
  },

  widgetItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  widgetItemTarget: {
    fontWeight: '500',
  },

  widgetItemTime: {
    fontSize: '11px',
    color: '#999',
  },

  widgetItemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '2px',
  },

  widgetItemDetails: {
    fontSize: '11px',
    color: '#999',
    marginTop: '2px',
  },

  // Filter Buttons (Widget)
  filterButtons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  filterButton: (isActive) => ({
    padding: '4px 14px',
    borderRadius: '16px',
    border: '1px solid',
    borderColor: isActive ? '#2196F3' : '#ddd',
    background: isActive ? '#e3f2fd' : 'white',
    color: isActive ? '#0d47a1' : '#666',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
  }),

  // View All Button
  viewAllButton: {
    marginTop: '16px',
    textAlign: 'center',
  },
}