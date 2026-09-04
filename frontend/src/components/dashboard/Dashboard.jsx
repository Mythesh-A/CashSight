/**
 * Dashboard - Main reconciliation dashboard with forecast
 */
import React, { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { Button, Card, LoadingSpinner, ErrorBoundary, StatusBadge } from '../common'
import MetricsPanel from './MetricsPanel'
import CashPositionCard from './CashPositionCard'
import MatchSummaryCard from './MatchSummaryCard'
import ExceptionSummaryCard from './ExceptionSummaryCard'
import ForecastChart from '../forecast/ForecastChart'
import { useCashPosition, useExceptions, useForecast } from '../../hooks'

export default function Dashboard({ 
  onViewExceptions, 
  onViewMatches, 
  dataSource, 
  onRefresh 
}) {
  const { refreshData } = useData()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reconciliationData, setReconciliationData] = useState(null)
  const [cashPosition, setCashPosition] = useState(null)
  const [exceptions, setExceptions] = useState([])
  
  const { 
    data: forecastData, 
    loading: forecastLoading, 
    error: forecastError,
    refetch: refetchForecast,
    getChartData,
    getSummary
  } = useForecast({ autoFetch: true })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [reconcile, cash, exceptions] = await Promise.all([
        fetch('http://localhost:5000/api/reconcile').then(r => r.json()),
        fetch('http://localhost:5000/api/cash-position').then(r => r.json()),
        fetch('http://localhost:5000/api/exceptions').then(r => r.json()),
      ])

      setReconciliationData(reconcile)
      setCashPosition(cash)
      setExceptions(exceptions.exceptions || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadDashboardData()
    await refetchForecast()
    if (onRefresh) onRefresh()
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 20px' }}>
        <LoadingSpinner message="Loading dashboard data..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ color: '#dc3545' }}>Error Loading Dashboard</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <Button variant="primary" onClick={loadDashboardData}>
          🔄 Retry
        </Button>
      </div>
    )
  }

  const matches = reconciliationData?.matches || []
  const exceptionList = reconciliationData?.exceptions || []
  const totalMatches = matches.length
  const totalExceptions = exceptionList.length
  const totalSettlements = totalMatches + totalExceptions

  const chartData = getChartData()
  const forecastSummary = getSummary()

  const dataSourceLabel = dataSource === 'sample' ? '📊 Using Sample Data' : '📁 Using Uploaded CSV'
  const dataSourceStatus = dataSource === 'sample' ? 'info' : 'success'

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>📊 Reconciliation Dashboard</h2>
          <div style={{ marginTop: '4px' }}>
            <StatusBadge 
              status={dataSourceStatus} 
              label={dataSourceLabel}
              size="small"
            />
            <span style={{ marginLeft: '12px', fontSize: '13px', color: '#666' }}>
              {totalSettlements} total settlements • {totalMatches} matched • {totalExceptions} exceptions
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="small" onClick={handleRefresh} icon="🔄">
            Refresh
          </Button>
          <Button 
            variant="success" 
            size="small" 
            onClick={onViewMatches} 
            icon="✅"
          >
            View Matches ({totalMatches})
          </Button>
          <Button 
            variant="warning" 
            size="small" 
            onClick={onViewExceptions} 
            icon="🚨"
          >
            View Exceptions ({totalExceptions})
          </Button>
        </div>
      </div>

      {/* Cash Position Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <CashPositionCard
          title="💰 Current Cash"
          amount={cashPosition?.current_cash || 0}
          subtitle={`${cashPosition?.reconciled_count || 0} matched settlements`}
          variant="success"
        />
        <CashPositionCard
          title="⏳ Pending"
          amount={cashPosition?.pending_settlements || 0}
          subtitle={`${cashPosition?.pending_count || 0} pending settlements`}
          variant="warning"
        />
        <CashPositionCard
          title="📋 Total Expected"
          amount={cashPosition?.total_expected || 0}
          displayText={cashPosition?.pending_display || `${cashPosition?.reconciled_count || 0} matched + ${cashPosition?.pending_count || 0} pending`}
          variant="primary"
        />
      </div>

      {/* ============================================================ */}
      {/* FORECAST SECTION - Chart first, then summary below */}
      {/* ============================================================ */}

      {/* Forecast Chart */}
      <div style={{ marginBottom: '16px' }}>
        <ForecastChart 
          data={forecastData}
          loading={forecastLoading}
          error={forecastError}
          onRefresh={refetchForecast}
        />
      </div>

      {/* 🔥 Forecast Summary Cards - Below the chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: '14px 18px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#666' }}>💰 Starting Cash</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d47a1' }}>
            ₹{forecastData?.current_cash?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}
          </span>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '14px 18px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#666' }}>⏳ Pending Amount</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#e65100' }}>
            ₹{forecastData?.pending_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}
          </span>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '14px 18px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#666' }}>📈 Projected (Day 7)</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
            ₹{forecastData?.percentiles?.p50?.[6]?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}
          </span>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '14px 18px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#666' }}>📋 Total Pending</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d47a1' }}>
            {forecastData?.pending_count || 0} settlements
          </span>
        </div>
      </div>

      {/* P5/P50/P95 Quick Stats */}
      {forecastData?.percentiles && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <div style={{
            background: '#ff9800',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>P5 — Downside</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              ₹{forecastData.percentiles.p5?.[6]?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
            </div>
          </div>
          <div style={{
            background: '#2196F3',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>P50 — Expected</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              ₹{forecastData.percentiles.p50?.[6]?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
            </div>
          </div>
          <div style={{
            background: '#dc3545',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>P95 — Upside</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              ₹{forecastData.percentiles.p95?.[6]?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
            </div>
          </div>
        </div>
      )}

      {/* Forecast Disclaimer */}
      {forecastData?.forecast_type === 'synthetic' && (
        <div style={{
          padding: '12px 16px',
          background: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffc107',
          fontSize: '12px',
          color: '#856404',
          marginBottom: '24px',
        }}>
          ⚠️ {forecastData?.note || 'Synthetic forecast for demonstration. Insufficient historical data for Monte Carlo simulation.'}
        </div>
      )}

      {/* ============================================================ */}
      {/* END OF FORECAST SECTION */}
      {/* ============================================================ */}

      {/* Metrics Panel */}
      <div style={{ marginBottom: '24px' }}>
        <MetricsPanel
          matchRate={cashPosition?.match_rate || 0}
          totalSettlements={totalSettlements}
          matched={totalMatches}
          exceptions={totalExceptions}
          dataSource={dataSource}
        />
      </div>

      {/* Match and Exception Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '24px',
      }}>
        <MatchSummaryCard
          count={totalMatches}
          amount={cashPosition?.current_cash || 0}
          matches={matches.slice(0, 5)}
          onViewAll={onViewMatches}
        />
        <ExceptionSummaryCard
          count={totalExceptions}
          amount={cashPosition?.pending_settlements || 0}
          exceptions={exceptionList.slice(0, 5)}
          onViewAll={onViewExceptions}
        />
      </div>

      {/* Footer Stats */}
      <div style={{
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
      }}>
        <div>
          <strong>Last Updated:</strong> {new Date().toLocaleString()}
        </div>
        <div>
          <strong>Data Source:</strong> {dataSource === 'sample' ? 'Sample Data' : 'Uploaded CSV'}
        </div>
        <div>
          <strong>CashSight</strong> — AI Finance Controller
        </div>
      </div>
    </div>
  )
}