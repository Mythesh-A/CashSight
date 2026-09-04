/**
 * main.jsx - Application Entry Point
 * CashSight - Reconciliation-grounded probabilistic cash forecasting
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// ============================================
// RENDER APPLICATION
// ============================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// ============================================
// CONSOLE LOG (Development)
// ============================================

if (import.meta.env.DEV) {
  console.log('💰 CashSight v3.0')
  console.log('📊 Reconciliation-grounded probabilistic cash forecasting')
  console.log('🔧 Development Mode')
}