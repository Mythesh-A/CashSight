/**
 * Header - App header component with hamburger menu
 */
import React from 'react'
import Button from './Button'

export default function Header({
  title = 'CashSight',
  actions = [],
  badge = null,
  onRefresh = null,
  onMenuClick = null,
}) {
  const actionItems = Array.isArray(actions) ? actions : []

  return (
    <header style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      padding: '16px 24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Left side - Hamburger + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onMenuClick}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
          >
            <span style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '2px' }} />
          </button>

          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
              {title}
            </h1>
            
              <p style={{ margin: '2px 0 0 0', opacity: 0.7, fontSize: '16px' }}>
                Intelligent Finance Operations
              </p>
          </div>
        </div>

        {/* Right side - Actions + Badge */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {actionItems.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'primary'}
              size="small"
              onClick={action.onClick}
              icon={action.icon}
            >
              {action.label}
            </Button>
          ))}
          {badge}
        </div>
      </div>
    </header>
  )
}