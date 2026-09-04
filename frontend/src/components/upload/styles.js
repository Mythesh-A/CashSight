/**
 * Upload Styles - CSS-in-JS styles
 */
export const uploadStyles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },

  title: {
    fontSize: '36px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },

  subtitle: {
    color: '#666',
    fontSize: '18px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '30px',
  },

  dropZone: (isDragging, hasFile) => ({
    border: `2px dashed ${isDragging ? '#2196F3' : hasFile ? '#4CAF50' : '#ddd'}`,
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    background: isDragging ? '#e3f2fd' : hasFile ? '#e8f5e9' : '#fafafa',
    transition: 'all 0.3s ease',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
  }),

  dropZoneIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },

  dropZoneLabel: {
    fontWeight: 'bold',
  },

  dropZoneDescription: {
    fontSize: '13px',
    color: '#666',
    marginTop: '4px',
  },

  dropZoneBadge: {
    fontSize: '11px',
    color: '#999',
    marginTop: '8px',
    background: '#f5f5f5',
    padding: '4px 12px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },

  fileInfo: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  fileSize: {
    fontSize: '14px',
    color: '#666',
  },

  removeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'none',
    border: 'none',
    color: '#f44336',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
  },

  requiredColumns: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    border: '1px solid #e9ecef',
  },

  requiredColumnsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontWeight: '600',
  },

  requiredColumnsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    fontSize: '13px',
  },

  requiredColumnLabel: {
    fontWeight: '600',
    color: '#1a1a2e',
  },

  requiredColumnFields: {
    color: '#666',
    fontFamily: 'monospace',
    fontSize: '12px',
  },

  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },

  primaryButton: (disabled) => ({
    padding: '14px 48px',
    background: disabled
      ? '#ccc'
      : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: disabled ? 'none' : '0 4px 15px rgba(76, 175, 80, 0.3)',
  }),

  secondaryButton: {
    padding: '14px 32px',
    background: 'transparent',
    color: '#2196F3',
    border: '2px solid #2196F3',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  statusBar: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666',
  },

  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  statusDot: (uploaded) => ({
    color: uploaded ? '#4CAF50' : '#ccc',
  }),

  footer: {
    marginTop: '30px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#999',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  },

  footerTip: {
    marginTop: '4px',
  },

  // Column Mapper specific
  mapperContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },

  mapperFileCard: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #e9ecef',
  },

  mapperFileTitle: {
    marginBottom: '12px',
  },

  mapperFileInfo: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },

  mapperColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },

  mapperColumnList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    background: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },

  mapperColumnTag: {
    background: '#e3f2fd',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace',
  },

  mapperSelect: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    background: 'white',
    fontSize: '13px',
  },

  mapperFieldLabel: {
    width: '140px',
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#1a1a2e',
  },

  mapperPreview: {
    background: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    overflow: 'auto',
    fontSize: '13px',
  },

  mapperPreviewTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  mapperPreviewTh: {
    padding: '4px 8px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
    fontSize: '12px',
    fontFamily: 'monospace',
  },

  mapperPreviewTd: {
    padding: '4px 8px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '12px',
  },

  // Data Quality Report specific
  reportBanner: (isValid) => ({
    background: isValid ? '#d4edda' : '#fff3cd',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    border: `1px solid ${isValid ? '#c3e6cb' : '#ffc107'}`,
  }),

  reportBannerTitle: (isValid) => ({
    margin: 0,
    color: isValid ? '#155724' : '#856404',
  }),

  reportSummaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  reportSummaryCard: (color, bgColor) => ({
    background: bgColor,
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
  }),

  reportSummaryNumber: (color) => ({
    fontSize: '24px',
    fontWeight: 'bold',
    color: color,
  }),

  reportSummaryLabel: {
    fontSize: '13px',
    color: '#666',
  },

  reportSummaryAmount: (color) => ({
    fontSize: '14px',
    color: color,
    marginTop: '4px',
  }),

  reportIssues: {
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    padding: '16px',
    marginBottom: '24px',
  },

  reportIssueItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
  },

  reportIssueIcon: {
    fontSize: '16px',
    marginTop: '2px',
  },

  reportIssueMessage: {
    fontSize: '14px',
    color: '#333',
  },

  reportIssueDetails: {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px',
  },

  reportIssueSource: {
    fontSize: '11px',
    color: '#aaa',
    marginTop: '2px',
  },

  reportInfoBox: {
    background: '#e3f2fd',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    border: '1px solid #90caf9',
  },

  reportInfoText: {
    margin: 0,
    color: '#1a237e',
    fontSize: '14px',
  },
}