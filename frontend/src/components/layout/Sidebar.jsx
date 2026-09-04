/**
 * Sidebar - Toggleable navigation sidebar
 */
import React from 'react'

export default function Sidebar({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  onRefresh,
  onUpload,
  onLoadSample,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: '✅',
      path: '/matches',
    },
    {
      id: 'exceptions',
      label: 'Exceptions',
      icon: '🚨',
      path: '/exceptions',
    },
    {
      id: 'audit',
      label: 'Audit Log',
      icon: '📋',
      path: '/audit',
    },
    {
      id: 'tax',
      label: 'Tax Analyzer',
      icon: '🧾',
      path: '/tax',
    },
    {
      id: 'reports',
      label: 'Download Reports',
      icon: '📄',
      path: '/reports',
    },
  ]

  // If sidebar is closed, render nothing
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          height: '100vh',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          boxShadow: '4px 0 30px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.3s ease',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          }}
        >
          ✕
        </button>

        {/* Brand */}
        <div
          style={{
            padding: '0 24px 20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>💰</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>CashSight</h2>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navItems.map((item) => {
              const isActive = currentView === item.id
              return (
                <li key={item.id} style={{ marginBottom: '2px' }}>
                  <button
                    onClick={() => {
                      onNavigate(item.id, item.path)
                      onClose()
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                      gap: '10px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <button
            onClick={() => { onLoadSample(); onClose() }}
            style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            }}
          >
            <span>🔄</span> Load Sample
          </button>
          <button
            onClick={() => { onUpload(); onClose() }}
            style={{
              padding: '8px 12px',
              background: 'rgba(33, 150, 243, 0.2)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              borderRadius: '6px',
              color: '#90caf9',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(33, 150, 243, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(33, 150, 243, 0.2)'
            }}
          >
            <span>📤</span> Upload New Data
          </button>
          <button
            onClick={() => { onRefresh(); onClose() }}
            style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            }}
          >
            <span>🔄</span> Refresh Data
          </button>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </aside>
    </>
  )
}