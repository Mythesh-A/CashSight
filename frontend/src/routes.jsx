/**
 * routes.jsx - Route Configuration
 * CashSight - Reconciliation-grounded probabilistic cash forecasting
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import App from './App'

// ============================================
// ROUTE PATHS
// ============================================

export const ROUTE_PATHS = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  MAPPING: '/mapping',
  VALIDATION: '/validation',
  EXCEPTIONS: '/exceptions',
  MATCHES: '/matches',  // 🔥 ADD THIS
}

// ============================================
// ROUTE COMPONENT
// ============================================

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<App />} />
      <Route path="/upload" element={<App />} />
      <Route path="/mapping" element={<App />} />
      <Route path="/validation" element={<App />} />
      <Route path="/exceptions" element={<App />} />
      <Route path="/matches" element={<App />} />  {/* 🔥 ADD THIS */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ============================================
// ROUTE CONSTANTS
// ============================================

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  MAPPING: '/mapping',
  VALIDATION: '/validation',
  EXCEPTIONS: '/exceptions',
  MATCHES: '/matches',  // 🔥 ADD THIS
}

export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊' },
  { path: ROUTES.UPLOAD, label: 'Upload', icon: '📤' },
  { path: ROUTES.EXCEPTIONS, label: 'Exceptions', icon: '🚨' },
  { path: ROUTES.MATCHES, label: 'Matches', icon: '✅' },  // 🔥 ADD THIS
]

// ============================================
// ROUTE GUARDS
// ============================================

export const requiresAuth = (path) => {
  const protectedRoutes = [
    ROUTES.DASHBOARD,
    ROUTES.EXCEPTIONS,
    ROUTES.MATCHES,  // 🔥 ADD THIS
  ]
  return protectedRoutes.includes(path)
}

export const getRouteTitle = (path) => {
  const titles = {
    [ROUTES.HOME]: 'Dashboard',
    [ROUTES.DASHBOARD]: 'Dashboard',
    [ROUTES.UPLOAD]: 'Upload Data',
    [ROUTES.MAPPING]: 'Map Columns',
    [ROUTES.VALIDATION]: 'Data Quality Report',
    [ROUTES.EXCEPTIONS]: 'Exception Center',
    [ROUTES.MATCHES]: 'Matched Records',  // 🔥 ADD THIS
  }
  return titles[path] || 'CashSight'
}

export default AppRoutes