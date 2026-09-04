import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, DataProvider, ThemeProvider } from './context'
import { Header, Footer, LoadingSpinner, ErrorBoundary } from './components/common'
import { Sidebar } from './components/layout'
import Dashboard from './components/dashboard/Dashboard'
import CSVUploader from './components/upload/CSVUploader'
import ColumnMapper from './components/upload/ColumnMapper'
import DataQualityReport from './components/upload/DataQualityReport'
import ExceptionInbox from './components/exceptions/ExceptionInbox'
import { MatchInbox } from './components/matches'
import { AuditPage } from './components/audit'
import { useData } from './context/DataContext'
import { useNotification } from './hooks'
import { APP_CONFIG, APP_STEPS, DATA_SOURCES } from './utils/constants'
import { TaxAnalyzer } from './components/tax'
import { ReportsPage } from './components/reports'
import './styles/index.css'


function AppWrapper() {
  const { loadSampleData, refreshData, dataSource, loading, error, updateDataSource } = useData()
  const [step, setStep] = useState(APP_STEPS.DASHBOARD)
  const [uploadedFiles, setUploadedFiles] = useState(null)
  const [mappedData, setMappedData] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [exceptionsCount, setExceptionsCount] = useState(0)
  const [matchesCount, setMatchesCount] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { showSuccess, showError } = useNotification()

  // Fetch counts for badges
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [reconcileRes, exceptionsRes] = await Promise.all([
          fetch('http://localhost:5000/api/reconcile'),
          fetch('http://localhost:5000/api/exceptions'),
        ])
        
        if (reconcileRes.ok) {
          const reconcileData = await reconcileRes.json()
          setMatchesCount(reconcileData.matches?.length || 0)
        }
        
        if (exceptionsRes.ok) {
          const exceptionsData = await exceptionsRes.json()
          setExceptionsCount(exceptionsData.exceptions?.length || 0)
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error)
      }
    }
    fetchCounts()
  }, [])

  // ============================================
  // HANDLERS
  // ============================================

  const handleViewReports = () => {
    setCurrentView('reports')
    setStep(APP_STEPS.REPORTS)
  }

  const handleViewTax = () => {
    setCurrentView('tax')
    setStep(APP_STEPS.TAX)
  }

  const handleFileUpload = (data) => {
    setUploadedFiles(data)
    setStep(APP_STEPS.MAPPING)
  }

  const handleMappingComplete = (data) => {
    setMappedData(data)
    setStep(APP_STEPS.VALIDATION)
  }

  const handleValidationComplete = (result) => {
    setValidationResult(result)
    updateDataSource('uploaded')
    setStep(APP_STEPS.DASHBOARD)
    showSuccess('Data validated and reconciled successfully!')
  }

  const handleUseSample = async () => {
    try {
      await loadSampleData()
      updateDataSource('sample')
      setStep(APP_STEPS.DASHBOARD)
      showSuccess('Sample data loaded successfully!')
    } catch (error) {
      console.error('Failed to load sample data:', error)
      showError('Failed to load sample data')
    }
  }

  const handleRefresh = async () => {
    try {
      await refreshData()
      showSuccess('Data refreshed successfully!')
    } catch (error) {
      console.error('Failed to refresh data:', error)
      showError('Failed to refresh data')
    }
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setStep(APP_STEPS.DASHBOARD)
    setIsSidebarOpen(false)
  }

  const handleViewExceptions = () => {
    setCurrentView('exceptions')
    setStep(APP_STEPS.EXCEPTIONS)
    setIsSidebarOpen(false)
  }

  const handleViewMatches = () => {
    setCurrentView('matches')
    setStep(APP_STEPS.MATCHES)
    setIsSidebarOpen(false)
  }

  const handleViewAudit = () => {
    setCurrentView('audit')
    setStep(APP_STEPS.AUDIT)
    setIsSidebarOpen(false)
  }

  const handleUploadNewData = () => {
    setStep(APP_STEPS.UPLOAD)
    setUploadedFiles(null)
    setMappedData(null)
    setValidationResult(null)
    setIsSidebarOpen(false)
  }

  // Navigation handler for sidebar
  const handleNavigate = (view, path) => {
    setCurrentView(view)
    setStep(view)
    setIsSidebarOpen(false)
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  // Header actions - Show Load Sample and Upload New Data on Dashboard
  const renderHeaderActions = () => {
    if (step === APP_STEPS.DASHBOARD) {
      return [
        {
          label: '🔄 Load Sample',
          variant: 'secondary',
          onClick: handleUseSample,
        },
        {
          label: '📤 Upload New Data',
          variant: 'primary',
          onClick: handleUploadNewData,
        },
      ]
    }

    // Show Back button on other pages
    if (step === APP_STEPS.EXCEPTIONS || 
        step === APP_STEPS.MATCHES || 
        step === APP_STEPS.AUDIT || 
        step === APP_STEPS.TAX || 
        step === APP_STEPS.REPORTS) {
      return [
        {
          label: '← Back to Dashboard',
          variant: 'primary',
          onClick: handleBackToDashboard,
        },
      ]
    }

    return []
  }

  // Render badge only on dashboard
  const renderBadge = () => {
    if (step === APP_STEPS.DASHBOARD) {
      return dataSource === DATA_SOURCES.SAMPLE ? (
        <span className="badge sample">📊 Using Sample Data</span>
      ) : dataSource === DATA_SOURCES.UPLOADED ? (
        <span className="badge uploaded">📁 Using Uploaded CSV</span>
      ) : null
    }
    return null
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ padding: '60px 20px' }}>
          <LoadingSpinner message="Loading CashSight..." />
        </div>
      )
    }
    

    if (error) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ color: '#dc3545' }}>Error Loading Data</h2>
          <p style={{ color: '#666' }}>{error}</p>
          <button
            className="btn btn-primary"
            onClick={handleRefresh}
          >
            🔄 Retry
          </button>
        </div>
      )
    }

    switch (step) {
      case APP_STEPS.UPLOAD:
        return (
          <CSVUploader
            onUpload={handleFileUpload}
            onUseSample={handleUseSample}
          />
        )

      case APP_STEPS.MAPPING:
        return (
          <ColumnMapper
            files={uploadedFiles}
            onComplete={handleMappingComplete}
            onBack={() => setStep(APP_STEPS.UPLOAD)}
          />
        )

      case APP_STEPS.VALIDATION:
        return (
          <DataQualityReport
            data={mappedData}
            validationResult={validationResult}
            onComplete={handleValidationComplete}
            onBack={() => setStep(APP_STEPS.MAPPING)}
          />
        )

      case APP_STEPS.DASHBOARD:
        return (
          <Dashboard
            onViewExceptions={handleViewExceptions}
            onViewMatches={handleViewMatches}
            onViewAudit={handleViewAudit}
            dataSource={dataSource}
            onRefresh={handleRefresh}
          />
        )

      case APP_STEPS.EXCEPTIONS:
        return (
          <ExceptionInbox
            onBack={handleBackToDashboard}
          />
        )

      case APP_STEPS.MATCHES:
        return (
          <MatchInbox
            onBack={handleBackToDashboard}
          />
        )

      case APP_STEPS.AUDIT:
        return (
          <AuditPage
            onBack={handleBackToDashboard}
          />
        )
      
      case APP_STEPS.TAX:
        return (
        <TaxAnalyzer 
          onBack={handleBackToDashboard} 
        />
      )

      case APP_STEPS.REPORTS:
        return (
        <ReportsPage 
          onBack={handleBackToDashboard} 
        />
      )

      default:
        return <Navigate to="/" replace />
    }
  }

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header with Hamburger and Actions */}
      <Header
        title={APP_CONFIG.name}
        subtitle={APP_CONFIG.description}
        onMenuClick={toggleSidebar}
        actions={renderHeaderActions()}
        badge={renderBadge()}
        dataSource={dataSource}
      />

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar (toggleable) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentView={currentView}
          onNavigate={handleNavigate}
          dataSource={dataSource}
          onRefresh={handleRefresh}
          onUpload={handleUploadNewData}
          onLoadSample={handleUseSample}
          exceptionsCount={exceptionsCount}
          matchesCount={matchesCount}
        />

        <main className="app-main" style={{ flex: 1, padding: '20px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppWrapper />} />
              <Route path="/dashboard" element={<AppWrapper />} />
              <Route path="/upload" element={<AppWrapper />} />
              <Route path="/mapping" element={<AppWrapper />} />
              <Route path="/validation" element={<AppWrapper />} />
              <Route path="/exceptions" element={<AppWrapper />} />
              <Route path="/matches" element={<AppWrapper />} />
              <Route path="/audit" element={<AppWrapper />} />
              <Route path="/tax" element={<AppWrapper />} />
              <Route path="/reports" element={<AppWrapper />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AppProvider>
    </ThemeProvider>
  )
}